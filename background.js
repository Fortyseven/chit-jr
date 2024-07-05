import SYSTEM_PROMPTS from "./sidebar/prompts/index.js";

const MENU_ID = "chitjr-menu";

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: MENU_ID,
        title: "Send selection to Chit Jr.",
        contexts: ["selection"],
    });

    for (const key in SYSTEM_PROMPTS) {
        const system = SYSTEM_PROMPTS[key];
        chrome.contextMenus.create({
            id: `${MENU_ID}-${key}`,
            contexts: ["selection"],
            parentId: MENU_ID,
            title: system.name,
        });
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // we're listening to context menu onclick events, so let's
    // keep an eye out for ours...
    if (info.menuItemId.startsWith(MENU_ID)) {
        // on the page the user has selected some text, so from
        // that page's context, let's run some JS to get that
        // text...
        chrome.tabs.executeScript(
            tab.id,
            { code: "window.getSelection().toString();" },
            (selection) => {
                if (selection) {
                    const text = selection[0];
                    // not every selection works, so check for it; getSelection
                    // does not work on input fields, for example, or raw source
                    // listings, and some other contexts.
                    if (text) {
                        const system_prompt = info.menuItemId.split("-")[2];

                        // we have the text, so let's send it to the sidebar
                        sendMessageToSidebar({
                            action: "selectedTextChitJr",
                            system: system_prompt,
                            text: text,
                        });
                    }
                }
            }
        );
    }
});

function sendMessageToSidebar(message) {
    // open sidebar if it's not open

    const panel = browser.runtime.getURL("/sidebar/sidebar.html");

    browser.sidebarAction.open();
    browser.sidebarAction.setPanel({ panel });

    setTimeout(() => {
        browser.windows.getCurrent().then((currentWindow) => {
            message.windowId = currentWindow.id;
            message.text = message.text.trim();
            browser.runtime.sendMessage(message);
        });
    }, 100);
}
