/**
 * Tab messaging utility — sends messages to the content script
 * with automatic injection if the content script isn't loaded.
 */

/**
 * Send a message to the content script of the active tab.
 * If the content script isn't loaded, injects it and retries.
 * @param {object} message - The message to send
 * @param {function} callback - Callback receiving (response). Response is undefined on failure.
 */
export function sendToTab(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
            callback?.(undefined);
            return;
        }
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                // Content script not loaded — inject and retry
                chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content.js']
                }).then(() => {
                    chrome.tabs.sendMessage(tabId, message, (retryResponse) => {
                        if (chrome.runtime.lastError) {
                            callback?.(undefined);
                        } else {
                            callback?.(retryResponse);
                        }
                    });
                }).catch(() => {
                    callback?.(undefined);
                });
            } else {
                callback?.(response);
            }
        });
    });
}

/**
 * Ensure the content script is loaded on the active tab.
 * Call this on panel/popup initialization.
 */
export async function ensureContentScript() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    try {
        await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
    } catch (e) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        } catch (e2) {
            // Can't inject on this page (chrome://, etc.)
        }
    }
}
