<script>
    // @ts-nocheck

    import {
        chatState,
        chatTimeline,
        incomingQuery,
        system_prompts,
    } from "./stores/chatStatus";

    import { onMount } from "svelte";
    import ChatStream from "./components/ChatStream/ChatStream.svelte";
    import SystemSelector from "./components/SystemSelector/SystemSelector.svelte";
    import { insertUserMessage, runQuery } from "./api/api";
    import {
        restoreLocalStorageStores,
        setLocalStorageSubscriptions,
    } from "./lib/stores_persist";

    function switchSystemPrompt(system) {
        $chatState.system_prompt_id = system;
    }

    function setupListeners() {
        browser.runtime.onMessage.addListener(
            async ({ action, text, windowId, system, s_prompts }) => {
                // we do this once to import what system prompts are available to support
                if (windowId && action === "initChitJr") {
                    browser.windows.getCurrent().then(async (currentWindow) => {
                        if (windowId === currentWindow.id) {
                            await restoreLocalStorageStores();
                            await setLocalStorageSubscriptions();

                            console.log("initChitJr:", s_prompts);
                            $system_prompts = s_prompts;
                        }
                    });
                }
                // when the user selects text and hits the context menu, we capture it here
                if (windowId && action === "selectedTextChitJr") {
                    browser.windows.getCurrent().then(async (currentWindow) => {
                        if (windowId === currentWindow.id) {
                            console.log("selectedTextChitJr:", text, system);
                            $system_prompts = s_prompts;
                            switchSystemPrompt(system);
                            $incomingQuery = text.trim();
                            $chatTimeline = [];
                            if (system !== "general") {
                                await runQuery($incomingQuery);
                            } else {
                                insertUserMessage($incomingQuery);
                            }
                        }
                    });
                }
            },
        );
    }

    onMount(setupListeners);
</script>

<SystemSelector />
<main class="p-1 pt-2 m-2">
    <ChatStream />
</main>

<style
    lang="scss"
    global
>
    main {
        min-height: 100%;
    }
</style>
