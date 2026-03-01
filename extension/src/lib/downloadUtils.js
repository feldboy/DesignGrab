/**
 * Download and clipboard utilities
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for content scripts where clipboard API may not be available
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            textarea.remove();
        }
    }
}

/**
 * Download a file from a URL via the background script
 */
export function downloadFile(url, filename) {
    chrome.runtime.sendMessage({
        type: 'DOWNLOAD_FILE',
        payload: { url, filename }
    });
}

/**
 * Download text content as a file
 */
export function downloadTextFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
    }, 100);
}

/**
 * Download an SVG element as a file
 */
export function downloadSVG(svgCode, filename = 'icon.svg') {
    downloadTextFile(svgCode, filename, 'image/svg+xml');
}

/**
 * Convert SVG to PNG and download
 */
export function downloadSVGAsPNG(svgCode, filename = 'icon.png', scale = 2) {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(pngUrl), 100);
        }, 'image/png');
    };

    img.src = url;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
