import * as Stores_ChatStatus from '../stores/chatStatus';

const unSubscriptions = [];

const STORE_WHITELIST = [
    'chatState',
];

/*
    NOTE: _getPersistStore and _setPersistStore are abstracted out like
    this for other projects so that they can be easily swapped out for
    other storage mechanisms.
*/

/***
 * Gets a persisted value from storage
 * @param key {string}
 * @returns {string | null}
 */
async function _getPersistStore(key) {
    return await browser.storage.sync.get(key);
}

/***
 * Sets a persisted value in storage
 * @param key {string}
 * @param value {string}
 */

async function _setPersistStore(key, value) {
    await browser.storage.sync.set({ [key]: value });
}

function _setLocalStoreSubscriptionsGroup(group) {
    Object.keys(group)
        .filter((key) => STORE_WHITELIST.includes(key))
        .forEach((key) => {
            if (group[key].constructor == 'Array') {
                //
            } else {
                try {
                    unSubscriptions.push(
                        group[key].subscribe((value) => {
                            _setPersistStore(key, JSON.stringify(value));
                        })
                    );
                } catch (e) {
                    console.error(`Error subscribing to '${key}' skipping...`);
                }
            }
        });
}

async function _syncLocalStorageStores_Group(group) {
    const storage_values = await browser.storage.sync.get();

    Object.keys(group)
        .filter((key) => STORE_WHITELIST.includes(key))
        .forEach(async (key) => {
            // try to get the saved value from browser localstorage
            if (!storage_values.hasOwnProperty(key)) {
                console.debug(`💾 No ${key} in storage...`, storage_values);
                return;
            }

            let value = storage_values[key];

            console.debug(`💾 Syncing ${key} from storage...`, value);

            // if we have a value and the store has a set method
            if (value && group[key]?.set) {
                // set the svelte store value from the localstorage value
                try {
                    let parsedValue = await JSON.parse(value);
                    console.debug(`💾 XXX Setting ${key} from storage...`, parsedValue);
                    if (Object.keys(parsedValue).length > 0) {
                        group[key].set(parsedValue);
                    }
                } catch (e) {
                    console.error(`Error setting ${key}; skipping...`, e);
                }
            }
        });
}

/***
 * Sets up subscriptions to our svelte stores, and saves their values
 * to browser local storage on change. Only provide for entries in
 *  STORE_WHITELIST.
 *
 * @returns {void}
 */
export async function setLocalStorageSubscriptions() {
    console.debug('💾 Setting up local storage subscriptions...');
    await _setLocalStoreSubscriptionsGroup(Stores_ChatStatus);
}

/***
 * Imports data from browser local storage into our svelte
 * stores, where possible. Only persist stores in
 * STORE_WHITELIST.
 * @param quizId
 */

export async function restoreLocalStorageStores() {
    console.debug('💾 Attempting to restore local storage stores...');

    await _syncLocalStorageStores_Group(Stores_ChatStatus);
}
