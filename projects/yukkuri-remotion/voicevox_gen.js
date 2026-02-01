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
    const dataPath = path.join(__dirname, 'video/src/data.json');
    const dialogue = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const audioDir = path.join(__dirname, 'video/public/audio');
    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const speakers = {
        zundamon: 3,
        metan: 2
    };
    
    for (let i = 0; i < dialogue.length; i++) {
        const item = dialogue[i];
        const speakerId = speakers[item.speaker] || 3;
        const outputFile = `voice_${i}.wav`;
        const outputPath = path.join(audioDir, outputFile);
        
        const success = await generateVoice(item.text, speakerId, outputPath);
        if (success) {
            item.audio = outputFile;
        } else {
            console.error(`Failed to generate audio for line ${i}`);
        }
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(dialogue, null, 2));
    console.log('Audio generation complete!');
}

async function waitForService() {
    for (let i = 0; i < 20; i++) {
        try {
            const response = await fetch(`${API_URL}/version`);
            if (response.ok) {
                console.log('VOICEVOX service is ready!');
                return true;
            }
        } catch (e) {
            console.log('Waiting for VOICEVOX...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

(async () => {
    if (await waitForService()) {
        await main();
    } else {
        console.error('VOICEVOX service timed out.');
    }
})();
