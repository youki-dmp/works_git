const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio (1.2x) for: ${text.substring(0, 20)}...`);
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) return false;
    const query = await queryResponse.json();
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
    
    // Specifically fix Tohoku paths to v3
    const tohokuPrefs = ["aomori", "iwate", "miyagi", "akita", "yamagata", "fukushima"];

    for (const prefId of tohokuPrefs) {
        console.log(`--- Fixing V3 Audio for: ${prefId} ---`);
        const dialogue = allRegions.tohoku[prefId];
        const audioDir = path.join(__dirname, `video/public/audio/v3/${prefId}`);
        if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
        
        for (let i = 0; i < dialogue.length; i++) {
            const item = dialogue[i];
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
    
    fs.writeFileSync(dataPath, JSON.stringify(allRegions, null, 2));
    console.log('Tohoku V3 audio generation complete!');
}

main();
