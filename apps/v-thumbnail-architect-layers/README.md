# V-Thumbnail Architect (Layer-based)

立ち絵の造形を一切崩さず、AIの力で高品質なVTuber用サムネイルを爆速で生成する、レイヤー分離型次世代サムネイル制作ツールです。

## 🌟 主な特徴

- **レイヤー分離型 AI 生成**: 背景、エフェクト、文字（ロゴ）を個別に AI (Nano Banana Pro / Imagen 3) で生成。立ち絵レイヤーは常に独立して保持されます。
- **30種類の戦略的レイアウト**: 「雑談」「歌枠」「ゲーム」「告知」のカテゴリ別に、トレンドを抑えた30種以上の配置パターンをプリセット。
- **ライブ・テキスト編集**: キャンバス上の文字をクリックして直接編集可能。レイアウトに合わせた自動調整が行われます。
- **ドラッグ＆ドロップ**: プレビューエリアに画像をドロップするだけで、立ち絵や素材を瞬時にロード。
- **高解像度書き出し**: 1280x720 (720p) サイズで、シャドウやフィルタ装飾を忠実に再現したPNG書き出しに対応。
- **Identity Lock & Visual Hierarchy**: 旧プロジェクトの知見を活かし、被写体の造形維持とモバイルでの視認性を極限まで高めたプロンプト規約を搭載。

## 🚀 クイックスタート

### 1. セットアップ
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルを作成し、Gemini API キーを設定してください。
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### 3. 起動
```bash
npm run dev -- --port 3005
```
ブラウザで [http://localhost:3005](http://localhost:3005) を開きます。

## 🛠 技術スタック
- **Frontend**: React 19, Vite 6, TypeScript
- **Styling**: Vanilla CSS (Premium Glassmorphism Design)
- **AI Engine**: Google Generative AI (@google/generative-ai)
- **Icons**: Lucide React

## 📖 ドキュメント
開発の詳細な記録や検証結果は `docs/v_thumbnail_generator/` フォルダ内の各ファイルを参照してください。
- `task.md`: 実装タスクリスト
- `implementation_plan.md`: 実装計画書
- `walkthrough.md`: 検証・動作確認記録
- `team_pdca_report.md`: チームメンバーによる分析・改善レポート
