const fs = require('fs');
const path = require('path');
const http = require('http');

const outputDir = "projects/yukkuri-remotion/video/public/audio/laws/switzerland_hybrid";
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const script = [
    { speaker: "zundamon", text: "マスター！スイスの一部のアパートでは、夜10時以降にトイレを流すのが禁止らしいのだ！", speaker_id: 3 },
    { speaker: "master", text: "えっ、夜ふかししてたらトイレにいけないってこと？！飲み会後とかどうしたらいいの？！", speaker_id: 7 },
    { speaker: "metan", text: "ふふ、マスター。実はこれ、騒音トラブルを防ぐためのマナーが法律に近い形で残っているのよ。", speaker_id: 2 },
    { speaker: "zundamon", text: "流す音が近所迷惑になるかららしいのだ。でも最近は緩和されてる所も多いから安心していいのだ！", speaker_id: 3 },
    { speaker: "metan", text: "それでも古い建物だと要注意ね。スイスに行くときは気をつけなきゃ。", speaker_id: 2 },
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
            audio: `laws/switzerland_hybrid/${filename}`,
            duration: getWavDuration(audioRes)
        });
    }
    fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_switzerland_hybrid.json`, JSON.stringify(finalData, null, 2));
    console.log("Done.");
}

run();
