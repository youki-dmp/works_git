# ずんだもん＆四国めたん 解説動画自動生成ツール (Remotion & VOICEVOX)

Remotion (React/TypeScript) と VOICEVOX を組み合わせた、解説動画・対談動画の自動動画生成ツールです。
台本（JSON）を元に、音声合成、音素連動の立ち絵口パク、目パチ、感情差分、YouTube風テロップ、スライド表示をすべてプログラム制御で同期させ、Mac上でリアルタイムプレビュー＆MP4書き出しが可能です。

---

## 🌟 主な特徴

- **完全コード駆動の動画編集**: 面倒な動画編集ソフト（タイムラインへの切り貼り作業）が不要。
- **音素解析によるリアルタイム・リップシンク**: VOICEVOXから得られる音素（母音: a, i, u, e, o）タイミングに合わせて、立ち絵の口パーツを精密に切り替えます。
- **生き生きとした立ち絵アニメーション**:
  - ランダム周期の自動目パチ（瞬き）
  - セリフ発話開始時のポップなバウンス演出
  - 発話者ハイライト（発話していないキャラのトーンダウン演出）
- **YouTube風デザイン**: 見やすい二重縁取り（アウトライン＆シャドウ）のテロップと話者ネームプレート。
- **Webブラウザ上での即時プレビュー**: Remotion Previewにより、シークバーで自由自在に動きを確認しながら調整可能。
- **安全なフォールバック設計**: VOICEVOXが起動していない場合でも、自動的にモックモードでタイムラインとダミー口パクを生成してプレビュー開発が可能です。

---

## 📁 ディレクトリ構成

```
apps/zundamon-commentary-remotion/
├── src/
│   ├── index.ts               # Remotion エントリーポイント
│   ├── Root.tsx               # 動画サイズ(1920x1080)・フレーム数登録
│   ├── CommentaryVideo.tsx    # メイン合成コンポーネント
│   ├── components/
│   │   ├── Background.tsx     # 幾何学グラデーション背景
│   │   ├── CharacterAvatar.tsx# 立ち絵（目パチ・口パク・バウンス）
│   │   ├── SubtitleBanner.tsx # 二重縁取りYouTube風テロップ
│   │   └── SlideArea.tsx      # 解説スライド表示
│   └── data/
│       ├── script.json        # 入力台本データ
│       └── timeline.json      # 自動生成されたタイムライン
├── scripts/
│   └── generate-audio.ts      # VOICEVOX API連携 & タイムライン生成スクリプト
├── public/
│   ├── audio/                 # 生成された音声WAV
│   ├── characters/            # 立ち絵パーツ (zundamon / metan)
│   └── slides/                # 解説スライド画像 (SVG/PNG)
├── out/                       # レンダリングされた完成MP4動画
├── package.json
└── README.md
```

---

## 🚀 使い方・マニュアル

### 1. 準備（事前セットアップ）

#### Node.js
Node.js (v18以上推奨) が必要です。

```bash
cd apps/zundamon-commentary-remotion
npm install
```

#### VOICEVOX の起動（実音声を使用する場合）
以下のいずれかの方法で VOICEVOX Engine を起動してください（ポート `50021` で起動します）。
- **方法A (Macアプリ)**: [VOICEVOX公式サイト](https://voicevox.hiroshiba.jp/) よりMac版アプリをダウンロードして起動。
- **方法B (Docker)**:
  ```bash
  docker run --rm -p 50021:50021 voicevox/voicevox_engine:cpu-ubuntu20.04-latest
  ```

※VOICEVOXを起動していない場合でも、モックモードでプレビュー可能です。

---

### 2. 台本を作成・編集する

`src/data/script.json` に解説セリフや話者、スライド画像を指定します。

```json
{
  "title": "ずんだもんのAI動画解説",
  "speakers": {
    "zundamon": { "name": "ずんだもん", "voicevoxSpeakerId": 3, "position": "left" },
    "metan": { "name": "四国めたん", "voicevoxSpeakerId": 2, "position": "right" }
  },
  "dialogues": [
    {
      "id": 1,
      "speaker": "zundamon",
      "text": "こんにちはなのだ！今日は自動動画編集について解説するのだ！",
      "expression": "happy",
      "slide": "slide1.svg"
    }
  ]
}
```

---

### 3. 音声とタイムラインを生成する

```bash
npm run generate
```
台本を解析し、VOICEVOX APIからWAV音声と音素タイミングを取得して `src/data/timeline.json` と `public/audio/*.wav` を自動生成します。

---

### 4. ブラウザでプレビューする

```bash
npm start
```
ローカルブラウザ（`http://localhost:3000` など）が立ち上がり、動画のリアルタイムプレビューが可能です。

---

### 5. 完成動画 (MP4) を書き出す

```bash
# 全編レンダリング
npm run build

# または最初の3秒間のみテスト出力
npm run render:short
```
`out/commentary.mp4` にフルHD（1920x1080 / 30fps）の完成動画が出力されます。

---

## 🎨 立ち絵素材（坂本アヒル様「無印」）の適用手順

本ツールは、YouTube解説動画でデファクトスタンダードとなっている **坂本アヒル様「無印」立ち絵素材**（PSD/PNG）に完全対応しています。

### 1. 素材の入手
ニコニコ静画の公式配布ページよりダウンロードしてください：
- **ずんだもん（無印）**: [ニコニコ静画 im10788496](https://seiga.nicovideo.jp/seiga/im10788496)
- **四国めたん**: [ニコニコ静画 im10791276](https://seiga.nicovideo.jp/seiga/im10791276)
*(※利用規約・クレジット表記は坂本アヒル様および公式ガイドラインをご確認ください)*

### 2. 素材の配置（自動展開または手動配置）

#### 方法A: 付属のPSD自動展開スクリプトを使う場合
ダウンロードしたPSDファイルをプロジェクト内の任意の場所に置き、以下のコマンドを実行するだけで自動的に「目パチ」「口パク（あいうえお）」「体」が抽出・配置されます。

```bash
# 必要なライブラリのインストール
pip install psd-tools pillow

# ずんだもんPSDの展開
python scripts/extract-psd.py --psd /path/to/sakamoto_zundamon.psd --character zundamon

# 四国めたんPSDの展開
python scripts/extract-psd.py --psd /path/to/sakamoto_metan.psd --character metan
```

#### 方法B: PSDTool等で手動配置する場合
`public/characters/zundamon/`（または `metan/`）に以下の命名でPNGを配置するだけで、自動的に高精細な実写素材に切り替わります：
- `body.png`（体・服・ポーズ）
- `eye_open.png`（通常目）/ `eye_half.png`（半目・ジト目）/ `eye_closed.png`（笑顔閉じ目）
- `mouth_closed.png`（閉じ口）/ `mouth_a.png`（あ）/ `mouth_i.png`（い）/ `mouth_u.png`（う）/ `mouth_e.png`（え）/ `mouth_o.png`（お）

※PNG素材が存在しない場合は、内蔵の軽量ベクター（SVG）プレースホルダーが自動的に使われるハイブリッド仕様です。

---

## 📝 更新履歴 (Changelog)

- **v1.1.0 (2026-09-06)**:
  - 坂本アヒル様「無印」立ち絵素材（PSD/PNG）への完全対応
  - PSD自動レイヤー展開スクリプト `scripts/extract-psd.py` の追加
  - PNG画像とSVGプレースホルダーのハイブリッド自動検出機構を搭載
- **v1.0.0 (2026-09-06)**:
  - 初回リリース（VOICEVOX連携、Remotion合成エンジン、YouTubeテロップ、スライド表示）

