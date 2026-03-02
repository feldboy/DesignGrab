import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const PWD = process.cwd();
const HTML_PATH = `file://${path.join(PWD, 'store-assets.html')}`;

const SCREENS = [
    { id: 'screen-1', width: 1280, height: 800, filename: 'screenshot-1-hero.png' },
    { id: 'screen-2', width: 1280, height: 800, filename: 'screenshot-2-inspect.png' },
    { id: 'screen-3', width: 1280, height: 800, filename: 'screenshot-3-ai-export.png' },
    { id: 'screen-4', width: 1280, height: 800, filename: 'screenshot-4-tokens.png' },
    { id: 'screen-5', width: 1280, height: 800, filename: 'screenshot-5-assets.png' },
    { id: 'promo-small', width: 440, height: 280, filename: 'promo-small.png' },
    { id: 'promo-marquee', width: 1400, height: 560, filename: 'promo-marquee.png' }
];

async function generate() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Ensure the output folder exists
    const outDir = path.join(PWD, 'out', 'store-ready');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const screen of SCREENS) {
        console.log(`Generating ${screen.filename}...`);
        await page.setViewport({ width: screen.width, height: screen.height, deviceScaleFactor: 1 });
        await page.goto(`${HTML_PATH}`, { waitUntil: 'networkidle0' });

        // Hide ALL screens, then show only the target one
        await page.evaluate((targetId) => {
            document.querySelectorAll('.container').forEach(el => {
                el.style.display = 'none';
            });
            const target = document.getElementById(targetId);
            if (target) {
                target.style.display = 'flex';
            } else {
                console.error('Target not found:', targetId);
            }
        }, screen.id);

        // Slight pause to ensure animations/fonts have rendered
        await new Promise(r => setTimeout(r, 500));

        await page.screenshot({
            path: path.join(outDir, screen.filename),
            type: 'png'
        });
    }

    await browser.close();
    console.log('Done! All assets generated in ./out/store-ready folder.');
}

generate().catch(console.error);
