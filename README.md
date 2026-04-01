# Works Git

## 概要
このリポジトリは、日々の業務を自動化し、効率を向上させるためのツールやアプリケーションをまとめたものです。

## コンテンツ
- **Scripts**: 日常業務のための自動化スクリプト。
- **Apps**: ワークフローを効率化するために構築されたカスタムアプリケーション。

## はじめに
## アプリケーション一覧

### Voice Input-kun / ボイス入力くん (apps/voice-input-kun)
macOS向けのローカル動作・高精度日本語音声入力アプリです。
メニューバーに常駐し、ショートカットキー (`Cmd + .`) で録音した音声を即座に文字起こしして、今開いているアプリに自動入力します。

### Voicevox Changer / リアルタイムボイスチェンジャー (apps/voicevox-changer)
Apple Silicon Macで動作する、RVC技術を用いたリアルタイムボイスチェンジャーです。
自分の声を「冥鳴ひまり」などのVOICEVOXキャラクターの声に、ほぼリアルタイムで変換できます。

### Job Analyzer (apps/job_analyzer)
求人情報を解析し、希望条件に合致するかをAIで判定するツールです。
求人テキストを読み込み、Gemini APIを使用して応募推奨度（S〜Cランク）を判定します。

### Item Camera 01 Model / 1枚絵VTuberシステム (apps/item_camera01_model)
1枚のPNG画像だけで、Webカメラを使ってVTuberのように配信できるWebアプリケーションです。
顔の動き（向き、目の開閉、口の動き）を画像に同期させることができ、OBSなどの配信ソフトでの利用に最適化されています。

### AI Talent Production / AIタレント制作・自動運用 (apps/ai-talent-auto-op)
AIアバターを活用した「非属人型YouTubeチャンネル」の構築と、LINEマーケティングによる収益化の完全自動化・半自動化を目指すプロジェクトです。

### Local Markdown Viewer / ローカルMarkdownビューワー (apps/local-markdown-viewer)
ローカルの `.md` ファイルをブラウザで開いた際に、GitHub風の美しいスタイルで表示し、目次機能やメディア再生機能を追加するChrome拡張機能です。

### 4-Panel Manga Auto Production / 4コマ漫画自動生成 (apps/manga-auto-prod)
Google AntigravityとNano Banana Pro（Gemini 3 Pro Image）を活用し、キャラクターの一貫性を保った4コマ漫画を自動生成するプロジェクトです。

### AI Music Mass Production / AI音楽量産プロジェクト (apps/music-mass-prod)
AI（Suno、ChatGPT等）を活用し、音楽制作から配信、収益化までのプロセスを量産化・自動化するプロジェクトです。

### Remotion Video Gen / 動画自動生成ツール (apps/remotion-video-gen)
Reactベースの動画作成フレームワーク（Remotion）を活用し、コードベースで動画を自動生成するプロジェクトです。

### Simulated Vtuber Live Stream / 疑似Vtuber配信シミュレーター (apps/simulated-vtuber)
一人でVtuber配信の雰囲気を楽しむための、ブラウザ完結型ライブ配信シミュレーターです。喋った内容に対してAIがリアルタイムでリスナーコメントを生成し、配信画面を演出します。

### Thumbnail Architect AI / サムネイル生成AI (apps/thumbnail-architect-ai)
AIを活用したYouTubeサムネイル生成アプリケーションです。Gemini等のモデルを使用し、戦略策定からラフ作成、最終仕上げまでを一貫して行います。

### V-Thumbnail Architect (Layer-based) / レイヤー分離型サムネイル制作ツール (apps/v-thumbnail-architect-layers)
立ち絵の造形を一切崩さず、AIの力で高品質なVTuber用サムネイルを爆速で生成する、レイヤー分離型次世代サムネイル制作ツールです。

### VTuber HP Builder / VTuber向けサイトビルダー (apps/vtuber-hp-builder)
VTuberのプロフィールや実績をまとめた高品質なWebサイトを簡単に作成できるビルダーツールです。設定ファイルから自動でデザインが適用され、配信スケジュールやギャラリー等の機能を提供します。

### Urazu LP / 戦略的パートナーLP (apps/urazu_lp)
個人VTuberのクリエイティブ活動を支援する「Urazu」のランディングページです。Cyber-Popデザインを採用し、サービス終了のお知らせ（エイプリルフール）ギミックを搭載しています。
公開URL: [https://dsm.static.jp/urazu/](https://dsm.static.jp/urazu/)

#### 使い方
1. APIキーの設定
   `apps/job_analyzer/.env.example` をコピーして `.env` を作成し、Google Gemini APIキーを設定します。
2. ライブラリのインストール
   ```bash
   python3 -m venv apps/job_analyzer/venv
   apps/job_analyzer/venv/bin/pip install -r apps/job_analyzer/requirements.txt
   ```
3. 希望条件の編集
   `apps/job_analyzer/requirements.md` に希望の求人条件を記述します。
4. 実行
   ```bash
   apps/job_analyzer/venv/bin/python apps/job_analyzer/main.py <求人テキストファイル>
   ```
