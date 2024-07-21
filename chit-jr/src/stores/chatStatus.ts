import { derived, Writable, writable } from "svelte/store";

const OLLAMA_MODEL = "gemma2:latest";

/* --------------------------------------------------- */
type ChatStateValues = {
    num_ctx: number;
    temperature: number;
};

type ChatState = {
    model_name: string;
    system_prompt_id: string;
    values: ChatStateValues;
};

export const chatState: Writable<ChatState> = writable({
    model_name: OLLAMA_MODEL,
    system_prompt_id: "summarize",
    values: {
        num_ctx: 8192,
        temperature: 0.3,
    },
});

/* --------------------------------------------------- */
export const chatTimeline = writable([]);

/* --------------------------------------------------- */

export const system_prompts = writable({});
export const incomingQuery = writable(undefined);

export const contextTotal = derived(
    [incomingQuery, system_prompts, chatState],
    ([$incomingQuery, $system_prompts, $chatState]) => {
        let query_len = $incomingQuery?.length || 0;
        let system_len =
            $system_prompts[$chatState.system_prompt_id]?.length || 0;

        console.log("query_len", query_len, system_len);
        return query_len + system_len;
    }
);

export const contextOverflow = derived(contextTotal, ($contextTotal) => {
    return $contextTotal >= 8192;
});
