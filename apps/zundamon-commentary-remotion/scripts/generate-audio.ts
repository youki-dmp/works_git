import fs from "fs";
import path from "path";

// 定数設定
const FPS = 30;
const VOICEVOX_HOST = process.env.VOICEVOX_HOST || "http://localhost:50021";
const SCRIPT_PATH = path.join(__dirname, "../src/data/script.json");
const TIMELINE_PATH = path.join(__dirname, "../src/data/timeline.json");
const AUDIO_DIR = path.join(__dirname, "../public/audio");

interface Dialogue {
  id: number;
  speaker: string;
  text: string;
  expression: string;
  slide?: string;
  action?: string;
}

interface SpeakerConfig {
  name: string;
  voicevoxSpeakerId: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  strokeColor: string;
  position: "left" | "right";
}

interface ScriptData {
  title: string;
  bgm?: string;
  speakers: Record<string, SpeakerConfig>;
  dialogues: Dialogue[];
}

interface PhonemeKeyframe {
  frameOffset: number; // セリフ開始からの相対フレーム
  vowel: "a" | "i" | "u" | "e" | "o" | "closed";
}

export interface TimelineItem {
  id: number;
  speaker: string;
  text: string;
  expression: string;
  slide?: string;
  audioFile: string;
  startFrame: number;
  durationInFrames: number;
  phonemes: PhonemeKeyframe[];
}

export interface TimelineData {
  title: string;
  fps: number;
  totalDurationInFrames: number;
  speakers: Record<string, SpeakerConfig>;
  timeline: TimelineItem[];
}

// 簡易WAVバイナリ生成（44.1kHz, 16bit, モノラル、無音）
function createSilentWav(durationSeconds: number): Buffer {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE((sampleRate * numChannels * bitsPerSample) / 8, 28); // ByteRate
  buffer.writeUInt16LE((numChannels * bitsPerSample) / 8, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM data (0 for silence)
  buffer.fill(0, 44);

  return buffer;
}

// VOICEVOX API ヘルスチェック
async function checkVoicevox(): Promise<boolean> {
  try {
    const res = await fetch(`${VOICEVOX_HOST}/version`, { method: "GET" });
    if (res.ok) {
      const ver = await res.text();
      console.log(`[VOICEVOX] 接続成功 (version: ${ver})`);
      return true;
    }
  } catch {
    // 接続不可
  }
  return false;
}

// VOICEVOX 音声クエリとWAV合成
async function synthesizeVoicevox(text: string, speakerId: number) {
  // 1. AudioQuery 取得
  const queryUrl = `${VOICEVOX_HOST}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
  const queryRes = await fetch(queryUrl, { method: "POST" });
  if (!queryRes.ok) {
    throw new Error(`audio_query failed: ${queryRes.statusText}`);
  }
  const audioQuery = (await queryRes.json()) as any;

  // 2. 音声合成 (WAV)
  const synthUrl = `${VOICEVOX_HOST}/synthesis?speaker=${speakerId}`;
  const synthRes = await fetch(synthUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(audioQuery),
  });
  if (!synthRes.ok) {
    throw new Error(`synthesis failed: ${synthRes.statusText}`);
  }
  const arrayBuffer = await synthRes.arrayBuffer();
  const wavBuffer = Buffer.from(arrayBuffer);

  // 3. モーラ情報から音素タイミングを抽出
  const phonemes: PhonemeKeyframe[] = [];
  let currentTimeSec = 0;

  if (audioQuery.accent_phrases) {
    for (const phrase of audioQuery.accent_phrases) {
      if (phrase.pause_mora) {
        currentTimeSec += phrase.pause_mora.vowel_length || 0;
      }
      for (const mora of phrase.moras) {
        if (mora.consonant_length) {
          currentTimeSec += mora.consonant_length;
        }
        const vowel = mora.vowel?.toLowerCase();
        const validVowel = ["a", "i", "u", "e", "o"].includes(vowel) ? vowel : "closed";
        const frameOffset = Math.round(currentTimeSec * FPS);
        phonemes.push({
          frameOffset,
          vowel: validVowel as any,
        });
        currentTimeSec += mora.vowel_length || 0;
      }
    }
  }

  // 音声の総秒数（クエリの末尾無音などを含めた推定またはWAV長）
  const durationSeconds = currentTimeSec + 0.3; // 余白0.3秒
  const durationInFrames = Math.ceil(durationSeconds * FPS);

  return {
    wavBuffer,
    durationInFrames,
    phonemes,
  };
}

// モックモード（VOICEVOX未起動時のフォールバック）
function synthesizeMock(text: string) {
  // 1文字あたり 0.16 秒（約 4.8 フレーム）
  const charCount = text.length;
  const durationSeconds = Math.max(1.8, charCount * 0.16 + 0.5);
  const durationInFrames = Math.ceil(durationSeconds * FPS);

  // 簡易的に母音キーフレームを生成（口パクのアニメーション）
  const vowels: ("a" | "i" | "u" | "e" | "o" | "closed")[] = ["a", "i", "u", "e", "o"];
  const phonemes: PhonemeKeyframe[] = [];

  for (let f = 0; f < durationInFrames - 10; f += 4) {
    const vowel = vowels[Math.floor(Math.random() * vowels.length)];
    phonemes.push({ frameOffset: f, vowel });
  }
  phonemes.push({ frameOffset: durationInFrames - 5, vowel: "closed" });

  const wavBuffer = createSilentWav(durationSeconds);

  return {
    wavBuffer,
    durationInFrames,
    phonemes,
  };
}

async function main() {
  console.log("=== 台本音声 & タイムライン生成スクリプト ===");

  if (!fs.existsSync(SCRIPT_PATH)) {
    console.error(`台本ファイルが見つかりません: ${SCRIPT_PATH}`);
    process.exit(1);
  }

  const scriptData: ScriptData = JSON.parse(fs.readFileSync(SCRIPT_PATH, "utf-8"));
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  const isVoicevoxAvailable = await checkVoicevox();
  if (!isVoicevoxAvailable) {
    console.log("⚠️ VOICEVOX APIが検出されませんでした。モックモード（無音WAVと自動口パク）でタイムラインを生成します。");
    console.log("   (実音声を作成する場合は VOICEVOX アプリまたは Docker を起動してください)");
  }

  const timeline: TimelineItem[] = [];
  let currentStartFrame = 15; // 冒頭0.5秒の余白

  for (let i = 0; i < scriptData.dialogues.length; i++) {
    const d = scriptData.dialogues[i];
    const speakerConfig = scriptData.speakers[d.speaker] || {
      voicevoxSpeakerId: 3,
    };
    const audioFileName = `dialogue_${d.id}.wav`;
    const audioFilePath = path.join(AUDIO_DIR, audioFileName);

    console.log(`[セリフ ${i + 1}/${scriptData.dialogues.length}] [${d.speaker}]: ${d.text}`);

    let synthResult;
    if (isVoicevoxAvailable) {
      try {
        synthResult = await synthesizeVoicevox(d.text, speakerConfig.voicevoxSpeakerId);
      } catch (err) {
        console.warn(`VOICEVOX合成失敗、モックに切り替えます: ${err}`);
        synthResult = synthesizeMock(d.text);
      }
    } else {
      synthResult = synthesizeMock(d.text);
    }

    fs.writeFileSync(audioFilePath, synthResult.wavBuffer);

    timeline.push({
      id: d.id,
      speaker: d.speaker,
      text: d.text,
      expression: d.expression,
      slide: d.slide,
      audioFile: `audio/${audioFileName}`,
      startFrame: currentStartFrame,
      durationInFrames: synthResult.durationInFrames,
      phonemes: synthResult.phonemes,
    });

    // 次のセリフまでの間隔（約10フレーム = 0.33秒）
    currentStartFrame += synthResult.durationInFrames + 10;
  }

  // 末尾に少し余白（30フレーム = 1秒）
  const totalDurationInFrames = currentStartFrame + 30;

  const timelineData: TimelineData = {
    title: scriptData.title,
    fps: FPS,
    totalDurationInFrames,
    speakers: scriptData.speakers,
    timeline,
  };

  fs.writeFileSync(TIMELINE_PATH, JSON.stringify(timelineData, null, 2), "utf-8");
  console.log(`\n🎉 タイムラインを正常に出力しました: ${TIMELINE_PATH}`);
  console.log(`総フレーム数: ${totalDurationInFrames} (${(totalDurationInFrames / FPS).toFixed(2)} 秒)`);
}

main().catch((err) => {
  console.error("生成スクリプト実行中にエラーが発生しました:", err);
  process.exit(1);
});
