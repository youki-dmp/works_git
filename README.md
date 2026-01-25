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
