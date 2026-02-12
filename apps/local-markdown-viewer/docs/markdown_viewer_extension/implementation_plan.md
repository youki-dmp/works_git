# ローカルMarkdownビューワー拡張機能 実装計画

ローカルの `.md` ファイルをChromeで開いた際に、GitHub風のスタイルで表示し、目次機能やメディア再生機能を追加する拡張機能を開発します。

## ユーザーレビューが必要な項目
- 拡張機能でローカルファイルを扱うため、インストール後に「ファイルの URL へのアクセスを許可する」設定をユーザーに手動で行ってもらう必要があります。

## Proposed Changes

### Chrome 拡張機能本体
- **[NEW] [manifest.json](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/manifest.json)**: 拡張機能の設定ファイル。`file://*/*.md` に対する Content Script の実行権限を定義します。
- **[NEW] [content.js](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/content.js)**: MarkdownをHTMLに変換し、DOMに注入するメインロジック。
- **[NEW] [styles.css](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/styles.css)**: GitHub風のスタイルおよび目次(ToC)のレイアウト。
- **[NEW] [marked.min.js](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/lib/marked.min.js)**: Markdownパーサーライブラリ。

### ドキュメント
- **[NEW] [README.md](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/README.md)**: プロジェクトの目的、インストール方法、使い方の説明。

## Verification Plan

### Automated Tests
- 今回はブラウザ拡張機能のため、手動検証をメインとします。

### Manual Verification
1. Chromeの拡張機能管理画面から「パッケージ化されていない拡張機能を読み込む」で読み込み。
2. 「ファイルの URL へのアクセスを許可する」をオンにする。
3. ローカルの `.md` ファイルをChromeで開く。
4. GitHub風のデザイン、目次の生成、画像・動画の再生を確認する。
