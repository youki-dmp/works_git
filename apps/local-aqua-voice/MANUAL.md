# Local Aqua Voice – ユーザーマニュアル

## 概要
ローカルで動作する高精度日本語音声入力アプリです。メニューバーに常駐し、ショートカットキーで録音・文字起こしを行い、テキストをアクティブアプリに自動入力します。

## インストール手順
1. リポジトリをクローン（既にローカルにあります）
2. Python 仮想環境を作成し、依存パッケージをインストール
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. `faster-whisper` のモデルをダウンロード（初回起動時に自動でダウンロードされます）

## 起動方法
```bash
source venv/bin/activate
python main.py
```
起動すると macOS のメニューバーに 🎤 アイコンが表示されます。

## 操作方法

### アプリの状態
| 待機中（Ready） | 録音中（Recording） |
|:---:|:---:|
| ![Ready](./docs/images/ready.png) | ![Recording](./docs/images/recording.png) |

| 操作 | 説明 |
|------|------|
| **ショートカット** | デフォルトは `Command + .`（ドット）。このキーで録音開始/停止をトグルします。 |
| **メニュー** | アイコンを右クリックするとメニューが表示されます。<br>・`Configure Shortcut` – ショートカットを変更<br>・`Quit` – アプリ終了 |
| **録音** | ショートカットで録音開始 → 再度ショートカットで停止 → 文字起こしが開始され、結果がアクティブウィンドウに自動入力されます。 |

## ショートカットの変更方法
1. メニューバーアイコンを右クリック → **Configure Shortcut** を選択
2. 表示されるダイアログに新しいショートカット文字列を入力（例: `<cmd>+shift+v`）
3. **OK** を押すと設定が保存され、即座に新しいショートカットが有効になります。

## カスタマイズ
- **モデル**: `transcription.py` の `TranscriptionEngine` で使用する `faster-whisper` のモデル名を変更可能です。
- **デブウンス**: `HotkeyListener` にデバウンス（0.5 秒）を実装していますが、必要に応じて `self.last_trigger_time` の閾値を調整できます。

## トラブルシューティング
- **起動しない**: 仮想環境が有効か確認し、`pip install -r requirements.txt` を再実行。
- **ショートカットが反応しない**: `config.json` が正しく保存されているか確認し、`<cmd>` などの記法が正しいかチェック。
- **文字起こしが遅い**: `transcription.py` の `beam_size` を `1` に設定しているので高速ですが、CPU の負荷が高い場合はモデルを `distil-large-v3` など軽量版に変更できます。

## ライセンス
MIT License
