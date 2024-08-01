import { derived, Writable, writable } from "svelte/store";

// const OLLAMA_MODEL = "gemma2:latest";
//const OLLAMA_MODEL = "mistral-nemo";
// const OLLAMA_MODEL = "llama3:latest";

const OLLAMA_MODEL = "llama3.1:latest";
const OLLAMA_CTX = 64 * 1024;

// const OLLAMA_MODEL = "gemma2:2b";
// const OLLAMA_CTX = 8 * 1024;


// const OLLAMA_CTX = 8192;

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
    system_prompt_id: "general",
    values: {
        num_ctx: OLLAMA_CTX,
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

        return query_len + system_len;
    }
);

export const contextOverflow = derived(contextTotal, ($contextTotal) => {
    return $contextTotal >= OLLAMA_CTX;
});
