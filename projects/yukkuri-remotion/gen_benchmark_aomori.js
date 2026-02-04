const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:50021';

async function generateVoice(text, speakerId, outputPath) {
    console.log(`Generating audio (1.2x) for: ${text.substring(0, 20)}...`);
    const queryUrl = `${API_URL}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
    const queryResponse = await fetch(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) return false;
    const query = await queryResponse.json();
    query.speedScale = 1.2;
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

const dialogue = [
    {"speaker": "metan", "text": "実は森だけじゃなかった！？青森という名前の衝撃の由来！"},
    {"speaker": "both", "text": "1分で青森県を紹介！"},
    {"speaker": "metan", "text": "ずんだもん、青森は森が青いから青森だと思ってる？"},
    {"speaker": "zundamon", "text": "違うのだ！？森が目印だったって聞いたのだ！"},
    {"speaker": "metan", "text": "そう、江戸時代に青森港へ入る船の目印だった、青々とした森が由来なの。まさに海の安全を守るランドマークだったのよ。"},
    {"speaker": "zundamon", "text": "海の標識だったのだ！じゃあ、県になったのはいつなのだ？"},
    {"speaker": "metan", "text": "1871年、最初は弘前県として誕生したの。でもすぐに県庁が今の青森市に移って青森県に。本州最北端を守る北の要として、独自の発展を遂げていったのよ。"},
    {"speaker": "zundamon", "text": "北の守護神なのだ！今は人口約120万人で、リンゴが最強なのだ！"},
    {"speaker": "metan", "text": "ええ、でもリンゴだけじゃないわ。世界遺産の三内丸山遺跡のように、縄文時代から1万年以上も栄えてきた、日本最古級の文明の地でもあるのよ。"},
    {"speaker": "zundamon", "text": "歴史もリンゴも濃密すぎるのだ！青森最高なのだ！"},
    {"speaker": "metan", "text": "ふふ、また次の授業で会いましょう。"}
];

async function main() {
    const audioDir = path.join(__dirname, 'video/public/audio/aomori_v3');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    
    const results = [];
    const speakers = { zundamon: 3, metan: 2, both: 2 }; // Both will use Metan for now or I could mix
    
    for (let i = 0; i < dialogue.length; i++) {
        const item = dialogue[i];
        const speakerId = speakers[item.speaker];
        const outputFile = `voice_v3_${i}.wav`;
        const outputPath = path.join(audioDir, outputFile);
        
        if (await generateVoice(item.text, speakerId, outputPath)) {
            const { execSync } = require('child_process');
            const duration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`).toString().trim());
            results.push({ ...item, audio: `aomori_v3/${outputFile}`, duration });
        }
    }
    fs.writeFileSync(path.join(__dirname, 'aomori_v3_data.json'), JSON.stringify(results, null, 2));
    console.log('Benchmark audio complete!');
}

main();
