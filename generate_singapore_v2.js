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

const singaporeScript = [
    { speaker: "zundamon", text: "マスター！シンガポールでガムを噛んだら重罪だって知ってたのだ！？", speaker_id: 3 },
    { speaker: "master", text: "え？ガムを道端に吐いたらじゃなくて、噛むだけで？？？", speaker_id: 7 },
    { speaker: "metan", text: "正確には、1992年からガムの輸入と販売が法律で禁止されているのよ。噛むこと自体はグレーだけど、入手ルートがほぼ無いから実質禁止ね。", speaker_id: 2 },
    { speaker: "zundamon", text: "理由は、地下鉄のドアにガムが挟まって、列車の運行が遅れる事件が多発したのがきっかけなのだ！", speaker_id: 3 },
    { speaker: "metan", text: "街の清潔さを保つためだけじゃなく、公共インフラを守るための切実な理由があったのね。", speaker_id: 2 },
    { speaker: "zundamon", text: "もし無許可で持ち込もうとすると、最高1万ドル、日本円で約110万円の罰金や禁錮刑になる可能性があるのだ！", speaker_id: 3 },
    { speaker: "master", text: "日本円で100万…！とても重い罪だね。実際に罰金刑はあったの？", speaker_id: 7 },
    { speaker: "metan", text: "実際に数千ドルの罰金を科されたケースはあるわ。特に大量持ち込みや販売は厳格に取り締まられるの。", speaker_id: 2 },
    { speaker: "zundamon", text: "現在は、禁煙用や歯科用のガムだけは医師の処方があればOKになったのだ。", speaker_id: 3 },
    { speaker: "metan", text: "徹底したルールが、あの美しい景観を支えているのね。勉強になったわ。", speaker_id: 2 },
    { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
];

async function run() {
    const outputDir = `projects/yukkuri-remotion/video/public/audio/laws/singapore_v2`;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const finalData = [];
    for (let i = 0; i < singaporeScript.length; i++) {
        const item = singaporeScript[i];
        const queryRes = await post('http://localhost:50021/audio_query', { text: item.text, speaker: item.speaker_id });
        const query = JSON.parse(queryRes.toString());
        query.speedScale = 1.2;
        const audioRes = await post('http://localhost:50021/synthesis', { speaker: item.speaker_id }, query);
        const filename = `voice_${i}.wav`;
        fs.writeFileSync(path.join(outputDir, filename), audioRes);
        finalData.push({
            speaker: item.speaker,
            text: item.text,
            audio: `laws/singapore_v2/${filename}`,
            duration: getWavDuration(audioRes)
        });
    }
    fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_singapore_v2.json`, JSON.stringify(finalData, null, 2));
    console.log("Done generating Singapore v2 data.");
}

run();
