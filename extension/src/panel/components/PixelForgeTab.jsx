import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { analyzeImage, generateOutput, SUPPORTED_FORMATS } from '../../lib/pixelforgeApi.js';
import { checkLimit, recordUsage, syncPlanLimits } from '../../lib/usageTracker.js';
import { getSupabase } from '../../lib/supabase.js';
import { saveToLibrary } from './LibraryTab.jsx';

const VALID_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIM = 4096;

const PROCESSING_STEPS = [
    'Analyzing layout...',
    'Detecting fonts...',
    'Extracting colors...',
    'Building design tree...',
];

/**
 * Resize an image if either dimension exceeds MAX_IMAGE_DIM.
 * Returns { base64, width, height }.
 */
const resizeImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            if (img.width <= MAX_IMAGE_DIM && img.height <= MAX_IMAGE_DIM) {
                resolve({ base64: e.target.result.split(',')[1], width: img.width, height: img.height });
                return;
            }
            const scale = Math.min(MAX_IMAGE_DIM / img.width, MAX_IMAGE_DIM / img.height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const resized = canvas.toDataURL('image/png').split(',')[1];
            resolve({ base64: resized, width: canvas.width, height: canvas.height });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

/**
 * Read a non-image file (PDF/PPTX) as base64.
 */
const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
});

/**
 * PixelForge — AI-powered image-to-design converter.
 * Upload an image → analyze → generate code in multiple formats.
 */
export function PixelForgeTab() {
    const [view, setView] = useState('upload');
    const [error, setError] = useState(null);
    const [designTree, setDesignTree] = useState(null);
    const [outputs, setOutputs] = useState({});
    const [selectedFormat, setSelectedFormat] = useState('html');
    const [generating, setGenerating] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [usageInfo, setUsageInfo] = useState(null);
    const [savedItems, setSavedItems] = useState(new Set());
    const [savingAll, setSavingAll] = useState(false);
    const [slowProcessing, setSlowProcessing] = useState(false);
    const fileInputRef = useRef(null);
    const cancelledRef = useRef(false);

    // Sync plan limits from Supabase on mount so cached limits are fresh
    useEffect(() => {
        (async () => {
            try {
                const supabase = await getSupabase();
                if (supabase) await syncPlanLimits(supabase);
            } catch (e) {
                console.warn('[DesignGrab:PixelForge] Failed to sync plan limits:', e.message);
            }
        })();
    }, []);

    // Cycle processing step text every 3s
    useEffect(() => {
        if (view !== 'processing') return;
        setStepIndex(0);
        setSlowProcessing(false);
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % PROCESSING_STEPS.length);
        }, 3000);
        // Show slow-processing hint after 30s
        const slowTimer = setTimeout(() => setSlowProcessing(true), 30_000);
        return () => { clearInterval(interval); clearTimeout(slowTimer); };
    }, [view]);

    const validateFile = (file) => {
        if (!file) return 'No file selected';
        if (file.size === 0) return 'File appears to be empty.';
        if (!VALID_TYPES.includes(file.type)) return 'Unsupported file type. Use PNG, JPEG, PDF, or PPTX.';
        if (file.size > MAX_FILE_SIZE) return 'File too large. Maximum size is 10MB.';
        return null;
    };

    const processFile = useCallback(async (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        cancelledRef.current = false;

        try {
            const limit = await checkLimit('pixelforge_analysis');
            if (!limit.allowed) {
                setUsageInfo(limit);
                return;
            }

            setView('processing');

            let base64;
            let mediaType = file.type;

            const isImage = file.type.startsWith('image/');
            if (isImage) {
                const resized = await resizeImage(file);
                base64 = resized.base64;
                // After resize we always get PNG
                if (resized.width !== undefined) mediaType = 'image/png';
            } else {
                base64 = await readFileAsBase64(file);
            }

            if (cancelledRef.current) return;

            const result = await analyzeImage(base64, mediaType);

            if (cancelledRef.current) return;

            if (!result.success) {
                setError(result.error || 'Analysis failed. Please try again.');
                setView('upload');
                return;
            }

            if (!result.designTree) {
                setError('Analysis returned no results. Try a different image.');
                setView('upload');
                return;
            }

            await recordUsage('pixelforge_analysis');
            setDesignTree(result.designTree);
            setView('result');
        } catch (err) {
            if (cancelledRef.current) return;
            console.error('[DesignGrab:PixelForge]', err);
            setError(err.message || 'Something went wrong.');
            setView('upload');
        }
    }, []);

    const handleCancel = useCallback(() => {
        cancelledRef.current = true;
        setView('upload');
        setError(null);
        setSlowProcessing(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleFileSelect = useCallback((e) => {
        const file = e.target?.files?.[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleGenerate = useCallback(async () => {
        if (!designTree) return;

        // Return cached output if available
        if (outputs[selectedFormat]) return;

        setGenerating(true);
        try {
            const result = await generateOutput(designTree, selectedFormat);
            if (result.success) {
                setOutputs((prev) => ({ ...prev, [selectedFormat]: result.code }));
            } else {
                setError(result.error || 'Generation failed.');
            }
        } catch (err) {
            console.error('[DesignGrab:PixelForge]', err);
            setError(err.message || 'Generation failed.');
        } finally {
            setGenerating(false);
        }
    }, [designTree, selectedFormat, outputs]);

    const handleCopy = useCallback(() => {
        const code = outputs[selectedFormat];
        if (code) {
            navigator.clipboard.writeText(code).catch((err) => {
                console.error('[DesignGrab:PixelForge] Copy failed:', err);
            });
        }
    }, [outputs, selectedFormat]);

    const handleSaveColor = useCallback(async (c) => {
        const key = c.hex;
        if (savedItems.has(key)) return;
        const result = await saveToLibrary({ type: 'color', name: c.name || c.hex, data: { hex: c.hex } });
        if (result.saved || result.reason === 'duplicate') {
            setSavedItems((prev) => new Set([...prev, key]));
        }
    }, [savedItems]);

    const handleSaveFont = useCallback(async (f) => {
        const key = f.name;
        if (savedItems.has(key)) return;
        const result = await saveToLibrary({ type: 'font', name: f.name, data: { family: f.googleFont || f.name } });
        if (result.saved || result.reason === 'duplicate') {
            setSavedItems((prev) => new Set([...prev, key]));
        }
    }, [savedItems]);

    const handleSaveAll = useCallback(async () => {
        if (!designTree || savingAll) return;
        setSavingAll(true);
        const newSaved = new Set(savedItems);
        const colors = designTree.colors || [];
        const fonts = designTree.fonts || [];
        for (const c of colors) {
            if (!newSaved.has(c.hex)) {
                const r = await saveToLibrary({ type: 'color', name: c.name || c.hex, data: { hex: c.hex } });
                if (r.saved || r.reason === 'duplicate') newSaved.add(c.hex);
            }
        }
        for (const f of fonts) {
            if (!newSaved.has(f.name)) {
                const r = await saveToLibrary({ type: 'font', name: f.name, data: { family: f.googleFont || f.name } });
                if (r.saved || r.reason === 'duplicate') newSaved.add(f.name);
            }
        }
        setSavedItems(newSaved);
        setSavingAll(false);
    }, [designTree, savedItems, savingAll]);

    const handleReset = useCallback(() => {
        setView('upload');
        setError(null);
        setDesignTree(null);
        setOutputs({});
        setSelectedFormat('html');
        setGenerating(false);
        setDragging(false);
        setUsageInfo(null);
        setSavedItems(new Set());
        setSavingAll(false);
    }, []);

    // ── Upload View ──
    if (view === 'upload') {
        return (
            <div class="pf-container">
                {error && <div class="pf-error">{error}</div>}

                {usageInfo && !usageInfo.allowed && (
                    <div class="usage-limit-banner">
                        {usageInfo.requiresAuth ? (
                            <p class="usage-limit-text">Sign in to use PixelForge.</p>
                        ) : usageInfo.limit === 0 ? (
                            <p class="usage-limit-text">PixelForge is not available on your current plan.</p>
                        ) : (
                            <>
                                <p class="usage-limit-text">
                                    You've used <strong>{usageInfo.current}/{usageInfo.limit}</strong> PixelForge {usageInfo.limit === 1 ? 'analysis' : 'analyses'} today.
                                </p>
                                {usageInfo.plan === 'free' && <button class="upgrade-btn">Upgrade to Pro</button>}
                            </>
                        )}
                    </div>
                )}

                <div
                    class={`pf-dropzone ${dragging ? 'pf-dropzone-active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span class="pf-dropzone-icon">🔮</span>
                    <span class="pf-dropzone-text">Drop an image here or click to upload</span>
                    <span class="pf-dropzone-formats">PNG, JPEG, PDF, PPTX — Max 10MB</span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        class="pf-file-input"
                        accept=".png,.jpg,.jpeg,.pdf,.pptx"
                        onChange={handleFileSelect}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        );
    }

    // ── Processing View ──
    if (view === 'processing') {
        return (
            <div class="panel-loading">
                <div class="spinner" />
                <span class="pf-step-text">{PROCESSING_STEPS[stepIndex]}</span>
                {slowProcessing && (
                    <span class="pf-slow-warning">This is taking longer than usual...</span>
                )}
                <button class="pf-cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
        );
    }

    // ── Result View ──
    return (
        <div class="pf-container">
            {error && <div class="pf-error">{error}</div>}

            <div class="pf-result-header">
                <span>Analysis Complete</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button class="pf-save-all-btn" onClick={handleSaveAll} disabled={savingAll}>
                        {savingAll ? 'Saving...' : '♥ Save All to Library'}
                    </button>
                    <button class="pf-new-btn" onClick={handleReset}>New Analysis</button>
                </div>
            </div>

            <div class="segmented-control">
                {SUPPORTED_FORMATS.map((fmt) => (
                    <button
                        key={fmt}
                        class={selectedFormat === fmt ? 'active' : ''}
                        onClick={() => setSelectedFormat(fmt)}
                    >
                        {fmt === 'html' ? 'HTML/CSS' : fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                    </button>
                ))}
            </div>

            <button
                class="pf-generate-btn"
                onClick={handleGenerate}
                disabled={generating}
            >
                {generating ? 'Generating...' : outputs[selectedFormat] ? 'Generated ✓' : 'Generate'}
            </button>

            <div class="code-block-wrapper">
                <div class="code-header">
                    <span>{selectedFormat.toUpperCase()}</span>
                    <button onClick={handleCopy}>Copy</button>
                </div>
                <pre class="code-content">{outputs[selectedFormat] || 'Click Generate to create output'}</pre>
            </div>

            {designTree?.colors?.length > 0 && (
                <div class="pf-color-palette">
                    {designTree.colors.map((c) => (
                        <div class="pf-color-swatch-wrapper">
                            <div
                                class="pf-color-swatch"
                                style={{ background: c.hex }}
                                title={c.name || c.hex}
                                onClick={() => navigator.clipboard.writeText(c.hex)}
                            />
                            <button
                                class={`pf-save-btn ${savedItems.has(c.hex) ? 'saved' : ''}`}
                                onClick={() => handleSaveColor(c)}
                                title="Save to Library"
                            >
                                {savedItems.has(c.hex) ? '♥' : '♡'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {designTree?.fonts?.length > 0 && (
                <div class="pf-font-list">
                    {designTree.fonts.map((f) => (
                        <div class="pf-font-item">
                            <span class="pf-font-item-name">{f.name}</span>
                            <div class="pf-font-item-right">
                                <span class="pf-font-item-match">{f.googleFont || 'Unknown'}</span>
                                <button
                                    class={`pf-save-btn ${savedItems.has(f.name) ? 'saved' : ''}`}
                                    onClick={() => handleSaveFont(f)}
                                    title="Save to Library"
                                >
                                    {savedItems.has(f.name) ? '♥' : '♡'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
