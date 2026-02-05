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

const laws = [
    {
        id: "uk_salmon",
        title: "イギリス：怪しい鮭の所持",
        script: [
            { speaker: "zundamon", text: "めたん！イギリスには『怪しい様子でサケを持ってはいけない』という法律があるのだ！", speaker_id: 3 },
            { speaker: "metan", text: "サケ？魚の鮭のこと？どういうことかしら。", speaker_id: 2 },
            { speaker: "zundamon", text: "1986年に制定されたサケ法で、密漁されたサケを扱うのを防ぐための法律なのだ！", speaker_id: 3 },
            { speaker: "metan", text: "『怪しい様子』っていう表現が独特で面白いわね。", speaker_id: 2 },
            { speaker: "zundamon", text: "実際は密漁対策だけど、言葉だけ見るとシュールなのだ。鮭を持つときは堂々とするのだ！", speaker_id: 3 },
            { speaker: "metan", text: "そうね、変にコソコソしないように気をつけるわ。", speaker_id: 2 },
            { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
        ]
    },
    {
        id: "canada_coins",
        title: "カナダ：小銭の大量支払い禁止",
        script: [
            { speaker: "zundamon", text: "めたん！カナダでは『大量の小銭で払おうとすると拒否される』法律があるのだ！", speaker_id: 3 },
            { speaker: "metan", text: "えっ、お金なのに？何枚からダメなのかしら。", speaker_id: 2 },
            { speaker: "zundamon", text: "10ドル以上の買い物で、1ドル硬貨だけで払うのはダメ、とか細かく決まっているのだ！", speaker_id: 3 },
            { speaker: "metan", text: "レジの人が数えるのが大変だからかしら。合理的な法律ね。", speaker_id: 2 },
            { speaker: "zundamon", text: "通貨法で決まっている正式なルールなのだ。小銭を貯め込みすぎないように注意なのだ！", speaker_id: 3 },
            { speaker: "metan", text: "キャッシュレスが進んでる現代らしい悩みね。勉強になったわ。", speaker_id: 2 },
            { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
        ]
    }
];

async function run() {
    const results = {};
    for (const law of laws) {
        const outputDir = `projects/yukkuri-remotion/video/public/audio/laws/${law.id}`;
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const finalData = [];
        console.log(`Processing ${law.title}...`);
        for (let i = 0; i < law.script.length; i++) {
            const item = law.script[i];
            const queryRes = await post('http://localhost:50021/audio_query', { text: item.text, speaker: item.speaker_id });
            const query = JSON.parse(queryRes.toString());
            query.speedScale = 1.25;
            const audioRes = await post('http://localhost:50021/synthesis', { speaker: item.speaker_id }, query);
            const filename = `voice_${i}.wav`;
            fs.writeFileSync(path.join(outputDir, filename), audioRes);
            finalData.append = finalData.push({
                speaker: item.speaker,
                text: item.text,
                audio: `laws/${law.id}/${filename}`,
                duration: getWavDuration(audioRes)
            });
        }
        fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_${law.id}.json`, JSON.stringify(finalData, null, 2));
        results[law.id] = finalData;
    }
    console.log("Done generating laws data.");
}

run();
