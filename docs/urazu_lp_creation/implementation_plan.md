# Urazu LP 実装計画

個人VTuberのための戦略的パートナー「Urazu（ウラズ）」のランディングページ（LP）を作成します。
提供されたPDF資料「VTuber_Creative_Freedom_Strategy.pdf」の情報を元に、魅力的なデザイン（Cyber-Pop Editorial）とスクロールギミックを取り入れたWebページを構築します。

## ターゲットと目的
- **ターゲット**: 事務作業やクリエイティブ以外の作業に追われている個人VTuber。
- **目的**: UrazuのAIツールプラン（無料モニター）や各種サポートプランへの申し込み（Googleフォーム）を促す。

## 確認事項 (User Review Required)
> [!NOTE]
> 以下の実装方針で進めて問題ないかご確認ください。デザインテイストは「ダークモード背景＋ネオンピンク/シアン/パープル」のサイバーポップ風です。

> [!TIP]
> 画像素材はプレースホルダー（生成AIで仮作成）を使用するか、CSSグラデーションでサイバーパンクな雰囲気を表現します。CTAはすべてご指定のGoogleフォーム（仮のURLまたは指定URL）へ遷移させます。

## 実装構成案

### 1. ディレクトリとファイル構成
以下のファイルを新しく作成します。
#### [NEW] [index.html](file:///Users/kato/Public/works_git/apps/urazu_lp/index.html)
- LPの骨組み。セマンティックなHTML構造。
- セクション: Hero, Problem, Solution (Features), Pricing, Testimonials, CTA。

#### [NEW] [css/style.css](file:///Users/kato/Public/works_git/apps/urazu_lp/css/style.css)
- Cyber-Pop Editorialデザインの実装。
- ダークテーマ、ネオンカラーのアクセント、グラデーション。

#### [NEW] [js/main.js](file:///Users/kato/Public/works_git/apps/urazu_lp/js/main.js)
- スクロールギミック（フェードイン、パララックス効果、フローティングアニメーション）。
- AIツールのBefore/Afterを表現するスライダーなどのロジック。

### 2. デザイン & アニメーション仕様
- **カラーパレット**: 
  - Background: ダークグレー/ブラック (`#0f0f13`)
  - Accent: ネオンピンク (`#ff007f`)、シアン (`#00f0ff`)、パープル (`#8a2be2`)
- **フォント**: モダンなサンセリフ体（Google Fontsの `Inter` または `Noto Sans JP`）。
- **ギミック**:
  - スクロールに応じた要素のフェードイン・スライドアップ。
  - ホバー時のネオングロウ（発光）効果。
  - 背景にノイズやグリッドラインを加え、サイバー感を演出。

## 動作確認・テスト計画 (Verification Plan)

### ブラウザ動作確認
1.  ローカル環境で `index.html` をブラウザで開き、デザインが指示通りか（Rich Aesthetics）目視確認する。
2.  スクロールしてアニメーション（フェードイン、パララックス）が正しく動作するか確認する。
3.  すべてのCTAボタンがクリッカブルであり、適切に遷移することを確認する。
4.  レスポンシブデザイン（モバイルサイズでの表示）が崩れていないか確認する。
