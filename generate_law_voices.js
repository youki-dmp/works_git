const fs = require('fs');
const path = require('path');
const http = require('http');

const outputDir = "projects/yukkuri-remotion/video/public/audio/laws/singapore";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const script = [
    { speaker: "zundamon", text: "めたん！シンガポールでガムを噛んだら重罪だって知ってたのだ！？", speaker_id: 3 },
    { speaker: "metan", text: "あら、有名な話ね。でも本当に逮捕されるのかしら？", speaker_id: 2 },
    { speaker: "zundamon", text: "ガムを持ち込むだけで、最大1万ドルの罰金や禁錮刑になる可能性があるのだ！恐ろしすぎるのだ！", speaker_id: 3 },
    { speaker: "metan", text: "昔、ガムのポイ捨てが地下鉄のドアを故障させたのがきっかけなのよね。", speaker_id: 2 },
    { speaker: "zundamon", text: "現在は医療用ならOKだけど、基本は禁止なのだ。街を綺麗に保つための超強力なルールなのだ！", speaker_id: 3 },
    { speaker: "metan", text: "綺麗な街には厳しいルールがあるってことね。勉強になったわ。", speaker_id: 2 },
    { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
];

async function post(url, params, body = null) {
    const urlWithParams = new URL(url);
    Object.keys(params).forEach(key => urlWithParams.searchParams.append(key, params[key]));
    
    return new Promise((resolve, reject) => {
        const req = http.request(urlWithParams, {
            method: 'POST',
            headers: body ? { 'Content-Type': 'application/json' } : {}
        }, (res) => {
            let data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// Simple wav duration parser
function getWavDuration(buffer) {
    const byteRate = buffer.readUInt32LE(28);
    const dataSize = buffer.readUInt32LE(40);
    return Math.round((dataSize / byteRate) * 100) / 100;
}

async function run() {
    const finalData = [];
    for (let i = 0; i < script.length; i++) {
        const item = script[i];
        console.log(`Generating ${i}...`);
        
        const queryRes = await post('http://localhost:50021/audio_query', { text: item.text, speaker: item.speaker_id });
        const query = JSON.parse(queryRes.toString());
        query.speedScale = 1.25;

        const audioRes = await post('http://localhost:50021/synthesis', { speaker: item.speaker_id }, query);
        const filename = `voice_${i}.wav`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, audioRes);

        finalData.push({
            speaker: item.speaker,
            text: item.text,
            audio: `laws/singapore/${filename}`,
            duration: getWavDuration(audioRes)
        });
    }
    console.log(JSON.stringify(finalData, null, 2));
}

run();
