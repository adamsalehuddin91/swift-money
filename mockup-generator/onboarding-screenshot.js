/**
 * SwiftMoney — Onboarding Screen Screenshot
 * Registers a temp user, captures the onboarding screen, outputs mockup.
 *
 * Run from mockup-generator/:
 *   node onboarding-screenshot.js
 */
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BASE_URL  = process.env.MOCKUP_URL || 'https://money.swiftapps.my';
const OUT_DIR   = path.join(__dirname, 'output');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PHONE = { w: 390, h: 844 };
const FORMATS = {
    square:   { w: 1080, h: 1080 },
    portrait: { w: 1080, h: 1350 },
};

// Unique test email so it doesn't clash on retries
const TEST_EMAIL = `test.onboard.${Date.now()}@swiftmoney.test`;
const TEST_PASS  = 'TestPass2026!';
const TEST_NAME  = 'Pengguna Baru';

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function escapeXml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function makePhoneMockup(screenshotPath, label) {
    const SCALE = 2.5;
    const W = Math.round(PHONE.w * SCALE);
    const H = Math.round(PHONE.h * SCALE);
    const R = 80;

    const resized = await sharp(screenshotPath).resize(W, H, { fit: 'cover', position: 'top' }).toBuffer();

    const mask = Buffer.from(`<svg width="${W}" height="${H}">
        <rect x="0" y="0" width="${W}" height="${H}" rx="${R}" ry="${R}" fill="white"/>
    </svg>`);

    const rounded = await sharp(resized).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

    const border = Buffer.from(`<svg width="${W+8}" height="${H+8}">
        <rect x="0" y="0" width="${W+8}" height="${H+8}" rx="${R+4}" ry="${R+4}" fill="#1e1b4b"/>
    </svg>`);

    const withBorder = await sharp(border).composite([{ input: rounded, left: 4, top: 4 }]).png().toBuffer();
    const mockupPath = path.join(OUT_DIR, `mockup-${label}.png`);
    await sharp(withBorder).toFile(mockupPath);
    console.log(`  Mockup:  mockup-${label}.png`);
    return mockupPath;
}

async function compositeCard(mockupPath, formatKey, label, tagline) {
    const fmt = FORMATS[formatKey];
    const meta = await sharp(mockupPath).metadata();
    const maxH  = Math.round(fmt.h * 0.75);
    const scale = Math.min(maxH / meta.height, (fmt.w * 0.85) / meta.width);
    const fW = Math.round(meta.width * scale);
    const fH = Math.round(meta.height * scale);
    const left = Math.round((fmt.w - fW) / 2);
    const top  = Math.round((fmt.h - fH) / 2) - Math.round(fmt.h * 0.04);

    const resized = await sharp(mockupPath).resize(fW, fH).toBuffer();

    const bgSvg = Buffer.from(`<svg width="${fmt.w}" height="${fmt.h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0f0c29"/>
                <stop offset="50%" stop-color="#1a1040"/>
                <stop offset="100%" stop-color="#24243e"/>
            </linearGradient>
            <radialGradient id="g1" cx="25%" cy="40%" r="45%">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#0f0c29" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="g2" cx="75%" cy="65%" r="40%">
                <stop offset="0%" stop-color="#a855f7" stop-opacity="0.22"/>
                <stop offset="100%" stop-color="#24243e" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="${fmt.w}" height="${fmt.h}" fill="url(#bg)"/>
        <ellipse cx="${fmt.w*0.25}" cy="${fmt.h*0.4}" rx="${fmt.w*0.5}" ry="${fmt.h*0.35}" fill="url(#g1)"/>
        <ellipse cx="${fmt.w*0.75}" cy="${fmt.h*0.65}" rx="${fmt.w*0.5}" ry="${fmt.h*0.35}" fill="url(#g2)"/>
    </svg>`);

    const brandY   = top + fH + Math.round(fmt.h * 0.04);
    const titleSz  = Math.round(fmt.w * 0.046);
    const subtitleSz = Math.round(fmt.w * 0.028);
    const domainSz = Math.round(fmt.w * 0.022);

    const brandSvg = Buffer.from(`<svg width="${fmt.w}" height="${fmt.h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="gt" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#a78bfa"/>
                <stop offset="100%" stop-color="#818cf8"/>
            </linearGradient>
        </defs>
        <text x="${fmt.w/2}" y="${brandY}" font-family="Arial,sans-serif" font-size="${titleSz}"
            font-weight="bold" fill="url(#gt)" text-anchor="middle">SwiftMoney</text>
        <text x="${fmt.w/2}" y="${brandY + titleSz*1.35}" font-family="Arial,sans-serif"
            font-size="${subtitleSz}" fill="#c4b5fd" text-anchor="middle">${escapeXml(tagline)}</text>
        <text x="${fmt.w/2}" y="${fmt.h - Math.round(fmt.h*0.022)}" font-family="Arial,sans-serif"
            font-size="${domainSz}" fill="#6366f1" text-anchor="middle">money.swiftapps.my</text>
    </svg>`);

    const outPath = path.join(OUT_DIR, `${formatKey}-onboarding-${label}.png`);
    await sharp({ create: { width: fmt.w, height: fmt.h, channels: 4, background: '#0f0c29' } })
        .composite([{ input: bgSvg }, { input: resized, left, top }, { input: brandSvg }])
        .png()
        .toFile(outPath);
    console.log(`  Social:  ${formatKey}-onboarding-${label}.png`);
    return outPath;
}

(async () => {
    console.log('SwiftMoney — Onboarding Screen Screenshot');
    console.log('==========================================');
    console.log(`Target: ${BASE_URL}`);
    console.log(`Temp user: ${TEST_EMAIL}\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: PHONE.w, height: PHONE.h, deviceScaleFactor: 2 });

    // ── Step 1: Register temp user ──
    console.log('Step 1: Registering temp user...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle2' });
    await wait(800);

    await page.type('input[name="name"]', TEST_NAME, { delay: 20 });
    await page.type('input[name="email"]', TEST_EMAIL, { delay: 20 });
    await page.type('input[name="password"]', TEST_PASS, { delay: 20 });
    await page.type('input[name="password_confirmation"]', TEST_PASS, { delay: 20 });
    await page.click('form button');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await wait(1200);

    const url = page.url();
    console.log(`  Landed: ${url}`);

    // ── Step 2: Capture onboarding screen ──
    console.log('\nStep 2: Capturing onboarding screen...');

    // State A — fresh after register (onboarding form visible)
    const rawPath = path.join(OUT_DIR, 'onboarding-raw.png');
    await page.screenshot({ path: rawPath });
    console.log('  Captured: onboarding-raw.png');

    // Scroll to show WA button if needed
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wait(300);
    const rawBottomPath = path.join(OUT_DIR, 'onboarding-raw-bottom.png');
    await page.screenshot({ path: rawBottomPath });
    console.log('  Captured: onboarding-raw-bottom.png');

    // ── Step 3: Phone mockup ──
    console.log('\nStep 3: Generating mockups...');
    const mockupTop    = await makePhoneMockup(rawPath, 'onboarding-top');
    const mockupBottom = await makePhoneMockup(rawBottomPath, 'onboarding-bottom');

    // ── Step 4: Social composites ──
    console.log('\nStep 4: Social composites...');
    await compositeCard(mockupTop, 'square',   'form',   'Setup mudah — satu langkah je');
    await compositeCard(mockupTop, 'portrait', 'form',   'Setup mudah — satu langkah je');
    await compositeCard(mockupBottom, 'square',   'wa', 'Ada masalah? Terus WhatsApp');
    await compositeCard(mockupBottom, 'portrait', 'wa', 'Ada masalah? Terus WhatsApp');

    await browser.close();

    console.log('\n==========================================');
    console.log('Done! Output:');
    fs.readdirSync(OUT_DIR)
        .filter(f => f.includes('onboarding'))
        .sort()
        .forEach(f => console.log(`  output/${f}`));

    console.log(`\nNote: Test account ${TEST_EMAIL} created in DB.`);
    console.log('Delete via admin panel atau artisan tinker bila dah tak perlu.');
})();
