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
btnFigma.addEventListener('click', () => {
    chrome.storage.local.set({ openTab: 'figma' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
    });
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
    });
    chrome.runtime.sendMessage({ type: 'EXTRACT_ASSETS' }, (response) => {
        if (response?.success) {
            chrome.storage.local.set({ lastExtractedAssets: response.assets });
        }
    });
    setTimeout(() => window.close(), 300);
});

// Open Side Panel
btnPanel.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.sidePanel.open({ tabId: tabs[0].id });
    });
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
