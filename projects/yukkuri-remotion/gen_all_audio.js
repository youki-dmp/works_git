const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio for: ${text.substring(0, 20)}...`);
    
    // 1. Create Audio Query
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) {
        console.error(`Error creating audio query: ${await queryResponse.text()}`);
        return false;
    }
    const query = await queryResponse.json();
    
    // 2. Synthesis
    const synthesisUrl = `${API_URL}/synthesis?speaker=${speakerId}`;
    const synthesisResponse = await fetch(synthesisUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
    });
    if (!synthesisResponse.ok) {
        console.error(`Error synthesis: ${await synthesisResponse.text()}`);
        return false;
    }
    
    const buffer = Buffer.from(await synthesisResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return true;
}

async function main() {
    const dataPath = path.join(__dirname, 'all_prefectures.json');
    const allRegions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const speakers = {
        zundamon: 3,
        metan: 2
    };
    
    for (const region in allRegions) {
        console.log(`--- Processing Region: ${region} ---`);
        const prefectures = allRegions[region];
        
        for (const prefId in prefectures) {
            console.log(`  Processing Prefecture: ${prefId}`);
            const dialogue = prefectures[prefId];
            const audioDir = path.join(__dirname, `video/public/audio/${prefId}`);
            
            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }
            
            for (let i = 0; i < dialogue.length; i++) {
                const item = dialogue[i];
                if (item.audio) continue; // Skip if already generated
                
                const speakerId = speakers[item.speaker] || 3;
                const outputFile = `voice_${i}.wav`;
                const outputPath = path.join(audioDir, outputFile);
                
                const success = await generateVoice(item.text, speakerId, outputPath);
                if (success) {
                    item.audio = `${prefId}/${outputFile}`;
                    const { execSync } = require('child_process');
                    try {
                        const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim();
                        item.duration = parseFloat(duration);
                    } catch (e) {
                        item.duration = 4.0; // Fallback
                    }
                }
            }
        }
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(allRegions, null, 2));
    console.log('All audio generation complete!');
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.error(e);
    }
})();
