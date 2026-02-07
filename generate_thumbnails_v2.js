const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const thumbnails = [
    {
        id: "01_swiss",
        title: "夜10時以降 トイレ禁止！？",
        subtitle: "スイスの厳しすぎる騒音ルール",
        reaction: "飲み会後どうすんの！？",
        bg: "mountain.jpg"
    },
    {
        id: "02_singapore",
        title: "ガムで罰金100万円！？",
        subtitle: "シンガポール「罰金の街」の真実",
        reaction: "噛むだけで重罪！？",
        bg: "city.jpg"
    },
    {
        id: "03_uk",
        title: "怪しい鮭は犯罪です。",
        subtitle: "英国サケ法第32条の衝撃",
        reaction: "どんな格好ならOK？",
        bg: "city.jpg"
    },
    {
        id: "04_canada",
        title: "小銭払いは『違法』！？",
        subtitle: "カナダ通貨法の意外なルール",
        reaction: "日本でもためすぎ注意！",
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

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const thumb of thumbnails) {
        const url = `${templatePath}?title=${encodeURIComponent(thumb.title)}&subtitle=${encodeURIComponent(thumb.subtitle)}&reaction=${encodeURIComponent(thumb.reaction)}&bg=${encodeURIComponent(thumb.bg)}`;
        console.log(`Generating thumbnail for ${thumb.id}...`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outputDir, `${thumb.id}_thumb.png`) });
    }

    await browser.close();
    console.log("Done.");
}

generate().catch(console.error);
