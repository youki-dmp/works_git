#!/bin/bash
# Job Analyzer One-Click Launcher for macOS

# スクリプトがあるディレクトリに移動
cd "$(dirname "$0")"

echo "=========================================="
echo "   Job Analyzer AI を起動しています...   "
echo "=========================================="

# 1. 仮想環境のチェックと作成
if [ ! -d "venv" ]; then
    echo "[1/3] 仮想環境を作成しています..."
    python3 -m venv venv
fi

# 2. 依存ライブラリのチェックとインストール
echo "[2/3] ライブラリを確認しています..."
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
playwright install chromium > /dev/null 2>&1

# 3. ブラウザを自動で開く準備 (2秒後に実行)
echo "[3/3] サーバーを起動し、ブラウザを開きます..."
(sleep 2 && open http://localhost:5001) &

# 4. アプリケーションの起動
python3 app.py
