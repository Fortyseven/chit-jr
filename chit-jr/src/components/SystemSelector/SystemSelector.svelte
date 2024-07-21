<script>
    import { onMount } from "svelte";
    import {
        chatState,
        contextOverflow,
        contextTotal,
        incomingQuery,
        system_prompts,
    } from "../../stores/chatStatus";

    function onBtnTest() {
        $incomingQuery =
            "Latest reports on COVID-19 in India suggest that the situation is improving, however the situation is still critical in some states. Over 100,000 new cases are being reported daily. The government has imposed a lockdown in some states to curb the spread of the virus. The vaccination drive is also in full swing. The government has also announced a financial package to help the poor and needy. The situation is being closely monitored by the government. The government, however, has warned that the situation is still critical and people should follow all safety guidelines. A surprise insepction was conducted by the health department in the city. The health department found that many people were not following the safety guidelines. The health department has warned that strict action will be taken against those who do not follow the safety guidelines. The health department has also appealed to the people to follow the safety guidelines to prevent the spread of the virus.";

        // runQuery();
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
        {#each Object.keys($system_prompts) as system_key}
            <option value={system_key}
                >{$system_prompts[system_key].name}</option
            >
        {/each}
    </select>
    <div class="flex pt-2 gap-1">
        {#if $contextOverflow}
            <div
                class="ctx-overflow flex-shrink"
                title="Selected text clobbers the system context. Results will be unexpected."
            >
                ⚠ Context overflow ({parseInt($contextTotal / 1024)}K)
            </div>
        {/if}
        <div class="flex flex-grow place-content-end gap-2">
            <button
                id="btnTest"
                on:click={onBtnTest}
            >
                Test
            </button>
            <button id="btnClear">Clear</button>
            <button id="btnRefresh">Refresh</button>
        </div>
    </div>
</div>

<style>
    #SystemSelector {
        position: sticky;
        top: 0;
        z-index: 100;
        padding-block: 1em;
        /* background: var(--color-background, #f0f); */
        background: linear-gradient(180deg, rgb(40, 0, 40), rgb(50, 33, 0));
        box-shadow: 0 1em 1em rgba(0, 0, 0, 0.5);
        border-bottom-left-radius: 1em;
        border-bottom-right-radius: 1em;
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
        font-weight: 700;
        border-radius: 0.5em;
    }

    .ctx-overflow {
        color: #ff0;
        font-weight: bold;
        text-shadow: 0 0 10px red;
    }
</style>
