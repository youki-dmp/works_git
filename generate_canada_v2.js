const fs = require('fs');
const path = require('path');
const http = require('http');

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

const canadaScript = [
    { speaker: "zundamon", text: "マスター！カナダには『大量の小銭で払おうとすると拒否される』法律があるのだ！", speaker_id: 3 },
    { speaker: "master", text: "たくさんの小銭で払われると数えるのも大変だからね。面白い法律だね", speaker_id: 7 },
    { speaker: "metan", text: "ふふ、マスター。これはカナダの『通貨法（Currency Act）』の第8条で定められているれっきとした法律なのよ。", speaker_id: 2 },
    { speaker: "zundamon", text: "例えば、10ドル以上の買い物で『全部1ドル硬貨』で払おうとしても、お店側にはそれを拒否する権利があるのだ！", speaker_id: 3 },
    { speaker: "metan", text: "25セント硬貨なら10ドル分まで、5セント硬貨ならわずか2ドル分まで、といった具合に、硬貨の種類ごとに細かく上限が決まっているの。", speaker_id: 2 },
    { speaker: "zundamon", text: "日本でも『一種類の硬貨は20枚まで』という法律があるけど、カナダは金額ベースで決まっているのが特徴なのだ！", speaker_id: 3 },
    { speaker: "master", text: "日本でも小銭はためすぎずに使っていかないとね", speaker_id: 7 },
    { speaker: "metan", text: "嫌がらせで小銭の山を押し付けるのを防ぐための、合理的なルールね。勉強になったわ。", speaker_id: 2 },
    { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
];

async function run() {
    const outputDir = `projects/yukkuri-remotion/video/public/audio/laws/canada_v2`;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const finalData = [];
    for (let i = 0; i < canadaScript.length; i++) {
        const item = canadaScript[i];
        const queryRes = await post('http://localhost:50021/audio_query', { text: item.text, speaker: item.speaker_id });
        const query = JSON.parse(queryRes.toString());
        query.speedScale = 1.2;
        const audioRes = await post('http://localhost:50021/synthesis', { speaker: item.speaker_id }, query);
        const filename = `voice_${i}.wav`;
        fs.writeFileSync(path.join(outputDir, filename), audioRes);
        finalData.push({
            speaker: item.speaker,
            text: item.text,
            audio: `laws/canada_v2/${filename}`,
            duration: getWavDuration(audioRes)
        });
    }
    fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_canada_v2.json`, JSON.stringify(finalData, null, 2));
    console.log("Done generating Canada v2 data.");
}

run();
