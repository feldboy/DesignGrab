/**
 * DesignGrab Popup — Quick actions with micro-interactions
 */

// Auth is handled by the service worker to avoid popup-closing issues
// during launchWebAuthFlow. We communicate via chrome.runtime.sendMessage.

let isInspecting = false;

const btnFigma = document.getElementById('btn-figma');
const btnInspect = document.getElementById('btn-inspect');
const btnAssets = document.getElementById('btn-assets');
const btnPanel = document.getElementById('btn-panel');
const btnGoogleSignin = document.getElementById('btn-google-signin');
const googleSigninSection = document.getElementById('google-signin-section');
const planBadge = document.getElementById('plan-badge');

// Ripple effect on button clicks
document.querySelectorAll('.popup-btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', `${x}%`);
        btn.style.setProperty('--ripple-y', `${y}%`);
    });
});

// Detect platform for shortcut display
const isMac = navigator.platform?.includes('Mac') || navigator.userAgent?.includes('Mac');
if (!isMac) {
    const shortcutEl = document.querySelector('.popup-shortcut');
    if (shortcutEl) {
        shortcutEl.innerHTML = '<kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>G</kbd>';
    }
}

// Show last auth debug info if available (helps diagnose silent failures)
chrome.storage.local.get(['_authDebug'], (data) => {
    if (data._authDebug) {
        console.log('[DesignGrab] Last auth debug log:\n' + data._authDebug);
    }
});

// Check auth state via service worker
chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }).then(({ isLoggedIn, plan }) => {
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
    btnGoogleSignin.classList.add('loading');
    btnGoogleSignin.querySelector('span').textContent = 'Signing in…';
    // Run sign-in in the service worker so the popup can close
    // without killing the OAuth flow
    const result = await chrome.runtime.sendMessage({ type: 'SIGN_IN_WITH_GOOGLE' });
    if (result.error) {
        btnGoogleSignin.disabled = false;
        btnGoogleSignin.classList.remove('loading');
        btnGoogleSignin.querySelector('span').textContent = 'Sign in with Google';
        btnGoogleSignin.classList.add('error-shake');
        alert("Sign In Error: " + (result.error || "Unknown error"));
        btnGoogleSignin.addEventListener('animationend', () => {
            btnGoogleSignin.classList.remove('error-shake');
        }, { once: true });
    } else {
        btnGoogleSignin.classList.add('success-flash');
        googleSigninSection.style.display = 'none';
        const state = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' });
        if (state.plan && state.plan !== 'free') {
            planBadge.textContent = state.plan.charAt(0).toUpperCase() + state.plan.slice(1);
            planBadge.classList.add(state.plan);
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

// Toggle Inspect Mode
btnInspect.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    function handleResponse(response) {
        const label = btnInspect.querySelector('.popup-btn-label');
        const desc = btnInspect.querySelector('.popup-btn-desc');
        if (response?.active) {
            isInspecting = true;
            btnInspect.classList.add('active');
            label.textContent = 'Stop Inspecting';
            desc.textContent = 'Inspector is active on this page';
            setTimeout(() => window.close(), 300);
        } else {
            isInspecting = false;
            btnInspect.classList.remove('active');
            label.textContent = 'Start Inspecting';
            desc.textContent = 'Hover elements to see styles';
        }
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' });
        handleResponse(response);
    } catch (e) {
        try {
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_INSPECT' });
            handleResponse(response);
        } catch (e2) {
            const label = btnInspect.querySelector('.popup-btn-label');
            const desc = btnInspect.querySelector('.popup-btn-desc');
            label.textContent = 'Cannot inspect this page';
            desc.textContent = 'Try on a regular website';
            btnInspect.classList.add('error-shake');
            btnInspect.addEventListener('animationend', () => {
                btnInspect.classList.remove('error-shake');
            }, { once: true });
            setTimeout(() => {
                label.textContent = 'Start Inspecting';
                desc.textContent = 'Hover elements to see styles';
            }, 2000);
        }
    }
});

// Extract Assets
btnAssets.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    async function doExtract() {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_ASSETS' });
        if (response?.success) {
            chrome.storage.local.set({ lastExtractedAssets: response.assets });
            btnAssets.classList.add('success-flash');
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
            btnAssets.classList.add('error-shake');
            btnAssets.addEventListener('animationend', () => {
                btnAssets.classList.remove('error-shake');
            }, { once: true });
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

// Check current inspect state on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
            if (chrome.runtime.lastError) return;
        });
    }
});
