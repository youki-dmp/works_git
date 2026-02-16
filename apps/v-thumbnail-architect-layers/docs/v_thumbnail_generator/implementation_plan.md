# 実装計画: ドラッグ＆ドロップ機能と高度なAI戦略の統合

ユーザー不在の間に、プロトタイプの利便性を飛躍的に高める「ドラッグ＆ドロップ」機能の実装と、旧プロジェクトの知見を活かした「高度なAIレイヤー生成」を実装します。

## ユーザーレビューが必要な項目
- **レイヤー合成方法**: ブラウザ上でのレイヤー合成（Canvas APIを使用）で問題ないか。
- **ドラッグ＆ドロップの範囲**: サムネイルプレビューエリア全体をドロップ可能にする予定です。

## 変更内容

### 1. UI/UX: ドラッグ＆ドロップの実装
- **[MODIFY] [App.tsx](file:///Users/kato/Public/works_git/apps/v-thumbnail-architect-layers/src/App.tsx)**
    - プレビューエリアへの `onDragOver`, `onDragLeave`, `onDrop` ハンドラの追加。
    - ドロップされた画像が「立ち絵（透明背景）」か「背景」かを判定し（またはデフォルトで立ち絵として）ロードする。

### 2. AI: 高度な戦略生成ロジックの移植
- **[MODIFY] [aiService.ts](file:///Users/kato/Public/works_git/apps/v-thumbnail-architect-layers/src/services/aiService.ts)**
    - 旧プロジェクトの `SYSTEM_PROMPTS.ABSOLUTE_IDENTITY_PRESERVATION_RULE` のロジックを反映。
    - 単なる背景生成ではなく、動画の内容（コピー）に基づいた「CTRを高めるための空間演出」をプロンプトに組み込む。

### 3. 機能: レイヤー合成・書き出し機能
- **[NEW] [exportService.ts](file:///Users/kato/Public/works_git/apps/v-thumbnail-architect-layers/src/services/exportService.ts)**
    - `ThumbnailCanvas` の表示内容を 1280x720 の Canvas に描画し、PNGとしてダウンロードする機能。

## 検証プラン

### 自動テスト / 手動検証
- [x] プレビューエリアに画像をドラッグして、正しくレイヤーが更新されるか。
- [x] AI生成において、入力されたコピーの内容が背景デザインに反映されているか。
- [x] 書き出しボタンを押して、高解像度のPNGがダウンロードされるか。
