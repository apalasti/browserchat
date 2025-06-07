
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addToChat") {
        // Open the side panel for the current tab
        if (sender.tab && sender.tab.id) {
            chrome.sidePanel.open({ tabId: sender.tab.id });
        }
    }
});
