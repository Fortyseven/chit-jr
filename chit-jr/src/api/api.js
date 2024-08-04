import { get, writable, Writable } from "svelte/store";

import { chatState, chatTimeline, system_prompts } from "../stores/chatStatus";

export const OLLAMA_ENDPOINT = "http://localhost:11434";
export const DEFAULT_TEMP = 0.3;

const responseInProgress_AbortController = writable(null);
let errorMessage = writable(undefined);

export const pendingResponse = writable({
    role: "assistant",
    content: "",
});
export const responseInProgress = writable(false);
export const pendingContinuedAssistantChat = writable(false);

export const wasAborted = writable(false);

const utf8Decoder = new TextDecoder("utf-8");

/**
 * Append the response fragment to the pending response.
 * @param response_fragment
 */
function _updatePendingResponse(response_fragment) {
    pendingResponse.update((pr) => {
        pr.content += response_fragment;
        return pr;
    });
}

/**
 * Clear the pending response.
 */
function _clearPendingResponse() {
    pendingResponse.set({
        role: "assistant",
        content: "",
    });
}

/* -------------------------------------------------------- */

export const cancelInference = () => {
    const ac = get(responseInProgress_AbortController);

    if (ac) {
        console.log("🛑 Cancelling inference: ", ac);
        ac.abort();

        responseInProgress_AbortController.set(null);
        responseInProgress.set(false);
        wasAborted.set(true);
        _clearPendingResponse();
    }
};

/* -------------------------------------------------------- */

// export const OL_listLocalModels = async () => {
//     const response = await fetch(`${get(appState).apiEndpoint}/api/tags`);
//     return response.json();
// };

// export const refreshModelList = async () => {
//     console.log("Refreshing models");
//     const response = await OL_listLocalModels();

//     models.set(response.models.sort((a, b) => a.model.localeCompare(b.model)));

//     // console.log('Models: ', get(models));
// };

/* -------------------------------------------------------- */
function _getChatParamObject() {
    const chat_parameters = get(chatState).values;

    let new_chat_parameters = {};

    for (const key of Object.keys(chat_parameters)) {
        if (chat_parameters[key] !== undefined && chat_parameters[key] != -1) {
            try {
                new_chat_parameters[key] = parseFloat(chat_parameters[key]);
            } catch (e) {
                new_chat_parameters[key] = chat_parameters[key];
            }
        }
    }

    return new_chat_parameters;
}

/* -------------------------------------------------------- */
export function insertUserMessage(user_message) {
    const msg_packet = {
        role: "user",
        content: user_message,
    };

    chatTimeline.update((timeline) => {
        timeline.push(JSON.parse(JSON.stringify(msg_packet)));
        return timeline;
    });
}

function popPriorErrors()
{
    chatTimeline.update((timeline) => {
        let new_timeline = timeline.filter((msg) => msg.role !== "error");
        return new_timeline;
    });
}

/* -------------------------------------------------------- */
/* Returns null or the response from the server.            */
export async function OL_chat(
    user_message = null,
    continue_chat = false,
    pasted_image = undefined
) {
    popPriorErrors();

    if (!get(chatState)?.model_name) {
        return {
            role: "error",
            content: "No model selected.",
        };
    }


    if (user_message) {
        insertUserMessage(user_message);
    }

    try {
        const ac = new AbortController();

        // sets the pending message index to expect for the response

        const body = {
            model: get(chatState).model_name,
            stream: true,
            messages: [...get(chatTimeline)],
            options: {
                ..._getChatParamObject(),
            },
        };

        const sys_prompt =
            get(chatState)?.system_prompt_id === "general"
                ? undefined
                : get(system_prompts)[get(chatState)?.system_prompt_id].prompt;

        console.log("sys_prompt", sys_prompt);

        if (sys_prompt) {
            // insert the system prompt at the beginning of the chat
            body.messages = [
                {
                    role: "system",
                    content: sys_prompt,
                },
                ...body.messages,
            ];
        } else {
            body.options.temperature = DEFAULT_TEMP;
        }

        _clearPendingResponse();
        // wasAborted.set(false);
        responseInProgress.set(true);
        responseInProgress_AbortController.set(ac);

        console.log("OL_chat REQUEST body: ", body);

        const stream = await fetch(`${OLLAMA_ENDPOINT}/api/chat`, {
            signal: ac.signal,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("OL_chat RESPONSE stream: ", stream);

        if (stream.status >= 300) {
            console.error("Error connecting to server: " + stream.body);
            errorMessage.set(stream.statusText);
            return null;
        }

        for await (const chunk of stream.body) {
            const objects = utf8Decoder
                .decode(chunk)
                .split("\n")
                .filter((x) => x.length > 0)
                .map((x) => JSON.parse(x));

            for (const obj of objects) {
                if (obj.message) {
                    _updatePendingResponse(obj.message.content);
                }
            }
        }

        responseInProgress.set(false);

        let pending = get(pendingResponse);

        return pending;
    } catch (err) {
        if (err?.name !== "AbortError") {
            console.error("OL_chat error: ", err);
            return {
                role: "error",
                content: `Error connecting to server: ${err?.name}: ${err?.message}`,
            };

        } else {
            return null;
        }
    } finally {
        responseInProgress_AbortController.set(null);
        responseInProgress.set(false);
    }
}

/* -------------------------------------------------------- */
export async function runQuery(message = undefined) {
    if (get(chatState).system_prompt_id) {
        try {
            const result = await OL_chat(message);
            console.log("RESULTS", result);

            chatTimeline.update((timeline) => {
                timeline.push(result);
                return timeline;
            });
        } catch (err) {
            console.error("runQuery error: ", err);
            errorMessage.set(err.message);
        } finally {
            console.log("runQuery END - chatTimeline", get(chatTimeline));
        }
    }
}

// /**
//  * Get the details of a model from the server.
//  * @param {*} model_name
//  * @returns {Promise} A promise that resolves to the model details.
//  */
// export async function OL_model_details(model_name) {
//     try {
//         const response = await fetch(`${get(appState).apiEndpoint}/api/show`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 name: model_name,
//             }),
//         });

//         let details = await response.json();

//         return details;
//     } catch (err) {
//         console.error("OL_model_details error: ", err);
//         throw Error("Error connecting to server: " + err.message);
//     }
// }

// function _parseConfigString(configString) {
//     const configArray = configString.split("\n");
//     const configObject = {};

//     configArray.forEach((entry) => {
//         const [key, value] = entry.split(/\s+/);
//         if (key && value !== undefined) {
//             configObject[key] = isNaN(value) ? value : parseFloat(value);
//         }
//     });

//     return configObject;
// }

// export async function updateModelDetails(model_name) {
//     chatState_resetToDefaults();

//     await OL_model_details(model_name).then((details) => {
//         chatState.update((state) => {
//             if (!get(appState).ui.lock_system && details.system) {
//                 state.system_prompt = details.system;
//             }

//             // iterate state.values properties and replace
//             // with values from details.parameters

//             if (!get(appState).ui.lock_values && details.parameters) {
//                 const params = _parseConfigString(details.parameters);
//                 for (const key of Object.keys(state.values)) {
//                     if (params[key]) {
//                         console.log("PARAM", key, params[key]);
//                         state.values[key] = params[key];
//                     }
//                 }
//             }

//             return state;
//         });
//     });
// }

// export const appendToTimeline = (message) => {
//     get(chatTimeline).push(message);
