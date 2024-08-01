<script>
    import { ListDropdown } from "carbon-icons-svelte";
    import { chatState } from "../../../stores/chatStatus";

    let open_model_list_dropdown = false;
    let model_list = [];

    // browser.storage.sync.set({
    //     color: document.querySelector("#color").value,
    //   });

    async function onModelDropdown() {
        if (open_model_list_dropdown) {
            open_model_list_dropdown = false;
            return;
        }
        const response = await fetch("http://localhost:11434/api/tags");
        model_list = await response.json();
        model_list = model_list.models
            .map((model) => {
                return model.model;
            })
            .sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });

        open_model_list_dropdown = true;

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".absolute")) {
                open_model_list_dropdown = false;
                document.removeEventListener("click", this);
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                open_model_list_dropdown = false;
                document.removeEventListener("keydown", this);
            }
        });
    }
</script>

<div class="pt-4">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Model</label>
    <div class="flex gap-2">
        <input
            type="text"
            placeholder="model id"
            bind:value={$chatState.model_name}
        />
        <button
            title="Select a model"
            on:click={onModelDropdown}
        >
            <ListDropdown />
        </button>
    </div>
    {#if open_model_list_dropdown}
        <div
            class="absolute z-10 bg-black bg-opacity-90 p-2 text-xs h-64 w-full overflow-y-scroll"
        >
            {#each model_list as model}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="hover:bg-gray-800 p-1 text-white"
                    on:click={() => {
                        $chatState.model_name = model;
                        open_model_list_dropdown = false;
                    }}
                >
                    {model}
                </div>
            {/each}
        </div>
    {/if}
</div>
<div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Context</label>
    <div class="flex gap-2">
        <select bind:value={$chatState.values.num_ctx}>
            <option value={2048}>2048</option>
            <option value={4096}>4096</option>
            <option value={8192}>8192</option>
            <option value={16384}>16384</option>
            <option value={32768}>32768</option>
            <option value={65536}>65536</option>
            <option value={131072}>131072</option>
        </select>
    </div>
</div>

<style lang="scss">
    label {
        display: block;
        font-size: 0.8em;
    }
    input,
    select,
    option {
        flex: auto;
        border-radius: 5px;
        font-size: 0.8em;
        padding-inline: 0.5em;
        padding-block: 0.25em;
        margin: 0;
        height: 2em;
        color: var(--color-primary, #f0f);
        background: var(--color-background, #000);
    }

    button {
        flex: 0 0 auto;
        font-size: 0.8em;
        border-radius: 5px;
        padding-inline: 0.5em;
        padding-block: 0.25em;
        height: 2em;
    }
</style>
