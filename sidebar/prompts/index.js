import analysis from "./analysis.js";
import translate from "./translate.js";
import sdprompt from "./sdprompt.js";
import summarize from "./summarize.js";
import extract_and_infer from "./extract-and-infer.js";
import retort from "./retort.js";

const SYSTEM_PROMPTS = {
    summarize,
    translate,
    sdprompt,
    analysis,
    extract_and_infer,
    retort,
};

window.SYSTEM_PROMPTS = SYSTEM_PROMPTS;

export default SYSTEM_PROMPTS;
