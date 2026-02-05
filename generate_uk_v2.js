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

const ukScript = [
    { speaker: "zundamon", text: "マスター！イギリスには『怪しい様子でサケ（鮭）を扱ってはいけない』という法律があるのだ！", speaker_id: 3 },
    { speaker: "master", text: "怪しいってどんな格好でやったらアウトなんだろう", speaker_id: 7 },
    { speaker: "metan", text: "ふふ、想像しちゃうわよね。これは1986年に制定された『サケ法』の第32条に実在する条文なのよ。", speaker_id: 2 },
    { speaker: "zundamon", text: "実際は格好の問題じゃなくて、密漁されたサケだと知りながら受け取ったり、売買したりするのを防ぐのが目的なのだ！", speaker_id: 3 },
    { speaker: "metan", text: "当時、鮭の密漁が深刻な社会問題になっていたから、流通経路を厳しく制限するために作られたのね。", speaker_id: 2 },
    { speaker: "zundamon", text: "でも条文のタイトルが『Handling Salmon in Suspicious Circumstances』、つまり『怪しい状況下でのサケの取り扱い』だからネタにされまくってるのだ！", speaker_id: 3 },
    { speaker: "master", text: "そういう闇取引の防止ってことね。でもこれだと他にも面白い法律ありそう", speaker_id: 7 },
    { speaker: "metan", text: "さすがマスター。イギリスには他にも『鎧を着て議会に入ってはいけない』とか、歴史を感じるユニークな法律がたくさんあるわよ。", speaker_id: 2 },
    { speaker: "zundamon", text: "古い法律をあえて残しておくのも、伝統を重んじるイギリスらしい文化なのだ！勉強になったのだ！", speaker_id: 3 },
    { speaker: "zundamon", text: "気に入ったらチャンネル登録と高評価よろしくなのだー！", speaker_id: 3 }
];

async function run() {
    const outputDir = `projects/yukkuri-remotion/video/public/audio/laws/uk_v2`;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const finalData = [];
    for (let i = 0; i < ukScript.length; i++) {
        const item = ukScript[i];
        const queryRes = await post('http://localhost:50021/audio_query', { text: item.text, speaker: item.speaker_id });
        const query = JSON.parse(queryRes.toString());
        query.speedScale = 1.2;
        const audioRes = await post('http://localhost:50021/synthesis', { speaker: item.speaker_id }, query);
        const filename = `voice_${i}.wav`;
        fs.writeFileSync(path.join(outputDir, filename), audioRes);
        finalData.push({
            speaker: item.speaker,
            text: item.text,
            audio: `laws/uk_v2/${filename}`,
            duration: getWavDuration(audioRes)
        });
    }
    fs.writeFileSync(`projects/yukkuri-remotion/video/src/laws_uk_v2.json`, JSON.stringify(finalData, null, 2));
    console.log("Done generating UK v2 data.");
}

run();
