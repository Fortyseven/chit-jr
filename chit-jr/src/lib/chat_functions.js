import { get } from "svelte/store";
import { runQuery } from "../api/api";
import { chatTimeline } from "../stores/chatStatus";

export async function refreshChatResponse() {
    if (get(chatTimeline)[get(chatTimeline).length - 1]?.role === "assistant") {
        chatTimeline.update((timeline) => {
            timeline.pop();
            return timeline;
        });
    }
    await runQuery();
}
