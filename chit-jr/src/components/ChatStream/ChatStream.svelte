<script>
    import { pendingResponse, responseInProgress } from "../../api/api";
    import { chatTimeline } from "../../stores/chatStatus";
    import MarkdownBlock from "../MarkdownBlock.svelte";
</script>

<section
    id="ChatStream"
    class="flex flex-col"
>
    {#each $chatTimeline as { role, content }, i}
        {#key i}
            <div class="p-2 select-text rounded-md {role} flex-auto chat-row">
                {#if role === "user"}
                    {content}
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

    {#if $chatTimeline.length > 0}
        <div class="my-4 pt-2">
            <textarea
                id="ChatEntry"
                class="w-full rounded-md p-2 h-full border"
                placeholder="Follow-up query..."
            />
        </div>
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

    #ChatEntry {
        /* background-color: #111; */
        background-color: transparent;
        color: var(--color-primary, #f0f);
    }

    #ChatEntry::placeholder {
        opacity: 0.4;
    }

    #ChatEntry:focus {
        /* outline: 1px solid #644; */
    }
</style>
