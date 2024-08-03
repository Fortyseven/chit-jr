<script>
    import ChatEntry from "./ChatEntry.svelte";

    import {
        pendingResponse,
        responseInProgress,
        runQuery,
    } from "../../api/api";
    import { chatTimeline } from "../../stores/chatStatus";
    import MarkdownBlock from "../MarkdownBlock.svelte";

    const MAX_USER_LEN = 128;

    let chatEntry = "Explain that.";

    async function onBtnSendChatEntry() {
        await runQuery(chatEntry);
    }
</script>

<section
    id="ChatStream"
    class="flex flex-col"
>
    {#each $chatTimeline as { role, content }, i}
        {#key i}
            <div class="p-2 select-text rounded-md {role} flex-auto chat-row">
                {#if role === "user"}
                    {#if content.length > MAX_USER_LEN}
                        {content.slice(0, MAX_USER_LEN)}
                        {#if content.length > MAX_USER_LEN}
                            ...
                        {/if}
                    {:else}
                        {content}
                    {/if}
                {:else if role === "error"}
                    <div class="text-red-500 font-mono">{content}</div>
                {:else}
                    <MarkdownBlock {content} />
                {/if}
            </div>
        {/key}
    {/each}

    {#if $responseInProgress}
        <div
            class="p-2 select-text rounded-md {$pendingResponse.role} flex-auto chat-row"
        >
            <MarkdownBlock content={$pendingResponse.content} />
        </div>
    {/if}

    {#if !$responseInProgress}
        <ChatEntry></ChatEntry>
    {/if}
</section>

<style
    lang="scss"
    global
>
    #ChatStream {
        z-index: 0;
    }
    .user {
        color: white;
        padding-left: 0;
        font-weight: 100;
    }
    .user::before {
        content: "> ";
        opacity: 0.5;
        font-weight: 800;
    }

    .assistant {
        color: #ffd799;

        background-image: linear-gradient(
            140deg,
            rgba(255, 255, 255, 0.055),
            rgba(0, 0, 0, 0.73)
        );
        border-bottom: 1px solid rgba(255, 255, 255, 0.067);
    }
</style>
