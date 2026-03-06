import { h } from 'preact';
import { useState } from 'preact/hooks';
import { copyToClipboard, downloadTextFile } from '../../lib/downloadUtils';

/**
 * Generate animation suggestions based on element properties
 */
function getAnimationSuggestions(element) {
    if (!element) return [];
    const suggestions = [];
    const tag = (element.tagName || '').toLowerCase();
    const classes = (element.className || '').toLowerCase();
    const styles = element.computedStyles || {};
    const width = parseFloat(styles.width) || 0;
    const height = parseFloat(styles.height) || 0;

    // Hero / large heading
    if (['h1', 'h2'].includes(tag) || classes.includes('hero') || classes.includes('headline') || classes.includes('title')) {
        suggestions.push({
            id: 'fade-up-title',
            name: 'Fade Up',
            desc: 'כותרת ראשית – אנימציית כניסה מלמטה עם שקיפות, נותנת הרגשה של חשיפה הדרגתית.',
            css: `@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: fadeUp 0.6s ease-out both; }`,
            badge: 'entrance'
        });
        suggestions.push({
            id: 'typewriter',
            name: 'Typewriter',
            desc: 'אפקט הקלדה – הטקסט מופיע אות-אות, מושלם לכותרות דינמיות.',
            css: `@keyframes typing {
  from { width: 0; }
  to   { width: 100%; }
}

.animated {
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid;
  animation: typing 2s steps(30) both,
             blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { border-color: transparent; }
}`,
            badge: 'text'
        });
    }

    // Card / panel
    if (classes.includes('card') || classes.includes('panel') || classes.includes('item') ||
        (styles.borderRadius && parseFloat(styles.borderRadius) >= 8 &&
            styles.boxShadow && styles.boxShadow !== 'none')) {
        suggestions.push({
            id: 'scale-in-card',
            name: 'Scale In',
            desc: 'כרטיס – כניסה עם הגדלה קלה ושקיפות, מרגיש כאילו הכרטיס "צץ" אל המסך.',
            css: `@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

.animated { animation: scaleIn 0.4s ease-out both; }`,
            badge: 'entrance'
        });
        suggestions.push({
            id: 'hover-lift',
            name: 'Hover Lift',
            desc: 'אפקט ריחוף – הכרטיס עולה מעט ומטיל צל חזק יותר. מושלם ל-hover interactivity.',
            css: `.animated {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.animated:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}`,
            badge: 'hover'
        });
    }

    // Button
    if (tag === 'button' || tag === 'a' || classes.includes('btn') || classes.includes('button') || classes.includes('cta')) {
        suggestions.push({
            id: 'pulse-btn',
            name: 'Pulse',
            desc: 'כפתור CTA – פעימה קלה שמושכת תשומת לב בלי להפריע. מעולה לפעולה ראשית.',
            css: `@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

.animated { animation: pulse 2s ease-in-out infinite; }`,
            badge: 'attention'
        });
        suggestions.push({
            id: 'hover-btn-glow',
            name: 'Hover Glow',
            desc: 'אפקט זוהר ב-hover – מוסיף הילה זוהרת סביב הכפתון. מתאים לעיצוב כהה.',
            css: `.animated {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.animated:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}`,
            badge: 'hover'
        });
    }

    // Image
    if (tag === 'img' || tag === 'picture' || tag === 'video' || tag === 'svg' ||
        classes.includes('image') || classes.includes('photo') || classes.includes('media')) {
        suggestions.push({
            id: 'zoom-in-img',
            name: 'Zoom Reveal',
            desc: 'תמונה – זום עדין מ-scale גדול יותר אל הגודל הנכון, עם שקיפות.',
            css: `@keyframes zoomReveal {
  from { opacity: 0; transform: scale(1.08); }
  to   { opacity: 1; transform: scale(1); }
}

.animated { animation: zoomReveal 0.5s ease-out both; }`,
            badge: 'entrance'
        });
        suggestions.push({
            id: 'hover-zoom',
            name: 'Hover Zoom',
            desc: 'זום חלק ב-hover – התמונה מתקרבת בעדינות. מעולה לגלריות ו-thumbnails.',
            css: `.animated {
  overflow: hidden;
}

.animated img {
  transition: transform 0.4s ease;
}

.animated:hover img {
  transform: scale(1.06);
}`,
            badge: 'hover'
        });
    }

    // Navigation / navbar
    if (tag === 'nav' || tag === 'header' || classes.includes('nav') || classes.includes('header') ||
        classes.includes('toolbar') || classes.includes('menu')) {
        suggestions.push({
            id: 'slide-down-nav',
            name: 'Slide Down',
            desc: 'תפריט ניווט – כניסה מלמעלה עם שקיפות. מרגיש טבעי עבור רכיב עליון.',
            css: `@keyframes slideDown {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: slideDown 0.35s ease-out both; }`,
            badge: 'entrance'
        });
    }

    // Section / container  
    if (tag === 'section' || tag === 'div' || tag === 'article' || tag === 'main') {
        suggestions.push({
            id: 'fade-in-section',
            name: 'Fade In',
            desc: 'אזור תוכן – שקיפות חלקה. מתאים לכל div או section שצריך כניסה צנועה.',
            css: `@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animated { animation: fadeIn 0.5s ease-out both; }`,
            badge: 'entrance'
        });
        suggestions.push({
            id: 'slide-in-left',
            name: 'Slide In Left',
            desc: 'כניסה מצד שמאל – מושכת את העין לתוכן. מתאים לגריד, רשימות, ויזואלים.',
            css: `@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animated { animation: slideInLeft 0.5s ease-out both; }`,
            badge: 'entrance'
        });
    }

    // List items
    if (tag === 'li' || tag === 'ul' || tag === 'ol' || classes.includes('list')) {
        suggestions.push({
            id: 'stagger-list',
            name: 'Stagger List',
            desc: 'פריטי רשימה – כל פריט נכנס ב-delay עולה, נותן תחושה זורמת.',
            css: `@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated li {
  animation: fadeUp 0.35s ease-out both;
}

.animated li:nth-child(1) { animation-delay: 0s; }
.animated li:nth-child(2) { animation-delay: 0.06s; }
.animated li:nth-child(3) { animation-delay: 0.12s; }
.animated li:nth-child(4) { animation-delay: 0.18s; }
.animated li:nth-child(5) { animation-delay: 0.24s; }`,
            badge: 'entrance'
        });
    }

    // Input / form
    if (tag === 'input' || tag === 'textarea' || tag === 'form' || tag === 'select' ||
        classes.includes('form') || classes.includes('input')) {
        suggestions.push({
            id: 'focus-glow',
            name: 'Focus Glow',
            desc: 'שדה קלט – זוהר עדין בזמן focus. מוסיף מגע פרימיום לטפסים.',
            css: `.animated {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.animated:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  outline: none;
}`,
            badge: 'interaction'
        });
    }

    // Fallback – generic suggestions for any element
    if (suggestions.length === 0) {
        suggestions.push({
            id: 'generic-fade',
            name: 'Fade In',
            desc: 'אנימציית כניסה בסיסית – שקיפות חלקה, מתאימה לכל אלמנט.',
            css: `@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animated { animation: fadeIn 0.4s ease-out both; }`,
            badge: 'entrance'
        });
        suggestions.push({
            id: 'generic-slide-up',
            name: 'Slide Up',
            desc: 'כניסה מלמטה – כניסה עדינה למעלה עם שקיפות.',
            css: `@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animated { animation: slideUp 0.45s ease-out both; }`,
            badge: 'entrance'
        });
    }

    return suggestions;
}

const BADGE_COLORS = {
    entrance: { bg: 'rgba(74, 222, 128, 0.12)', color: '#4ade80' },
    hover: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa' },
    attention: { bg: 'rgba(251, 146, 60, 0.12)', color: '#fb923c' },
    text: { bg: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa' },
    interaction: { bg: 'rgba(244, 114, 182, 0.12)', color: '#f472b6' },
};

export function AnimationsTab({ assets, onExtract, pinnedElement, onStartInspect }) {
    const [copiedId, setCopiedId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [expandedSuggestion, setExpandedSuggestion] = useState(null);

    const lotties = assets?.lotties || [];
    const animations = assets?.animations || [];
    const keyframes = animations.filter(a => a.type === 'keyframe');
    const transitions = animations.filter(a => a.type === 'transition');
    const scrollAnims = animations.filter(a => a.type === 'scroll-library');

    const total = lotties.length + animations.length;
    const suggestions = getAnimationSuggestions(pinnedElement);

    const handleCopy = (text, id) => {
        copyToClipboard(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleCopyAll = () => {
        const parts = [];
        if ((filter === 'all' || filter === 'lottie') && lotties.length > 0) {
            parts.push('/* Lottie / Rive Animations */');
            lotties.forEach(l => parts.push(l.src));
        }
        if ((filter === 'all' || filter === 'keyframe') && keyframes.length > 0) {
            parts.push('/* CSS Keyframe Animations */');
            keyframes.forEach(a => { if (a.keyframeCSS) parts.push(a.keyframeCSS); });
        }
        if ((filter === 'all' || filter === 'scroll') && scrollAnims.length > 0) {
            parts.push('/* Scroll-Triggered Animations */');
            scrollAnims.forEach(a => parts.push(`/* ${a.name} (${a.library}) on ${a.element} */`));
        }
        if ((filter === 'all' || filter === 'transition') && transitions.length > 0) {
            parts.push('/* CSS Transitions */');
            transitions.forEach(a => parts.push(`transition: ${a.transition};`));
        }
        handleCopy(parts.join('\n\n'), 'copy-all');
    };

    const handleDownloadLottie = (lottie) => {
        chrome.runtime.sendMessage({
            type: 'DOWNLOAD_FILE',
            payload: { url: lottie.src, filename: `${lottie.name || 'animation'}.json` }
        });
    };

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportedFormat, setExportedFormat] = useState(null);

    // --- Export builders ---
    const getSourceUrl = () => {
        try { return window.location?.href || document.referrer || 'Unknown'; }
        catch { return 'Extracted page'; }
    };

    const buildCSSExport = () => {
        const lines = [];
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        lines.push(`/* DesignGrab — Extracted Animations`);
        lines.push(`   Date: ${now} */`);
        lines.push('');

        if (keyframes.length > 0) {
            lines.push('/* ═══════════════════════════════════════');
            lines.push('   CSS Keyframe Animations');
            lines.push('   ═══════════════════════════════════════ */');
            lines.push('');
            keyframes.forEach(a => {
                if (a.keyframeCSS) {
                    lines.push(a.keyframeCSS);
                    lines.push('');
                    lines.push(`/* Applied on: ${a.element}`);
                    lines.push(`   Duration: ${a.duration} | Timing: ${a.timingFunction}`);
                    if (a.iterationCount === 'infinite') lines.push('   Loop: infinite');
                    if (a.delay && a.delay !== '0s') lines.push(`   Delay: ${a.delay}`);
                    lines.push('*/');
                    lines.push('');
                }
            });
        }

        if (transitions.length > 0) {
            lines.push('/* ═══════════════════════════════════════');
            lines.push('   CSS Transitions');
            lines.push('   ═══════════════════════════════════════ */');
            lines.push('');
            transitions.forEach(a => {
                lines.push(`/* On: ${a.element} */`);
                lines.push(`.element {`);
                lines.push(`  transition-property: ${a.transitionProperty || 'all'};`);
                lines.push(`  transition-duration: ${a.transitionDuration || '0s'};`);
                lines.push(`  transition-timing-function: ${a.transitionTimingFunction || 'ease'};`);
                lines.push(`  transition-delay: ${a.transitionDelay || '0s'};`);
                lines.push(`  /* Shorthand: transition: ${a.transition}; */`);
                lines.push('}');
                lines.push('');
            });
        }

        if (suggestions.length > 0) {
            lines.push('/* ═══════════════════════════════════════');
            lines.push('   Suggested Animations');
            lines.push('   ═══════════════════════════════════════ */');
            lines.push('');
            suggestions.forEach(s => {
                lines.push(`/* ${s.name} (${s.badge}) */`);
                lines.push(s.css);
                lines.push('');
            });
        }

        if (lotties.length > 0) {
            lines.push('/* ═══════════════════════════════════════');
            lines.push('   Lottie / Rive Animation URLs');
            lines.push('   ═══════════════════════════════════════ */');
            lines.push('');
            lotties.forEach(l => {
                lines.push(`/* ${l.name} — ${l.playerType} */`);
                lines.push(`/* URL: ${l.src} */`);
                lines.push('');
            });
        }

        return lines.join('\n');
    };

    const buildJSONExport = () => {
        const data = {
            exportedAt: new Date().toISOString(),
            generator: 'DesignGrab',
            keyframes: keyframes.map(a => ({
                name: a.name,
                css: a.keyframeCSS || null,
                duration: a.duration,
                timingFunction: a.timingFunction,
                iterationCount: a.iterationCount,
                delay: a.delay,
                element: a.element,
                frames: a.frames || []
            })),
            transitions: transitions.map(a => ({
                property: a.transitionProperty || 'all',
                duration: a.transitionDuration || '0s',
                timingFunction: a.transitionTimingFunction || 'ease',
                delay: a.transitionDelay || '0s',
                shorthand: a.transition,
                element: a.element
            })),
            scrollAnimations: scrollAnims.map(a => ({
                name: a.name,
                library: a.library,
                element: a.element,
                duration: a.duration || null,
                delay: a.delay || null
            })),
            lotties: lotties.map(l => ({
                name: l.name,
                url: l.src,
                playerType: l.playerType,
                width: l.width,
                height: l.height,
                loop: l.loop,
                autoplay: l.autoplay
            })),
            suggestions: suggestions.map(s => ({
                name: s.name,
                type: s.badge,
                css: s.css,
                description: s.desc
            }))
        };
        return JSON.stringify(data, null, 2);
    };

    const buildAIPromptExport = () => {
        const parts = [];
        parts.push('I extracted these CSS animations from a website using DesignGrab. Please use them in my project:\n');

        if (keyframes.length > 0) {
            parts.push('## Keyframe Animations\n');
            keyframes.forEach(a => {
                parts.push(`### ${a.name}`);
                parts.push(`Applied on: \`${a.element}\``);
                parts.push(`Duration: ${a.duration} | Timing: ${a.timingFunction}${a.iterationCount === 'infinite' ? ' | Loop: infinite' : ''}${a.delay && a.delay !== '0s' ? ` | Delay: ${a.delay}` : ''}\n`);
                if (a.keyframeCSS) {
                    parts.push('```css');
                    parts.push(a.keyframeCSS);
                    parts.push('```\n');
                }
            });
        }

        if (transitions.length > 0) {
            parts.push('## CSS Transitions\n');
            transitions.forEach(a => {
                parts.push(`- **${a.element}**: \`transition: ${a.transition};\``);
            });
            parts.push('');
        }

        if (scrollAnims.length > 0) {
            parts.push('## Scroll-Triggered Animations\n');
            scrollAnims.forEach(a => {
                parts.push(`- **${a.name}** (${a.library}) on \`${a.element}\``);
            });
            parts.push('');
        }

        if (lotties.length > 0) {
            parts.push('## Lottie Animations\n');
            lotties.forEach(l => {
                parts.push(`- **${l.name}** (${l.playerType}): ${l.src}`);
            });
            parts.push('');
        }

        if (suggestions.length > 0) {
            parts.push('## Suggested Animations\n');
            suggestions.forEach(s => {
                parts.push(`### ${s.name} (${s.badge})`);
                parts.push('```css');
                parts.push(s.css);
                parts.push('```\n');
            });
        }

        parts.push('Please integrate these animations into my component. Keep the exact timing values and easing functions.');
        return parts.join('\n');
    };

    const handleExportCSS = () => {
        const css = buildCSSExport();
        downloadTextFile(css, 'designgrab-animations.css', 'text/css');
        setExportedFormat('css');
        setTimeout(() => setExportedFormat(null), 2000);
    };

    const handleExportJSON = () => {
        const json = buildJSONExport();
        downloadTextFile(json, 'designgrab-animations.json', 'application/json');
        setExportedFormat('json');
        setTimeout(() => setExportedFormat(null), 2000);
    };

    const handleExportAIPrompt = () => {
        const prompt = buildAIPromptExport();
        copyToClipboard(prompt);
        setExportedFormat('ai');
        setTimeout(() => setExportedFormat(null), 2000);
    };

    const hasExportableContent = total > 0 || suggestions.length > 0;

    // --- EXPORT MODAL ---
    const renderExportModal = () => {
        if (!showExportModal) return null;
        return (
            <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
                <div className="export-modal" onClick={e => e.stopPropagation()}>
                    <div className="export-modal-header">
                        <h3>Export Animations</h3>
                        <button className="export-modal-close" onClick={() => setShowExportModal(false)}>✕</button>
                    </div>
                    <p className="export-modal-desc">
                        בחר פורמט ייצוא — CSS לעורך קוד, JSON לכלי AI, או Prompt מוכן להדבקה
                    </p>
                    <div className="export-format-grid">
                        {/* CSS File */}
                        <button className="export-format-card" onClick={handleExportCSS}>
                            <div className="export-format-icon">📄</div>
                            <div className="export-format-info">
                                <span className="export-format-name">CSS File</span>
                                <span className="export-format-desc">קובץ .css מוכן — VS Code, Cursor, כל עורך קוד</span>
                            </div>
                            <span className="export-format-action">
                                {exportedFormat === 'css' ? '✓ Downloaded' : 'Download'}
                            </span>
                        </button>
                        {/* JSON */}
                        <button className="export-format-card" onClick={handleExportJSON}>
                            <div className="export-format-icon">{'{}'}</div>
                            <div className="export-format-info">
                                <span className="export-format-name">JSON</span>
                                <span className="export-format-desc">מבנה נתונים — Base44, Lovable, כלי AI</span>
                            </div>
                            <span className="export-format-action">
                                {exportedFormat === 'json' ? '✓ Downloaded' : 'Download'}
                            </span>
                        </button>
                        {/* AI Prompt */}
                        <button className="export-format-card" onClick={handleExportAIPrompt}>
                            <div className="export-format-icon">🤖</div>
                            <div className="export-format-info">
                                <span className="export-format-name">AI Prompt</span>
                                <span className="export-format-desc">פרומפט מוכן — Antigravity, Cursor, ChatGPT</span>
                            </div>
                            <span className="export-format-action">
                                {exportedFormat === 'ai' ? '✓ Copied!' : 'Copy'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    const renderSuggestions = () => {
        if (!pinnedElement) {
            return (
                <div className="suggest-empty">
                    <div className="suggest-empty-icon">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <circle cx="18" cy="18" r="14" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4 3" />
                            <path d="M13 18l3.5 3.5L23 14" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <p className="suggest-empty-text">
                        בחר אלמנט בעמוד כדי לקבל הצעות אנימציה מותאמות
                    </p>
                    <button className="panel-btn primary" onClick={onStartInspect}>
                        🔍 Inspect Element
                    </button>
                </div>
            );
        }

        const elTag = (pinnedElement.tagName || 'div').toLowerCase();
        const elClass = pinnedElement.className
            ? `.${pinnedElement.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
            : '';
        const selector = `<${elTag}${elClass}>`;

        return (
            <div className="suggest-panel fade-in">
                <div className="suggest-header">
                    <div className="suggest-header-info">
                        <span className="suggest-label">הצעות אנימציה עבור:</span>
                        <code className="suggest-selector">{selector}</code>
                    </div>
                    <span className="suggest-count">{suggestions.length} הצעות</span>
                </div>
                <div className="suggest-list">
                    {suggestions.map((s, i) => {
                        const isExpanded = expandedSuggestion === s.id;
                        const badgeStyle = BADGE_COLORS[s.badge] || BADGE_COLORS.entrance;
                        return (
                            <div key={s.id} className={`suggest-card ${isExpanded ? 'expanded' : ''}`}>
                                <div className="suggest-card-top"
                                    onClick={() => setExpandedSuggestion(isExpanded ? null : s.id)}>
                                    <div className="suggest-card-left">
                                        <span className="suggest-card-name">{s.name}</span>
                                        <span className="suggest-card-badge"
                                            style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                                            {s.badge}
                                        </span>
                                    </div>
                                    <button
                                        className="suggest-copy-btn"
                                        onClick={(e) => { e.stopPropagation(); handleCopy(s.css, s.id); }}
                                    >
                                        {copiedId === s.id ? '✓ הועתק' : '📋 העתק CSS'}
                                    </button>
                                </div>
                                <p className="suggest-card-desc">{s.desc}</p>
                                {isExpanded && (
                                    <div className="suggest-card-code fade-in">
                                        <pre className="code-content"><code>{s.css}</code></pre>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    if (!assets) {
        return (
            <div className="animations-tab fade-in">
                {renderExportModal()}
                {/* Suggestions always show at top */}
                <div className="panel-scroll-content">
                    {renderSuggestions()}
                    {hasExportableContent && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                            <button className="panel-btn primary small" onClick={() => setShowExportModal(true)}>
                                ↗ Export Animations
                            </button>
                        </div>
                    )}
                    <div className="anim-divider" />
                    <div className="code-empty-state">
                        <div className="empty-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <circle cx="24" cy="24" r="18" stroke="#3f3f46" stroke-width="2" stroke-dasharray="4 4" />
                                <path d="M18 24l4 4 8-8" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <p className="empty-text">Extract assets first to detect Lottie animations, CSS keyframes, and scroll-triggered effects.</p>
                        <button className="empty-btn" onClick={onExtract}>Scan Page</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animations-tab fade-in">
            {renderExportModal()}
            {/* Suggestions section */}
            <div className="panel-scroll-content">
                {renderSuggestions()}
            </div>

            {total > 0 && <div className="anim-divider" />}

            {/* Existing detected animations */}
            {total > 0 && (
                <>
                    <div className="panel-sticky-header">
                        <div className="stats-row">
                            <span>{total} animations found</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button className="panel-btn primary small" onClick={() => setShowExportModal(true)}>
                                    ↗ Export
                                </button>
                                <button className="panel-btn outline small" onClick={handleCopyAll}>
                                    {copiedId === 'copy-all' ? '✓ Copied' : 'Copy All'}
                                </button>
                                <button className="icon-btn" onClick={onExtract} title="Re-scan">&#x21bb;</button>
                            </div>
                        </div>
                        <div className="assets-filters">
                            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                                All ({total})
                            </button>
                            {lotties.length > 0 && (
                                <button className={`filter-btn ${filter === 'lottie' ? 'active' : ''}`} onClick={() => setFilter('lottie')}>
                                    Lottie ({lotties.length})
                                </button>
                            )}
                            {keyframes.length > 0 && (
                                <button className={`filter-btn ${filter === 'keyframe' ? 'active' : ''}`} onClick={() => setFilter('keyframe')}>
                                    Keyframes ({keyframes.length})
                                </button>
                            )}
                            {scrollAnims.length > 0 && (
                                <button className={`filter-btn ${filter === 'scroll' ? 'active' : ''}`} onClick={() => setFilter('scroll')}>
                                    Scroll ({scrollAnims.length})
                                </button>
                            )}
                            {transitions.length > 0 && (
                                <button className={`filter-btn ${filter === 'transition' ? 'active' : ''}`} onClick={() => setFilter('transition')}>
                                    Transitions ({transitions.length})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="panel-scroll-content">
                        {/* Lottie Animations */}
                        {(filter === 'all' || filter === 'lottie') && lotties.length > 0 && (
                            <div className="anim-section">
                                {filter === 'all' && <h3 className="section-title">Lottie / Rive Animations</h3>}
                                <div className="anim-list">
                                    {lotties.map((lottie, i) => (
                                        <div key={`l-${i}`} className="anim-card">
                                            <div className="anim-card-header">
                                                <span className="anim-card-name">{lottie.name}</span>
                                                <span className="anim-card-badge lottie">{lottie.playerType}</span>
                                            </div>
                                            <div className="anim-card-meta">
                                                {lottie.width > 0 && <span>{lottie.width}x{lottie.height}</span>}
                                                {lottie.loop && <span>Loop</span>}
                                                {lottie.autoplay && <span>Autoplay</span>}
                                            </div>
                                            <div className="anim-card-url" title={lottie.src}>
                                                {lottie.src}
                                            </div>
                                            <div className="anim-card-actions">
                                                <button className="asset-btn download" onClick={() => handleDownloadLottie(lottie)}>
                                                    Download JSON
                                                </button>
                                                <button className="asset-btn copy" onClick={() => handleCopy(lottie.src, `lottie-${i}`)}>
                                                    {copiedId === `lottie-${i}` ? '✓ Copied' : 'Copy URL'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CSS Keyframe Animations */}
                        {(filter === 'all' || filter === 'keyframe') && keyframes.length > 0 && (
                            <div className="anim-section">
                                {filter === 'all' && <h3 className="section-title">CSS Keyframe Animations</h3>}
                                <div className="anim-list">
                                    {keyframes.map((anim, i) => (
                                        <div key={`k-${i}`} className="anim-card">
                                            <div className="anim-card-header">
                                                <span className="anim-card-name">{anim.name}</span>
                                                <span className="anim-card-badge keyframe">@keyframes</span>
                                            </div>
                                            <div className="anim-card-meta">
                                                <span>{anim.duration}</span>
                                                <span>{anim.timingFunction}</span>
                                                {anim.iterationCount === 'infinite' && <span>Infinite</span>}
                                                {anim.delay !== '0s' && <span>Delay: {anim.delay}</span>}
                                            </div>
                                            <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                            {anim.keyframeCSS && (
                                                <div className="anim-card-code">
                                                    <pre className="code-content"><code>{anim.keyframeCSS}</code></pre>
                                                    <button
                                                        className="anim-copy-btn"
                                                        onClick={() => handleCopy(anim.keyframeCSS, `kf-${i}`)}
                                                    >
                                                        {copiedId === `kf-${i}` ? '✓' : 'Copy'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Scroll-Triggered Animations */}
                        {(filter === 'all' || filter === 'scroll') && scrollAnims.length > 0 && (
                            <div className="anim-section">
                                {filter === 'all' && <h3 className="section-title">Scroll-Triggered Animations</h3>}
                                <div className="anim-list">
                                    {scrollAnims.map((anim, i) => (
                                        <div key={`s-${i}`} className="anim-card">
                                            <div className="anim-card-header">
                                                <span className="anim-card-name">{anim.name}</span>
                                                <span className="anim-card-badge scroll">{anim.library}</span>
                                            </div>
                                            <div className="anim-card-meta">
                                                {anim.duration && <span>{anim.duration}ms</span>}
                                                {anim.delay && <span>Delay: {anim.delay}ms</span>}
                                            </div>
                                            <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transitions */}
                        {(filter === 'all' || filter === 'transition') && transitions.length > 0 && (
                            <div className="anim-section">
                                {filter === 'all' && <h3 className="section-title">CSS Transitions</h3>}
                                <div className="anim-list">
                                    {transitions.map((anim, i) => {
                                        const fullCSS = [
                                            `transition-property: ${anim.transitionProperty || 'all'};`,
                                            `transition-duration: ${anim.transitionDuration || '0s'};`,
                                            `transition-timing-function: ${anim.transitionTimingFunction || 'ease'};`,
                                            `transition-delay: ${anim.transitionDelay || '0s'};`,
                                        ].join('\n');
                                        const shorthand = `transition: ${anim.transition};`;
                                        return (
                                            <div key={`t-${i}`} className="anim-card">
                                                <div className="anim-card-header">
                                                    <span className="anim-card-name">transition</span>
                                                    <span className="anim-card-badge transition">CSS</span>
                                                </div>
                                                <div className="anim-card-meta">
                                                    <span>{anim.transitionProperty || 'all'}</span>
                                                    <span>{anim.transitionDuration || '0s'}</span>
                                                    <span>{anim.transitionTimingFunction || 'ease'}</span>
                                                    {anim.transitionDelay && anim.transitionDelay !== '0s' && (
                                                        <span>Delay: {anim.transitionDelay}</span>
                                                    )}
                                                </div>
                                                <div className="anim-card-element">On: <code>{anim.element}</code></div>
                                                <div className="anim-card-code">
                                                    <pre className="code-content"><code>{fullCSS}</code></pre>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button
                                                            className="anim-copy-btn"
                                                            onClick={() => handleCopy(fullCSS, `tr-full-${i}`)}
                                                        >
                                                            {copiedId === `tr-full-${i}` ? '✓' : 'Copy'}
                                                        </button>
                                                        <button
                                                            className="anim-copy-btn"
                                                            onClick={() => handleCopy(shorthand, `tr-short-${i}`)}
                                                        >
                                                            {copiedId === `tr-short-${i}` ? '✓' : 'Shorthand'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {total === 0 && assets && (
                <div className="panel-scroll-content">
                    <div className="code-empty-state">
                        <p className="empty-text">No animations detected on this page.</p>
                        <button className="panel-btn outline" onClick={onExtract}>Re-scan</button>
                    </div>
                </div>
            )}
        </div>
    );
}
