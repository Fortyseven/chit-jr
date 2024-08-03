<script>
    import { onMount } from "svelte";
    import { runQuery } from "../../api/api";
    import { chatTimeline } from "../../stores/chatStatus";
    import { refreshChatResponse } from "../../lib/chat_functions";
    import { Recycle, Reset, SendAltFilled } from "carbon-icons-svelte";

    let chatEntry = "";
    let chatEntryEl;

    let pendingQuery = "";

    onMount(() => {
        focusEntryBox();
    });

    async function onBtnSendChatEntry() {
        if (chatEntry) {
            chatEntry = chatEntry.trim();
        }

        if (chatEntry === "/clear") {
            chatTimeline.set([]);
            chatEntry = "";
            return;
        }

        try {
            pendingQuery = chatEntry;
            chatEntry = "";
            await runQuery(pendingQuery);
        } catch {
            chatEntry = pendingQuery;
        } finally {
            focusEntryBox();
            // scroll to bottom
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    function focusEntryBox() {
        if (chatEntryEl) {
            chatEntryEl.focus();
        }
    }
</script>

<div class="my-4 pt-2">
    <textarea
        id="ChatEntry"
        bind:value={chatEntry}
        bind:this={chatEntryEl}
        on:keydown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onBtnSendChatEntry();
            } else if (e.key === "e" && e.ctrlKey && $chatTimeline.length > 0) {
                refreshChatResponse();
                return;
            }
        }}
        class="w-full rounded-md p-2 h-full border"
        placeholder={$chatTimeline.length > 0
            ? "Follow-up query..."
            : "Submit a query..."}
    />
    <div
        id="ChatEntryButtons"
        class="flex gap-2 place-content-end pt-2"
    >
        {#if $chatTimeline.length > 0}
            <button on:click={refreshChatResponse}>
                <Reset /> Refresh
            </button>
        {/if}
        {#if chatEntry}
            <button on:click={onBtnSendChatEntry}
                ><SendAltFilled /> Submit
            </button>
        {/if}
    </div>
</div>

<style
    lang="scss"
    global
>
    #ChatEntry {
        background-color: transparent;
        color: var(--color-primary, #f0f);
        outline: 1px solid var(--color-primary, #f0f);
        border: none;
    }

    #ChatEntry::placeholder {
        opacity: 0.4;
    }

    #ChatEntry:focus {
        outline: 1px solid var(--color-primary, #f0f);
    }

    #ChatEntryButtons {
        button {
            padding-inline: 0.25em;
            font-weight: 200;
            display: flex;
            gap: 0.5em;
            place-items: center;
            &:hover {
                color: white;
            }
        }
    }
</style>
