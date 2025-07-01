chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addToChat") {
        // Open the side panel for the current tab
        if (sender.tab && sender.tab.id) {
            chrome.sidePanel.open({ tabId: sender.tab.id }).then(async () => {
                const sendMessageWithRetry = async () => {
                    try {
                        await chrome.runtime.sendMessage(message);
                    } catch (error) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                        await sendMessageWithRetry();
                    }
                };
                await sendMessageWithRetry();
            });
        }
    }
});
