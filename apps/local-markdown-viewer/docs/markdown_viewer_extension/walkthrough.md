# ローカルMarkdownビューワー 開発完了 (ベータ版 - バグ修正済み)

ローカルの `.md` ファイルをGitHub風に美しく表示するChrome拡張機能のベータ版が完成しました。

## 実施した内容

- **GitHub風スタイルの適用**: 背景色、フォント、コードブロック、テーブルなど、GitHubのREADMEに近いスタイルを再現しました。
- **自動目次 (ToC) 生成**: `h2`〜`h4`の見出しを自動的に抽出し、画面右側にナビゲーションとして表示します。
- **スムーズスクロール**: 目次のリンクをクリックすると、対応する見出しへ滑らかにスクロールします。
- **YouTubeリンクの自動埋め込み**: Markdown内のYouTubeリンク（URLのみの行）を自動検知し、動画プレイヤーとして表示します。
- **メディア対応**: 画像やGIFアニメも標準で表示可能です。
- **不足リソースの補充**: 読み込みエラーの原因となっていた `icons` フォルダ内のファイル不足を修正しました。
- **最新ライブラリ仕様への準拠**: `marked.js` v15 の最新仕様に合わせて、リンクレンダラーの引数受け取り方を修正し、クラッシュを防止しました。

## 検証結果

### 動作確認・修正
- テスト用ファイル `prototype_test.md` を用いて、以下の正常動作を確認しました。
  - デザインがGitHub風に変換されること。
  - 右側に目次が表示され、クリックで移動できること。
  - GIFアニメが表示されること。
  - YouTube動画が埋め込まれること。
- **読み込みエラーの修正**: `icons` フォルダ内に必要な画像ファイルが不足していた問題を解決しました。独自に生成したアイコンを追加し、`manifest.json` との整合性を確保しました。
- **実行時エラーの修正**: 最新の `marked.js` (v15) においてレンダラー関数の引数がオブジェクト形式に変更されていたため、`href.match` で発生していた型エラーを修正しました。

## インストールと使用手順

1.  Chromeで `chrome://extensions/` を開きます。
2.  「デベロッパー モード」をオンにします。
3.  「パッケージ化されていない拡張機能を読み込む」から、以下のフォルダを選択します：
    `/Users/kato/Public/works_git/apps/local-markdown-viewer`
4.  読み込まれた拡張機能の「詳細」ボタンをクリックします。
5.  **「ファイルの URL へのアクセスを許可する」をオンにします。**（※これを忘れるとローカルファイルで動作しません）
6.  任意の `.md` ファイルをChromeで開いて動作を確認してください。

## 成果物

- [manifest.json](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/manifest.json)
- [content.js](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/content.js) (修正済み)
- [styles.css](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/styles.css)
- [icons/icon48.png](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/icons/icon48.png)
- [README.md](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/README.md)
- [prototype_test.md](file:///Users/kato/Public/works_git/apps/local-markdown-viewer/prototype_test.md) (テスト用)
