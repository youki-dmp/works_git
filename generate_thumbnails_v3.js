const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const thumbnails = [
    {
        id: "01_swiss",
        title: "トイレ禁止！？",
        subtitle: "スイスの衝撃ルール",
        reaction: "警察くるのだ！",
        bg: "mountain.jpg"
    },
    {
        id: "02_singapore",
        title: "ガムで100万円！？",
        subtitle: "罰金の街シンガポール",
        reaction: "重罪すぎる！",
        bg: "city.jpg"
    },
    {
        id: "03_uk",
        title: "怪しい鮭は犯罪",
        subtitle: "イギリス 謎のサケ法",
        reaction: "堂々と持つ！",
        bg: "city.jpg"
    },
    {
        id: "04_canada",
        title: "小銭払いは「拒否」",
        subtitle: "カナダの意外な通貨法",
        reaction: "貯めすぎ注意！",
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
        console.log(`Generating YouTube-style thumbnail for ${thumb.id}...`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outputDir, `${thumb.id}_thumb.png`) });
    }

    await browser.close();
    console.log("Done.");
}

generate().catch(console.error);
