import analysis from "./analysis.js";
import translate from "./translate.js";
import sdprompt from "./sdprompt.js";
import summarize from "./summarize.js";

const SYSTEM_PROMPTS = { summarize, translate, sdprompt, analysis };

window.SYSTEM_PROMPTS = SYSTEM_PROMPTS;

export default SYSTEM_PROMPTS;
