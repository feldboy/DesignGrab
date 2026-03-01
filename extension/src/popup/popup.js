/**
 * DesignGrab Popup — Quick actions
 */

let isInspecting = false;

const btnFigma = document.getElementById('btn-figma');
const btnInspect = document.getElementById('btn-inspect');
const btnAssets = document.getElementById('btn-assets');
const btnPanel = document.getElementById('btn-panel');

// Export to Figma — open side panel on Figma tab
btnFigma.addEventListener('click', () => {
    chrome.storage.local.set({ openTab: 'figma' });
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    setTimeout(() => window.close(), 200);
});

// Toggle Inspect Mode
btnInspect.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_INSPECT' }, (response) => {
        if (response?.active) {
            isInspecting = true;
            btnInspect.classList.add('active');
            btnInspect.querySelector('span').textContent = 'Stop Inspecting';
            // Close popup after activation to let user interact with page
            setTimeout(() => window.close(), 300);
        } else {
            isInspecting = false;
            btnInspect.classList.remove('active');
            btnInspect.querySelector('span').textContent = 'Start Inspecting';
        }
    });
});

// Extract Assets
btnAssets.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'EXTRACT_ASSETS' }, (response) => {
        if (response?.success) {
            // Open side panel to show results
            chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
            // Store assets for the panel to pick up
            chrome.storage.local.set({ lastExtractedAssets: response.assets });
            setTimeout(() => window.close(), 300);
        }
    });
});

// Open Side Panel
btnPanel.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    setTimeout(() => window.close(), 200);
});

// Check current inspect state
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
            if (chrome.runtime.lastError) return; // Content script not loaded
            // Could update UI based on state
        });
    }
});
