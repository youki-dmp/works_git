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
        id: "switzerland_v2",
        title: "スイス：夜10時以降のトイレ禁止",
        script: [
            { speaker: "zundamon", text: "マスター！スイスの一部のアパートでは、夜10時以降にトイレを流すのが禁止らしいのだ！", speaker_id: 3 },
            { speaker: "master", text: "えっ、夜ふかししてたらトイレにいけないってこと？！飲み会後とかどうしたらいいの？！", speaker_id: 7 },
            { speaker: "metan", text: "ふふ、マスター。実はこれ、法律というよりは建物ごとの『管理規約』として厳格に守られているマナーなのよ。", speaker_id: 2 },
            { speaker: "zundamon", text: "スイスには『騒音規制法』があって、夜10時から翌朝7時までは『安眠を妨げる音』を出してはいけないことになっているのだ！", speaker_id: 3 },
            { speaker: "metan", text: "トイレの排水音だけでなく、シャワーを浴びたり洗濯機を回したりするのもNGな場合が多いわね。", speaker_id: 2 },
            { speaker: "zundamon", text: "もし違反して大きな音を立てると、近隣住人からガチで警察に通報されることもあるのだ！恐ろしすぎるのだ！", speaker_id: 3 },
            { speaker: "master", text: "警察！？トイレ流しただけで逮捕は勘弁してほしいな...", speaker_id: 7 },
            { speaker: "metan", text: "最近の新しいマンションは防音がしっかりしているから大丈夫なことも多いけど、古い建物は要注意ね。", speaker_id: 2 },
            { speaker: "zundamon", text: "スイス人は静寂を愛する文化なのだ。郷に入っては郷に従え、なのだ！", speaker_id: 3 },
            { speaker: "metan", text: "旅行や留学でスイスに行くときは、事前にその建物のルールを確認しておくのが正解ね。勉強になったわ。", speaker_id: 2 },
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
            query.speedScale = 1.2; // User requested 1.2x

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
    console.log("Done.");
}

run();
