# VOICEVOX リアルタイムボイスチェンジャー (RVC版) / Real-time RVC Voice Changer

macOS (Apple Silicon) 上で動作する、Real-time RVC を使用したボイスチェンジャーです。
A real-time voice changer using RVC, designed for macOS (Apple Silicon).

## 特徴 / Features

- **VOICEVOXキャラクターの声に変換**: [VOICEVOX](https://voicevox.hiroshiba.jp/) のキャラクターボイスを使用したリアルタイム音声変換。
- **デフォルトモデル: めいめいひまり**: 可愛らしい声質の「冥鳴ひまり」がデフォルトで設定されています。
- **リアルタイム変換 / Real-time Conversion**: RVCを使用した高品質な音声変換。
- **メニューバー(トレイ)アイコン / Menu Bar Icon**: 🔊アイコンからアプリの状態を確認・停止できます。
- **動的なデバイス選定 / Dynamic Device Selection**: メニューから入力（マイク）や出力（スピーカー）をいつでも切り替え可能。
- **視覚的な音量メーター / Visual Level Meter**: ターミナル上に入力と出力の音量レベルを表示し、変換が動いているか一目で分かります。
- **モニタリング機能 / Audio Monitoring**: 「自分の声を聴く」をONにすると、変換後の声を自分のスピーカーで確認できます。
- **日本語対応 / Bilingual Interface**: ログやメニュー、ドキュメントが日本語と英語の両方に対応。

## セットアップ / Setup

### 1. 依存関係のインストール / Install Dependencies
```bash
./setup.sh
```
※ `setup.sh` はモデルのダウンロードと仮想環境の作成を行います。

### 2. ライブラリの更新 / Update Libraries
もし新機能が動かない場合は、以下を実行してください：
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## 使い方 / Usage

### 起動 / Launch
```bash
source .venv/bin/activate
python main.py
```

### デバイスの変更 / Changing Devices
1. メニューバーにある「⚡️」アイコンを右クリックします。
2. 「入力デバイス (Input Device)」または「出力デバイス (Output Device)」から使用したい機器を選択します。
3. 選択すると、自動的に音声ストリームが再起動し、新しいデバイスで動作を開始します。

### 終了 / Quit
- メニューバーアイコンの「停止して終了 (Stop/Quit)」を選択します。
- または、ターミナルで `Ctrl+C` を押してください。

## トラブルシューティング / Troubleshooting

- **音が出ない**: 出力デバイスが正しいか、仮想オーディオデバイス（BlackHoleなど）を使用している場合はその設定を確認してください。
- **パーミッションエラー**: マイクへのアクセス許可が必要な場合があります。
- **ブツブツ途切れる**: ノイズゲートの閾値 (`NOISE_GATE_THRESHOLD`) を調整するか、`CHUNK_SIZE` を大きくしてください。

---

## 技術仕様 / Technical Specifications

| 項目 | 値 |
|------|-----|
| 入力サンプルレート | 16,000 Hz |
| 出力サンプルレート | 32,000 Hz |
| チャンクサイズ | 8,192 samples |
| F0検出方式 | PM (Parselmouth) |
| ノイズゲート閾値 | 0.01 |

---

## ❓ FAQ / よくある質問

### Q. VOICEVOXの音声を学習しているのですか？
**A.** はい。VOICEVOXの「冥鳴ひまり」の音声データを使用してRVCモデル（`meimei.pth`）が学習されています。このモデルがあなたの声を「冥鳴ひまり」の声に変換します。

### Q. voicevox-coreは使っていますか？
**A.** いいえ、現在は使用していません。初期の開発ではvoicevox-coreを検討しましたが、最終的には**rvc-python**ライブラリを使用してRVCモデルを直接実行する方式を採用しました。

### Q. 変換の遅延（レイテンシー）はどれくらいですか？
**A.** 約1秒程度です。チャンクサイズやF0検出方式によって多少変動します。

### Q. 他のキャラクターの声に変えられますか？
**A.** はい。`model/` フォルダ内のモデルファイル（`.pth`）とインデックスファイル（`.index`）を別のRVCモデルに差し替えれば、他のキャラクターの声にも変換できます。

---

## 🚀 v2.0 Gold Build の新機能 / What's New

### マルチプロセスアーキテクチャ
RVCエンジンを専用プロセスで実行し、macOSのオーディオシステムとの干渉を完全に排除。セグメンテーション違反やデッドロックが解消されました。

### ノイズゲート機能
無音時のノイズ変換によるブツブツ音を防止。声を出している時だけ変換処理を行います。

### 信号スケーリング最適化
マイク入力（float -1.0〜1.0）をRVCエンジンが期待するint16範囲に自動変換。

---

## 📝 おまけ：開発苦労話 / Development Notes

このアプリの開発中に遭遇した数々の困難と、その解決策を記録します。

### 1. Macでの「無音問題」
**症状**: 入力メーターは動くのに、出力が完全に無音。  
**原因**: RVCエンジンはint16範囲（±32768）の信号を期待しているが、PortAudioはfloat範囲（±1.0）で音声を提供していた。約3万倍のスケール差があり、RVCには「ほぼ無音」として認識されていた。  
**解決策**: 入力信号をRMS正規化後、8000倍にスケールアップ。

### 2. PortAudio × PyTorch のデッドロック
**症状**: アプリ起動後、数秒でフリーズまたはセグメンテーション違反。  
**原因**: macOSのオーディオHAL（Hardware Abstraction Layer）とPyTorchのOpenMPスレッドが同じリソースを奪い合い、デッドロックが発生。  
**解決策**: RVCエンジンを `multiprocessing.Process` で完全に分離。メインプロセスとはQueue経由でのみ通信。

### 3. multiprocessing.Queue.qsize() の罠
**症状**: `NotImplementedError` でアプリがクラッシュ。  
**原因**: macOSでは `multiprocessing.Queue.qsize()` がサポートされていない。  
**解決策**: `qsize()` の使用を廃止し、catch-up処理は `get_nowait()` の例外で代替。

### 4. PyTorch 2.6 のセキュリティ強化
**症状**: 子プロセスでモデルロードに失敗。  
**原因**: PyTorch 2.6以降、`torch.load()` のデフォルトが `weights_only=True` に変更され、fairseqのDictionaryクラスがブロックされた。  
**解決策**: 子プロセス内で `torch.serialization.add_safe_globals([Dictionary])` を実行。

### 5. ブツブツ途切れ問題
**症状**: 声は変換されるが、途切れ途切れでブツブツ音がする。  
**原因**: 2つの問題が複合。(1) CPUでのRMVPE処理が遅くリアルタイムに追いつかない。(2) 無音時のノイズも変換され不自然な音が発生。  
**解決策**: (1) F0方式をRMVPE→PMに変更しチャンクサイズを倍増。(2) ノイズゲートを実装し、閾値以下の入力は処理をスキップ。

---

**開発期間**: 2026年1月  
**対象環境**: macOS (Apple Silicon M1/M2/M3)
