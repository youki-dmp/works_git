# 実装計画：匠の体験革命（ローディング強化と機能拡張）

ユーザー様が「今、AIが何を考えているか」を常に把握でき、かつより細かい演出指示が可能になるよう、UI/UXおよびプロンプトの拡充を行います。

## ユーザー確認事項
> [!NOTE]
> 立ち絵の位置指定（左・右・中央）は、既存のX軸オフセット値をプリセットとして設定する形式で実装します。

## 提案される変更点

### 1. [ResultDisplay](file:///Users/kato/Public/works_git/apps/thumbnail-architect-ai/components/ResultDisplay.tsx) のローディング強化
- **戦略立案中の表示**: `AppStatus.PLANNING` 時にもローディング画面（ProgressBar）を表示し、「戦略分析中」であることを可視化します。
- **方向性調整中の表示**: `AppStatus.CRITIQUING` または特定の調整中状態においてもローディングを表示します。

### 2. [InputForm](file:///Users/kato/Public/works_git/apps/thumbnail-architect-ai/components/InputForm.tsx) の機能拡張
- **感情フックの追加**:
  - 「ゴージャス・リッチ」「ホラー・危険」「雑談」「ポップ」の4項目を追加します。

### 3. [ResultDisplay](file:///Users/kato/Public/works_git/apps/thumbnail-architect-ai/components/ResultDisplay.tsx) の修正UI拡張
- **ダウンロードボタンの再配置**:
  - 画像上のホバー表示を廃止し、画像エリアの直下に「横幅いっぱい」のボタンとして配置します。
  - Finder でのプレビュー表示を確実にするため、Blob 生成ロジックを見直します。

### 4. [geminiService](file:///Users/kato/Public/works_git/apps/thumbnail-architect-ai/services/geminiService.ts) の Identity 維持強化（完了）
- 以前の更新で対応済み。

## 検証プラン

### 自動テスト
- `npm run dev` でのビルド確認。

### 手動検証
- 「ラフを構築」押下直後に「戦略立案中」のローディングが出るか。
- 新しい感情フックが正しく選択できるか。
- 立ち絵位置ボタンで位置が切り替わるか。
- 方向性調整時に立ち絵が変形しないか。
