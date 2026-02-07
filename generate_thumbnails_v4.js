const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const thumbnails = [
    {
        id: "01_swiss",
        title: "トイレ禁止!?",
        subtitle: "夜10時以降は通報対象!?",
        reaction: "警察くるのだ!",
        bg: "mountain.jpg"
    },
    {
        id: "02_singapore",
        title: "ガムで100万!?",
        subtitle: "シンガポールはガムが重罪!?",
        reaction: "ヤバすぎる!",
        bg: "city.jpg"
    },
    {
        id: "03_uk",
        title: "怪しい鮭!?",
        subtitle: "持ってるだけで逮捕される!?",
        reaction: "何それ!?",
        bg: "city.jpg"
    },
    {
        id: "04_canada",
        title: "小銭禁止!?",
        subtitle: "カナダでは支払いを拒否される!?",
        reaction: "えぇっ!?",
        bg: "city.jpg"
    }
];

async function generate() {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    const templatePath = 'file://' + path.resolve('projects/yukkuri-remotion/video/thumbnail_template.html');
    const outputDir = path.resolve('projects/yukkuri-remotion/FINAL_VIDEOS/LAWS');

    for (const thumb of thumbnails) {
        const url = `${templatePath}?title=${encodeURIComponent(thumb.title)}&subtitle=${encodeURIComponent(thumb.subtitle)}&reaction=${encodeURIComponent(thumb.reaction)}&bg=${encodeURIComponent(thumb.bg)}`;
        console.log(`Generating high-quality thumbnail for ${thumb.id}...`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        // Give fonts and images extra time to render
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outputDir, `${thumb.id}_thumb.png`) });
    }

    await browser.close();
    console.log("Done.");
}

generate().catch(console.error);
