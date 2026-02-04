const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio for: ${text.substring(0, 20)}...`);
    
    // 1. Create Audio Query
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) return false;
    const query = await queryResponse.json();
    
    // ADJUSTMENT: Set speech speed to 1.2x
    query.speedScale = 1.2;
    
    // 2. Synthesis
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
    // This script will be used for NEW scripts to generate 1.2x speed audio
    const dataPath = process.argv[2]; 
    if (!dataPath) {
        console.error("Please provide a json path");
        return;
    }
    
    const series = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const speakers = { zundamon: 3, metan: 2 };
    
    for (const id in series) {
        console.log(`--- Processing: ${id} ---`);
        const dialogue = series[id];
        const audioDir = path.join(__dirname, `video/public/audio/speed12/${id}`);
        if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
        
        for (let i = 0; i < dialogue.length; i++) {
            const item = dialogue[i];
            const speakerId = speakers[item.speaker] || 3;
            const outputFile = `voice_${i}.wav`;
            const outputPath = path.join(audioDir, outputFile);
            
            if (await generateVoice(item.text, speakerId, outputPath)) {
                item.audio = `speed12/${id}/${outputFile}`;
                const { execSync } = require('child_process');
                try {
                    const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim();
                    item.duration = parseFloat(duration);
                } catch (e) { item.duration = 3.0; }
            }
        }
    }
    fs.writeFileSync(dataPath, JSON.stringify(series, null, 2));
    console.log('Audio generation (1.2x speed) complete!');
}

main();
