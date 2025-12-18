# Job Analyzer

求人情報（テキスト）を読み込み、事前定義した「希望条件 (`requirements.md`)」に基づいて、AI (Gemini) が応募推奨度をS〜Cランクで判定するツールです。

## セットアップ (Setup)

### 1. 必須環境
- Python 3.x

### 2. インストール
仮想環境の作成と依存ライブラリのインストールを行います。

```bash
# 仮想環境の作成 (推奨)
python3 -m venv venv
source venv/bin/activate

# ライブラリのインストール
pip install -r requirements.txt
```

### 3. APIキーの設定
`.env` ファイルに Google Gemini API キーを設定してください。
まだ作成していない場合は `.env.example` をコピーして作成します。

```bash
cp .env.example .env
```

`.env` を編集し、`GEMINI_API_KEY` に実際のキーを入力してください。

## 使い方 (Usage)

求人情報のテキストファイルを用意し、`main.py` の引数として渡して実行します。
テスト用の求人情報ファイル `dummy_job.txt` が同梱されています。

```bash
python main.py dummy_job.txt
```

## 設定 (Configuration)
ご自身の希望条件は `requirements.md` を直接編集して更新してください。
AIはこのファイルを読み込んで判定を行います。