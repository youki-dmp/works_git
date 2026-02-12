# Thumbnail Architect AI

AIを活用したYouTubeサムネイル生成アプリケーション。
Gemini 3 Proなどの最新モデルを使用し、戦略策定からラフ作成、最終仕上げまでを一貫して行います。

## 主な機能 (Feature List)

### 1. 戦略デザインプラン生成 (Design Plan Generation)
- **使用モデル**: `gemini-3-pro-preview`
- **入力情報**: 動画内容、競合キーワード、ターゲット感情、メインコピー、サブコピー
- **出力内容**:
  - **競合差別化**: 競合の「逆張り」提案による目立つサムネイル戦略
  - **レイアウト指示**: 被写体と文字の配置、強弱の指示
  - **空間設計**: チャンネルロゴの最適な配置
  - **カラーパレット**: CTR（クリック率）を最大化する配色（HEXコード付き）

### 2. ビジュアルラフ生成 (Visual Mockup Generation)
- **使用モデル**: `gemini-2.5-flash-image`
- **バリエーション**: 以下の3パターンを同時生成
  - **Contrast**: 色のコントラストと鮮やかさを重視
  - **Emotional**: 感情的な表情とドラマチックなライティング
  - **Premium**: ミニマリストで高級感のあるデザイン
- **アセット活用**: アップロードされた人物画像、ロゴ、背景画像を保持

### 3. 最終仕上げ (Final High-Fidelity Rendering)
- **使用モデル**: `gemini-3-pro-image-preview`
- **特徴**:
  - **Identity Preservation**: アップロードされた被写体の顔やロゴのデザインを厳密に保持
  - **日本語レンダリング**: 自然で可読性の高い日本語文字の生成
  - **高品質**: プロ仕様のライティングと質感
  - **アスペクト比対応**: 16:9 (YouTube横動画) および 9:16 (Shorts)

## セットアップと実行

**前提条件**: Node.js

1. 依存関係のインストール:
   ```bash
   npm install
   ```
2. 環境変数の設定:
   `.env.local` に `GEMINI_API_KEY` を設定してください。
3. アプリケーションの起動:
   ```bash
   npm run dev
   ```

## 技術スタック
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (Multimodal)
- **Icons**: Lucide React
