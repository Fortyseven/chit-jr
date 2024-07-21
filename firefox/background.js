import SYSTEM_PROMPTS from "./sidebar/prompts/index.js";

const MENU_ID = "chitjr-menu";

onload = () => {
    console.log("FUCK");
    // message.windowId = currentWindow.id;
    // message.text = message.text.trim();
    // browser.runtime.sendMessage(message);
};

chrome.runtime.onInstalled.addListener(function () {
    window.browser.SYSTEM_PROMPTS = SYSTEM_PROMPTS;

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

    sendInitToSidebar();
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
                        // FIXME
                        const panel = browser.runtime.getURL("./sidebar.html");

                        console.log("PANEL", panel);

                        // browser.sidebarAction.open();
                        // browser.sidebarAction.setPanel({ panel });

                        const system_prompt = info.menuItemId.split("-")[2];

                        // we have the text, so let's send it to the sidebar
                        sendMessageToSidebar({
                            action: "selectedTextChitJr",
                            system: system_prompt,
                            text: text,
                            s_prompts: SYSTEM_PROMPTS,
                        });
                    }
                }
            }
        );
    }
});

function sendMessageToSidebar(message) {
    setTimeout(() => {
        browser.windows.getCurrent().then((currentWindow) => {
            message.windowId = currentWindow.id;
            message.text = message.text.trim();
            browser.runtime.sendMessage(message);
        });
    }, 100);
}

function sendInitToSidebar() {
    setTimeout(() => {
        browser.windows.getCurrent().then((currentWindow) => {
            const message = {
                windowId: currentWindow.id,
                action: "initChitJr",
                s_prompts: SYSTEM_PROMPTS,
            };
            browser.runtime.sendMessage(message);
        });
    }, 100);
}
