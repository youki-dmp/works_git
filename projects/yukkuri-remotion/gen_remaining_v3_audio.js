const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio (1.2x) for: ${text.substring(0, 20)}...`);
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) return false;
    const query = await queryResponse.json();
    
    // Set speech speed to 1.2x
    query.speedScale = 1.2;
    
    const synthesisUrl = `${API_URL}/synthesis?speaker=${speakerId}`;
    const synthesisResponse = await fetch(synthesisUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    });
    if (!synthesisResponse.ok) return false;
    
    const buffer = Buffer.from(await synthesisResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return true;
}

async function main() {
    const dataPath = path.join(__dirname, 'all_prefectures_v2.json');
    const allRegions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const speakers = { zundamon: 3, metan: 2 };
    
    const targets = [
        {region: "kansai", prefs: ["kyoto", "osaka", "hyogo", "nara", "shiga", "wakayama", "mie"]},
        {region: "chugoku", prefs: ["tottori", "shimane", "okayama", "hiroshima", "yamaguchi"]},
        {region: "shikoku", prefs: ["tokushima", "kagawa", "ehime", "kochi"]},
        {region: "kyushu", prefs: ["fukuoka", "saga", "nagasaki", "kumamoto", "oita", "miyazaki", "kagoshima", "okinawa"]},
        {region: "hokkaido", prefs: ["hokkaido"]}
    ];

    for (const group of targets) {
        for (const prefId of group.prefs) {
            console.log(`--- Processing V3 Audio for: ${prefId} ---`);
            const dialogue = allRegions[group.region][prefId];
            const audioDir = path.join(__dirname, `video/public/audio/v3/${prefId}`);
            if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
            
            for (let i = 0; i < dialogue.length; i++) {
                const item = dialogue[i];
                if (item.audio && item.audio.includes(`v3/${prefId}/voice_v3_${i}.wav`)) {
                    console.log(`Skipping already generated: ${item.audio}`);
                    continue;
                }

                const speakerId = speakers[item.speaker] || 3;
                const outputFile = `voice_v3_${i}.wav`;
                const outputPath = path.join(audioDir, outputFile);
                
                if (await generateVoice(item.text, speakerId, outputPath)) {
                    item.audio = `v3/${prefId}/${outputFile}`;
                    const { execSync } = require('child_process');
                    try {
                        const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim();
                        item.duration = parseFloat(duration);
                    } catch (e) { item.duration = 4.0; }
                }
            }
        }
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(allRegions, null, 2));
    console.log('ALL remaining V3 audio generation complete!');
}

main();
