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
        id: "switzerland_toilet",
        title: "スイス：夜10時以降のトイレ",
        script: [
            { speaker: "zundamon", text: "めたん！スイスの一部のアパートでは『夜10時以降にトイレを流すのが禁止』らしいのだ！", speaker_id: 3 },
            { speaker: "metan", text: "ええっ！？生理現象なのに。どうしてそんなルールがあるのかしら。", speaker_id: 2 },
            { speaker: "zundamon", text: "騒音に対する規制が厳しくて、排水の音が近所迷惑になると考えられているのだ！", speaker_id: 3 },
            { speaker: "metan", text: "静かな環境を守るためとはいえ、ちょっと不便そうね。", speaker_id: 2 },
            { speaker: "zundamon", text: "最近は緩和されているところも多いけど、古い建物では今もマナーとして重要なのだ！", speaker_id: 3 },
            { speaker: "metan", text: "文化の違いね。スイスに行くときは気をつけなきゃ。", speaker_id: 2 },
            { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
        ]
    },
    {
        id: "italy_sandals",
        title: "イタリア：うるさいサンダル禁止",
        script: [
            { speaker: "zundamon", text: "めたん！イタリアのカプリ島では『音のうるさい履物』が禁止されているのだ！", speaker_id: 3 },
            { speaker: "metan", text: "ビーチサンダルとか？カプリ島ってリゾート地なのに不思議ね。", speaker_id: 2 },
            { speaker: "zundamon", text: "観光客が歩くときのパタパタ音が、島民の静かな生活を邪魔するかららしいのだ！", speaker_id: 3 },
            { speaker: "metan", text: "徹底しているわね。違反すると罰金を取られることもあるのかしら。", speaker_id: 2 },
            { speaker: "zundamon", text: "そうなのだ。観光に行くなら、音がしない静かな靴を選ぶのが正解なのだ！", speaker_id: 3 },
            { speaker: "metan", text: "郷に入っては郷に従え、ね。勉強になったわ。", speaker_id: 2 },
            { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
        ]
    }
];

async function run() {
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
            finalData.push({
                speaker: item.speaker,
                text: item.text,
                audio: `laws/${law.id}/${filename}`,
                duration: getWavDuration(audioRes)
            });
        }
        fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_${law.id}.json`, JSON.stringify(finalData, null, 2));
    }
    console.log("Done generating more laws data.");
}

run();
