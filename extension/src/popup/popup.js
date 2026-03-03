/**
 * DesignGrab Popup — Quick actions
 */

import { getAuthState, signInWithGoogle } from '../lib/auth.js';

let isInspecting = false;

const btnFigma = document.getElementById('btn-figma');
const btnInspect = document.getElementById('btn-inspect');
const btnAssets = document.getElementById('btn-assets');
const btnPanel = document.getElementById('btn-panel');
const btnGoogleSignin = document.getElementById('btn-google-signin');
const googleSigninSection = document.getElementById('google-signin-section');
const planBadge = document.getElementById('plan-badge');

// Check auth state and show/hide sign-in button
getAuthState().then(({ isLoggedIn, plan }) => {
    if (!isLoggedIn) {
        googleSigninSection.style.display = 'block';
    }
    if (plan && plan !== 'free') {
        planBadge.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
        planBadge.classList.add(plan);
    }
}).catch(() => {
    googleSigninSection.style.display = 'block';
});

// Sign in with Google
btnGoogleSignin.addEventListener('click', async () => {
    btnGoogleSignin.disabled = true;
    btnGoogleSignin.querySelector('span').textContent = 'Signing in...';
    const result = await signInWithGoogle();
    if (result.error) {
        btnGoogleSignin.disabled = false;
        btnGoogleSignin.querySelector('span').textContent = 'Sign in with Google';
    } else {
        googleSigninSection.style.display = 'none';
        const state = await getAuthState();
        if (state.plan && state.plan !== 'free') {
            planBadge.textContent = state.plan.charAt(0).toUpperCase() + state.plan.slice(1);
        }
    }
});

// Export to Figma — open side panel on Figma tab
btnFigma.addEventListener('click', async () => {
    chrome.storage.local.set({ openTab: 'figma' });
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
        console.error('[DesignGrab] Failed to open side panel:', e);
    }
    window.close();
});

// Toggle Inspect Mode — send directly to content script (bypass service worker)
btnInspect.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    function handleResponse(response) {
        if (response?.active) {
            isInspecting = true;
            btnInspect.classList.add('active');
            btnInspect.querySelector('span').textContent = 'Stop Inspecting';
            setTimeout(() => window.close(), 300);
        } else {
            isInspecting = false;
            btnInspect.classList.remove('active');
            btnInspect.querySelector('span').textContent = 'Start Inspecting';
        }
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' });
        handleResponse(response);
    } catch (e) {
        // Content script not loaded — inject and retry
        try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' });
            handleResponse(response);
        } catch (e2) {
            btnInspect.querySelector('span').textContent = 'Cannot inspect this page';
            setTimeout(() => {
                btnInspect.querySelector('span').textContent = 'Start Inspecting';
            }, 2000);
        }
    }
});

// Extract Assets — send directly to content script
btnAssets.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    async function doExtract() {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ASSETS' });
        if (response?.success) {
            chrome.storage.local.set({ lastExtractedAssets: response.assets });
            try {
                await chrome.sidePanel.open({ tabId: tab.id });
            } catch (e) {
                console.error('[DesignGrab] Failed to open side panel:', e);
            }
            window.close();
        }
    }

    try {
        await doExtract();
    } catch (e) {
        try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
            await doExtract();
        } catch (e2) {
            console.error('[DesignGrab] Extract assets failed:', e2);
        }
    }
});

// Open Side Panel
btnPanel.addEventListener('click', async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
        console.error('[DesignGrab] Failed to open side panel:', e);
    }
    window.close();
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
