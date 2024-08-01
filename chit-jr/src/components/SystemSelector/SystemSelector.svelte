<script>
    // @ts-nocheck

    import { onMount } from "svelte";
    import {
        chatState,
        chatTimeline,
        contextOverflow,
        contextTotal,
        incomingQuery,
        system_prompts,
    } from "../../stores/chatStatus";
    import {
        cancelInference,
        responseInProgress,
        runQuery,
    } from "../../api/api";

    import Recycle from "carbon-icons-svelte/lib/Recycle.svelte";
    import CloseLarge from "carbon-icons-svelte/lib/CloseLarge.svelte";
    import WarningAltFilled from "carbon-icons-svelte/lib/WarningAltFilled.svelte";
    import { refreshChatResponse } from "../../lib/chat_functions";
    import {
        Copy,
        Erase,
        Gears,
        MachineLearning,
        StopSignFilled,
    } from "carbon-icons-svelte";
    import Settings from "./Settings/Settings.svelte";

    let showSettings = true;

    function onBtnClear() {
        $incomingQuery = "";
        $chatTimeline = [];
    }

    function copyChatToClipboard() {
        const chatText = $chatTimeline
            .slice($chatState.system_prompt_id === "general" ? 0 : 1)
            .map(({ role, content }) => {
                if (role === "user") {
                    return "> " + content;
                } else {
                    return content;
                }
            })
            .join("\n\n---------------------------\n\n");

        navigator.clipboard.writeText(chatText);
    }
</script>

<div
    id="SystemSelector"
    class="p-2"
>
    <select
        class="w-full p-2 rounded-md"
        bind:value={$chatState.system_prompt_id}
    >
        <option value="general">❓ General</option>

        {#each Object.keys($system_prompts).filter((k) => k !== "general") as system_key}
            <option value={system_key}>
                {$system_prompts[system_key].name}
            </option>
        {/each}
    </select>
    <div class="flex pt-2 gap-1">
        <div class="flex-shrink flex gap-2 place-items-center">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                title="Settings"
                class="hover:text-white"
                on:click={() => {
                    showSettings = !showSettings;
                }}
            >
                <Gears />
            </div>
        </div>
        {#if $contextOverflow}
            <div
                class="ctx-overflow flex-shrink flex gap-2 place-items-center"
                title="Selected text clobbers the system context. Results will be unexpected."
            >
                <WarningAltFilled size={32} />
                <div>Context overflow ({parseInt($contextTotal / 1024)}K)</div>
            </div>
        {/if}
        <div class="flex flex-grow place-content-end gap-2">
            {#if !$responseInProgress}
                {#if $chatState.system_prompt_id !== "general" && $chatTimeline.length > 0 && $chatTimeline[0].role === "user"}
                    <button
                        id="btnClear"
                        on:click={() => {
                            $chatTimeline = [...$chatTimeline.slice(0, 1)];
                            refreshChatResponse();
                        }}
                    >
                        <MachineLearning />
                        Run
                    </button>
                {/if}
                {#if $chatTimeline.length > 0}
                    <button
                        id="btnClear"
                        on:click={copyChatToClipboard}
                    >
                        <Copy />
                        Copy
                    </button>
                {/if}
            {:else}
                <button
                    id="btnAbort"
                    on:click={cancelInference}
                >
                    <StopSignFilled />
                    Abort
                </button>
            {/if}
            <button
                id="btnClear"
                disabled={$responseInProgress}
                on:click={onBtnClear}
            >
                <Erase />
                Clear
            </button>
        </div>
    </div>
    {#if showSettings}
        <Settings />
    {/if}
</div>

<style>
    #SystemSelector {
        position: sticky;
        top: 0;
        z-index: 100;
        padding-block: 1em;
        /* background: var(--color-background, #f0f); */
        background: linear-gradient(0deg, rgb(60, 0, 60), rgb(69, 36, 0));
        box-shadow: 0 1em 1em rgba(0, 0, 0, 0.5);
        border-bottom-left-radius: 1em;
        border-bottom-right-radius: 1em;

        transition: all 0.5s linear;
    }

    #SystemSelector select,
    #SystemSelector option {
        background-color: #000;
        color: white;
        font-weight: 700;
    }

    button {
        background-color: #530;
        padding-inline: 1em;
        box-shadow: 0 0.5em 0.5em rgba(0, 0, 0, 0.5);
        /* color: white; */
        font-weight: 200;
        border-radius: 0.5em;
        display: flex;
        gap: 0.5em;
        place-items: center;
        &:hover {
            color: white;
        }
    }

    .ctx-overflow {
        color: #ff0;
        font-weight: bold;
        text-shadow: 0 0 10px red;
    }
</style>
