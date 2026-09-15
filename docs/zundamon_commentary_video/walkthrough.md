# 修正内容・成果物の確認 (Walkthrough): ずんだもん解説動画自動生成ツール

Remotion (React/TypeScript) と VOICEVOX を組み合わせた「ずんだもん＆四国めたん」解説動画の自動生成ツールを新規開発しました。

---

## 🚀 完了した実装内容

### 1. プロジェクト基盤の構築
- ディレクトリ: `apps/zundamon-commentary-remotion`
- 技術スタック: React 19, TypeScript, Remotion v4, tsx
- 設定ファイル: `package.json`, `tsconfig.json`, `remotion.config.ts`
- ドキュメント: 詳細なマニュアルと更新履歴を記載した `README.md`

### 2. 音声合成＆タイムライン生成スクリプト (`scripts/generate-audio.ts`)
- **台本フォーマット (`src/data/script.json`)**:
  - セリフ、話者（ずんだもん／四国めたん）、表情、表示スライド画像の紐付けを定義。
- **VOICEVOX API連携**:
  - ローカルの VOICEVOX API (`http://localhost:50021`) にリクエストを送り、WAVファイルとモーラ・音素情報（母音の継続時間）を取得。
  - リップシンク用のフレーム単位の母音キーフレーム列 (`timeline.json`) を自動計算。
- **安全なモック/フォールバック機能**:
  - VOICEVOXが起動していない場合でも自動でモックモードへ切り替わり、ダミー音素と無音WAVを生成して開発・プレビューが止まらない設計。

### 3. Remotion 動画コンポーネント群
- **立ち絵レンダラー (`src/components/CharacterAvatar.tsx`)**:
  - **坂本アヒル様「無印」立ち絵（PSD/PNG）に完全対応**: 高解像度PNG素材が存在すれば優先して読み込み、未配置時は内蔵SVGにフォールバックするハイブリッド設計。
  - **音素連動リップシンク**: 母音（a, i, u, e, o）に合わせて口パーツをリアルタイムに切り替え。
  - **目パチ（瞬き）**: ランダムな間隔で自然なまばたき（通常→半目→閉じ目）を自動挿入。
  - **バウンス演出**: セリフ開始時にキャラクターがピョコッと跳ねるアニメーション。
  - **発話者ハイライト**: 発話中のキャラをフォーカスし、もう一方を少しトーンダウン。
  - **PSD自動展開スクリプト (`scripts/extract-psd.py`)**: 坂本アヒル様の配布PSDから「体・目・口・眉」をRemotion用に一発分解出力。
- **YouTube風テロップ (`src/components/SubtitleBanner.tsx`)**:
  - キャラクターごとのネームプレート（「ずんだもん」「四国めたん」）。
  - 太枠線＋影付きの二重縁取りフォントスタイル。
- **スライド表示エリア (`src/components/SlideArea.tsx`)**:
  - 画面中央上部に図解カードをスムーズに拡大・フェードイン表示。
- **背景演出 (`src/components/Background.tsx`)**:
  - 微細な回転グラデーション、ドットグリッド、ビネット効果。

---

## 🧪 検証結果

### 1. タイムライン生成スクリプト
- コマンド: `npm run generate`
- 結果: 5つのセリフから全1,171フレーム（39.03秒）のタイムライン `timeline.json` と各セリフのWAVファイルを正常生成。

### 2. TypeScript型チェック
- コマンド: `npx tsc --noEmit`
- 結果: エラーゼロでパス。

### 3. MP4動画レンダリング
- コマンド: `npm run render:short` (テスト動画)
- 出力: `out/short_test.mp4` (704 KB, 1920x1080, 30fps)
- プレビュー確認: 静止画キャプチャ `out/preview_frame.png` を生成し、中央スライド・立ち絵・縁取りテロップ・ネームタグが完璧に配置されていることを確認。

---

## 💻 使い方・操作手順

```bash
# 1. プロジェクトディレクトリへ移動
cd apps/zundamon-commentary-remotion

# 2. 台本の編集
# src/data/script.json に解説文やスライドを指定

# 3. 音声とタイムラインを生成 (VOICEVOX起動中なら実音声、未起動ならモック)
npm run generate

# 4. ブラウザでプレビュー確認・微調整
npm start

# 5. 完成動画 (MP4) の書き出し
npm run build
```
