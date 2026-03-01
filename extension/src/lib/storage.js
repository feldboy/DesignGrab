/**
 * Chrome storage wrapper with async/await support
 */

const storage = {
    /**
     * Get values from chrome.storage.local
     */
    async get(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    },

    /**
     * Set values in chrome.storage.local
     */
    async set(items) {
        return new Promise((resolve) => {
            chrome.storage.local.set(items, resolve);
        });
    },

    /**
     * Remove keys from chrome.storage.local
     */
    async remove(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, resolve);
        });
    },

    /**
     * Get values from chrome.storage.sync (for cross-device data)
     */
    async syncGet(keys) {
        return new Promise((resolve) => {
            chrome.storage.sync.get(keys, resolve);
        });
    },

    /**
     * Set values in chrome.storage.sync
     */
    async syncSet(items) {
        return new Promise((resolve) => {
            chrome.storage.sync.set(items, resolve);
        });
    },

    /**
     * Get the full extension state
     */
    async getState() {
        const data = await storage.get(['usage', 'plan', 'userId', 'library', 'settings']);
        return {
            usage: data.usage || {
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                downloads: 0,
                codeExports: 0,
                designSystems: 0,
                aiExports: 0
            },
            plan: data.plan || 'pro',
            userId: data.userId || null,
            library: data.library || [],
            settings: data.settings || {
                theme: 'dark',
                inspectOnHover: true,
                showTooltip: true
            }
        };
    }
};

export default storage;
