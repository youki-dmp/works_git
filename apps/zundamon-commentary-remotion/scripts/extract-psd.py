#!/usr/bin/env python3
"""
坂本アヒル氏の立ち絵PSDファイルからRemotion用のパーツPNGを自動抽出するスクリプト

使い方:
  pip install psd-tools pillow
  python scripts/extract-psd.py --psd assets/psd/zundamon.psd --character zundamon
"""

import os
import sys
import argparse

try:
    from psd_tools import PSDImage
    from PIL import Image
except ImportError:
    print("必要なライブラリがインストールされていません。以下のコマンドを実行してください:")
    print("pip install psd-tools pillow")
    sys.exit(1)


def find_layer_by_keywords(parent, keywords):
    for layer in parent:
        name = layer.name.lower()
        if any(k.lower() in name for k in keywords):
            return layer
    return None


def export_layer(layer, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    image = layer.composite()
    image.save(output_path)
    print(f"  [抽出完了] {output_path}")


def process_sakamoto_psd(psd_path, output_dir):
    print(f"PSDファイルを読み込み中: {psd_path}")
    psd = PSDImage.open(psd_path)

    os.makedirs(output_dir, exist_ok=True)

    # 1. 体・ベースの抽出
    body_group = find_layer_by_keywords(psd, ["体", "身体", "ポーズ", "ベース"])
    if body_group:
        export_layer(body_group, os.path.join(output_dir, "body.png"))
    else:
        # 見つからない場合は全体（目・口を非表示にして保存）
        print("  ⚠️ 体レイヤーを自動特定できなかったため、PSDのベースをそのままエクスポートします")
        export_layer(psd, os.path.join(output_dir, "body.png"))

    # 2. 目パーツの抽出（開眼・半目・閉眼）
    eye_group = find_layer_by_keywords(psd, ["目", "!目", "eye"])
    if eye_group:
        mapping = {
            "eye_open.png": ["普通", "開", "通常", "デフォルト"],
            "eye_half.png": ["半目", "ジト目"],
            "eye_closed.png": ["閉じ", "笑顔", "笑い", "なごみ"],
        }
        for filename, keys in mapping.items():
            l = find_layer_by_keywords(eye_group, keys)
            if l:
                export_layer(l, os.path.join(output_dir, filename))

    # 3. 口パーツの抽出（あ・い・う・え・お・閉じ）
    mouth_group = find_layer_by_keywords(psd, ["口", "!口", "mouth"])
    if mouth_group:
        mouth_mapping = {
            "mouth_closed.png": ["閉じ", "むすび", "デフォルト", "通常"],
            "mouth_a.png": ["あ", "大開"],
            "mouth_i.png": ["い", "笑顔口"],
            "mouth_u.png": ["う", "すぼめ"],
            "mouth_e.png": ["え"],
            "mouth_o.png": ["お", "まる"],
        }
        for filename, keys in mouth_mapping.items():
            l = find_layer_by_keywords(mouth_group, keys)
            if l:
                export_layer(l, os.path.join(output_dir, filename))

    print(f"\n🎉 立ち絵パーツの展開が完了しました: {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="坂本アヒル氏PSD立ち絵パーツ抽出スクリプト")
    parser.add_argument("--psd", required=True, help="PSDファイルのパス")
    parser.add_argument("--character", choices=["zundamon", "metan"], default="zundamon", help="キャラクター名")
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_dir = os.path.join(project_root, "public", "characters", args.character)

    process_sakamoto_psd(args.psd, output_dir)


if __name__ == "__main__":
    main()
