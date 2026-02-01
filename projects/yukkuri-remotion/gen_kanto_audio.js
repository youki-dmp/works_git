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
    const seriesPath = path.join(__dirname, 'kanto_series.json');
    const series = JSON.parse(fs.readFileSync(seriesPath, 'utf8'));
    
    const speakers = {
        zundamon: 3,
        metan: 2
    };
    
    for (const prefecture in series) {
        console.log(`--- Processing ${prefecture} ---`);
        const dialogue = series[prefecture];
        const audioDir = path.join(__dirname, `video/public/audio/${prefecture}`);
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        for (let i = 0; i < dialogue.length; i++) {
            const item = dialogue[i];
            const speakerId = speakers[item.speaker] || 3;
            const outputFile = `voice_${i}.wav`;
            const outputPath = path.join(audioDir, outputFile);
            
            const success = await generateVoice(item.text, speakerId, outputPath);
            if (success) {
                item.audio = `${prefecture}/${outputFile}`;
                // Get duration using ffprobe (sync exec for simplicity)
                const { execSync } = require('child_process');
                const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim();
                item.duration = parseFloat(duration);
            }
        }
    }
    
    fs.writeFileSync(seriesPath, JSON.stringify(series, null, 2));
    console.log('Kanto series audio generation complete!');
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.error(e);
    }
})();
