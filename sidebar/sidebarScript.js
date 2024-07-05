const md = markdownit({
    html: true,
    linkify: true,
    typographer: true,
});

const OLLAMA_ENDPOINT = "http://localhost:11434";
const OLLAMA_MODEL = "gemma2:latest";

let inProgress = false;
let request_text = "";
let selectedSystem = document.getElementById("systemPrompt").value;

window.onload = function () {
    // populate #systemPrompt select with window.SYSTEM_PROMPTS
    const select = document.getElementById("systemPrompt");
    for (const key in window.SYSTEM_PROMPTS) {
        const option = document.createElement("option");
        option.value = key;
        option.text = window.SYSTEM_PROMPTS[key].name;
        select.appendChild(option);
    }
};

// the front door
browser.runtime.onMessage.addListener(
    async ({ action, text, windowId, system }) => {
        if (windowId && action === "selectedTextChitJr") {
            browser.windows.getCurrent().then((currentWindow) => {
                if (windowId === currentWindow.id) {
                    if (inProgress) {
                        console.warn("Request in progress, ignored...");
                        return;
                    }

                    document.getElementById("systemPrompt").value = system;
                    selectedSystem = system;

                    updateRequestText(text);
                    reloadQuery();
                }
            });
        }
    }
);

// bind #reload to reloadQuery
document.getElementById("reload").addEventListener("click", reloadQuery);

function reloadQuery() {
    if (inProgress) {
        return;
    }
    if (request_text) {
        inProgress = true;
        clearResponse();
        document.getElementById("result").classList.add("in-progress");

        selectedSystem = getSystemPromptId();

        olGenerate().then((ol_response) => {
            document.getElementById("result").innerHTML =
                md.render(ol_response);
        });
    }
}

async function olGenerate() {
    // const prompt = buildPrompt(request_text);
    const options = {
        temperature: 0.2,
        num_ctx: 8192,
    };
    const system = window.SYSTEM_PROMPTS[selectedSystem].prompt;

    try {
        const response = await fetch(`${OLLAMA_ENDPOINT}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                system,
                prompt: request_text,
                options,
                stream: false,
            }),
        });
        const data = await response.json();
        return data.response;
    } catch (error) {
        return error;
    } finally {
        inProgress = false;
        document.getElementById("result").classList.remove("in-progress");
    }
}

function updateRequestText(text) {
    request_text = text;
    document.getElementById("copied_text").innerHTML = text;
}

function clearResponse() {
    document.getElementById("result").innerHTML = "";
}

function getSystemPromptId() {
    const select = document.getElementById("systemPrompt");
    return select.options[select.selectedIndex].value;
}
