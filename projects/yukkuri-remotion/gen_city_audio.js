const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio for: ${text.substring(0, 20)}...`);
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) return false;
    const query = await queryResponse.json();
    
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
    const dataPath = path.join(__dirname, 'all_cities.json');
    const allCities = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const speakers = { zundamon: 3, metan: 2 };
    
    for (const cityId in allCities) {
        console.log(`--- Processing City: ${cityId} ---`);
        const dialogue = allCities[cityId];
        const audioDir = path.join(__dirname, `video/public/audio/cities/${cityId}`);
        if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
        
        for (let i = 0; i < dialogue.length; i++) {
            const item = dialogue[i];
            const speakerId = speakers[item.speaker] || 3;
            const outputFile = `voice_${i}.wav`;
            const outputPath = path.join(audioDir, outputFile);
            
            if (await generateVoice(item.text, speakerId, outputPath)) {
                item.audio = `cities/${cityId}/${outputFile}`;
                const { execSync } = require('child_process');
                try {
                    const duration = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim();
                    item.duration = parseFloat(duration);
                } catch (e) { item.duration = 4.0; }
            }
        }
    }
    fs.writeFileSync(dataPath, JSON.stringify(allCities, null, 2));
    console.log('City audio generation complete!');
}

(async () => { await main(); })();
