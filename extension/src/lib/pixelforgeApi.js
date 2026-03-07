/**
 * DesignGrab — PixelForge API Client
 * Calls Supabase Edge Functions for image analysis and code generation.
 */

import { getSupabase } from './supabase.js';

/** Supported output formats for code generation */
export const SUPPORTED_FORMATS = ['figma', 'canva', 'html', 'react', 'svg'];

const TIMEOUT_MS = 60_000;
const TIMEOUT_MESSAGE = 'Analysis timed out. Try a simpler image or try again later.';
const RETRY_DELAY_MS = 2_000;
const VALID_MEDIA_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/**
 * Race a promise against a timeout.
 * @param {Promise} promise
 * @param {number} ms
 * @param {string} message
 * @returns {Promise}
 */
function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(message)), ms);
        promise.then(
            (val) => { clearTimeout(timer); resolve(val); },
            (err) => { clearTimeout(timer); reject(err); }
        );
    });
}

/**
 * Check if an error is a network-level failure (not a 4xx client error).
 * @param {Error} err
 * @returns {boolean}
 */
function isNetworkError(err) {
    if (err.message === TIMEOUT_MESSAGE) return false;
    const msg = (err.message || '').toLowerCase();
    if (/4\d{2}/.test(msg)) return false;
    return msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')
        || msg.includes('aborterror') || msg.includes('typeerror');
}


/**
 * Validate inputs for analyzeImage.
 * @param {string} imageBase64
 * @param {string} mediaType
 * @returns {string|null} Error message or null if valid
 */
function validateAnalyzeInput(imageBase64, mediaType) {
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length === 0) {
        return 'Image data is empty or invalid.';
    }
    if (!mediaType || !VALID_MEDIA_TYPES.includes(mediaType)) {
        return `Unsupported media type: ${mediaType}`;
    }
    return null;
}

/**
 * Delay helper for retry logic.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyze an image via the pixelforge-analyze edge function.
 * Includes input validation, 60s timeout, and one automatic retry on network errors.
 * @param {string} imageBase64 - Base64-encoded image data
 * @param {string} mediaType - MIME type (e.g. 'image/png')
 * @returns {Promise<{ success: boolean, designTree: object|null, error: string|null }>}
 */
export async function analyzeImage(imageBase64, mediaType) {
    const validationError = validateAnalyzeInput(imageBase64, mediaType);
    if (validationError) {
        return { success: false, designTree: null, error: validationError };
    }

    try {
        const supabase = await getSupabase();
        if (!supabase) {
            return { success: false, designTree: null, error: 'Supabase not configured' };
        }

        const invoke = () => supabase.functions.invoke('pixelforge-analyze', {
            body: { image: imageBase64, media_type: mediaType },
        });

        let data, error;
        try {
            ({ data, error } = await withTimeout(invoke(), TIMEOUT_MS, TIMEOUT_MESSAGE));
        } catch (err) {
            // Retry once on network errors
            if (isNetworkError(err)) {
                console.error('[DesignGrab:pixelforgeApi] analyzeImage network error, retrying...', err.message);
                await delay(RETRY_DELAY_MS);
                ({ data, error } = await withTimeout(invoke(), TIMEOUT_MS, TIMEOUT_MESSAGE));
            } else {
                throw err;
            }
        }

        if (error) {
            console.error('[DesignGrab:pixelforgeApi] analyzeImage failed:', error.message);
            return { success: false, designTree: null, error: error.message };
        }

        return { success: true, designTree: data?.design_tree ?? null, error: null };
    } catch (err) {
        console.error('[DesignGrab:pixelforgeApi] analyzeImage error:', err);
        return { success: false, designTree: null, error: err.message };
    }
}

/**
 * Generate output code from a design tree via the pixelforge-generate edge function.
 * Includes 60s timeout and one automatic retry on network errors.
 * @param {object} designTree - Parsed design tree from analyzeImage
 * @param {'figma'|'canva'|'html'|'react'|'svg'} format - Target output format
 * @returns {Promise<{ success: boolean, code: string|null, error: string|null }>}
 */
export async function generateOutput(designTree, format) {
    try {
        const supabase = await getSupabase();
        if (!supabase) {
            return { success: false, code: null, error: 'Supabase not configured' };
        }

        const invoke = () => supabase.functions.invoke('pixelforge-generate', {
            body: { design_tree: designTree, format },
        });

        let data, error;
        try {
            ({ data, error } = await withTimeout(invoke(), TIMEOUT_MS, TIMEOUT_MESSAGE));
        } catch (err) {
            if (isNetworkError(err)) {
                console.error('[DesignGrab:pixelforgeApi] generateOutput network error, retrying...', err.message);
                await delay(RETRY_DELAY_MS);
                ({ data, error } = await withTimeout(invoke(), TIMEOUT_MS, TIMEOUT_MESSAGE));
            } else {
                throw err;
            }
        }

        if (error) {
            console.error('[DesignGrab:pixelforgeApi] generateOutput failed:', error.message);
            return { success: false, code: null, error: error.message };
        }

        return { success: true, code: data?.code ?? null, error: null };
    } catch (err) {
        console.error('[DesignGrab:pixelforgeApi] generateOutput error:', err);
        return { success: false, code: null, error: err.message };
    }
}
