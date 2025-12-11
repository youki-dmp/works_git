# Works Git

## 概要
このリポジトリは、日々の業務を自動化し、効率を向上させるためのツールやアプリケーションをまとめたものです。

## コンテンツ
- **Scripts**: 日常業務のための自動化スクリプト。
- **Apps**: ワークフローを効率化するために構築されたカスタムアプリケーション。

## はじめに
## アプリケーション一覧

### Job Analyzer (apps/job_analyzer)
求人情報を解析し、希望条件に合致するかをAIで判定するツールです。

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
