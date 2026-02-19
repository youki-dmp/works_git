import { LayoutPreset } from '../types';

export const LAYOUT_PRESETS: LayoutPreset[] = [
  // --- CHAT CATEGORY ---
  {
    id: 'chat-standard-left',
    name: '王道左配置',
    category: 'chat',
    description: '左上に大きくタイトル、右側に立ち絵を配置。',
    badgeType: 'classic',
    layerStyles: {
      character: { right: '0', bottom: '0', transform: 'scale(1.1)', transformOrigin: 'bottom right' },
      text: { top: '15%', left: '8%', width: '50%', textAlign: 'left', fontSize: '5rem', fontWeight: '900' },
    }
  },
  {
    id: 'chat-standard-right',
    name: '王道右配置',
    category: 'chat',
    description: '左側に立ち絵、右側にタイトルを配置。',
    layerStyles: {
      character: { left: '0', bottom: '0', transform: 'scale(1.1)', transformOrigin: 'bottom left' },
      text: { top: '15%', right: '8%', width: '50%', textAlign: 'right', fontSize: '5rem', fontWeight: '900' },
    }
  },
  {
    id: 'vertical-jp',
    name: '垂直和風',
    category: 'chat',
    description: '縦書きの和風レイアウト。',
    badgeType: 'trend',
    layerStyles: {
      character: { right: '10%', bottom: '0' },
      text: { top: '10%', left: '5%', writingMode: 'vertical-rl', fontSize: '4rem', fontWeight: '900' },
    }
  },
  {
    id: 'night-chill',
    name: '夜のゆったり',
    category: 'chat',
    description: '落ち着いた夜の雰囲気。',
    layerStyles: {
      character: { left: '10%', bottom: '5%', transform: 'scale(0.9)' },
      text: { bottom: '15%', right: '10%', textAlign: 'right', fontSize: '3rem' },
    }
  },
  {
    id: 'retro-pop',
    name: 'レトロポップ',
    category: 'chat',
    description: '80年代風のビビッドなスタイル。',
    layerStyles: {
      character: { right: '5%', bottom: '5%' },
      text: { top: '20%', left: '10%', transform: 'rotate(-5deg)', fontSize: '5rem', color: '#ff00ff' },
    }
  },
  {
    id: 'botanical-frame',
    name: 'ボタニカルフレーム',
    category: 'chat',
    description: '優雅な植物の装飾。',
    layerStyles: {
      character: { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
      text: { bottom: '10%', width: '100%', textAlign: 'center', fontSize: '3rem', fontFamily: 'serif' },
    }
  },
  {
    id: 'minimal-white',
    name: 'ミニマルホワイト',
    category: 'chat',
    description: '洗練された白ベースの構成。',
    layerStyles: {
      character: { right: '10%', bottom: '0' },
      text: { top: '40%', left: '10%', fontSize: '2.5rem', fontWeight: '300', letterSpacing: '0.2em' },
    }
  },
  {
    id: 'pc-window',
    name: 'PCウィンドウ風',
    category: 'chat',
    description: 'デスクトップ画面を模したデザイン。',
    layerStyles: {
      character: { left: '20%', top: '20%', width: '60%', border: '2px solid white' },
      text: { top: '10%', left: '5%', fontSize: '1.5rem' },
    }
  },
  {
    id: 'diagonal-stripe',
    name: '斜めストライプ',
    category: 'chat',
    description: '躍動感のあるストライプ背景。',
    badgeType: 'hi-ctr',
    layerStyles: {
      character: { right: '0', bottom: '0' },
      text: { top: '30%', left: '10%', transform: 'rotate(-10deg)', fontSize: '6rem', backgroundColor: 'yellow', color: 'black' },
    }
  },
  {
    id: 'speech-bubble',
    name: '吹き出しポップ',
    category: 'chat',
    description: 'キャラクターが喋っている風。',
    layerStyles: {
      character: { left: '5%', bottom: '0' },
      text: { top: '20%', right: '10%', padding: '2rem', backgroundColor: 'white', color: 'black', borderRadius: '50%' },
    }
  },

  // --- SINGING CATEGORY ---
  {
    id: 'stage-light',
    name: 'ステージライト',
    category: 'singing',
    description: '劇的な照明演出。',
    layerStyles: {
      character: { bottom: '0', left: '50%', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 20px white)' },
      text: { top: '20%', width: '100%', textAlign: 'center', fontSize: '5rem' },
    }
  },
  {
    id: 'musical-score',
    name: '楽譜エフェクト',
    category: 'singing',
    description: '音符が舞う優雅な構成。',
    layerStyles: {
      character: { right: '5%', bottom: '0' },
      text: { top: '15%', left: '10%', fontSize: '4rem', fontStyle: 'italic' },
    }
  },
  {
    id: 'city-night',
    name: '都会の夜景',
    category: 'singing',
    description: 'ネオンとボケ感のある夜景。',
    layerStyles: {
      character: { left: '10%', bottom: '0' },
      text: { top: '30%', right: '10%', fontSize: '4rem', textShadow: '0 0 10px cyan' },
    }
  },
  {
    id: 'glitter-stage',
    name: 'キラキラ・ステージ',
    category: 'singing',
    description: 'ラメと輝きを強調。',
    layerStyles: {
      character: { bottom: '0', transform: 'scale(1.1)' },
      text: { bottom: '20%', width: '100%', textAlign: 'center', fontSize: '6rem', fontWeight: '900' },
    }
  },
  {
    id: 'watercolor',
    name: '水彩・透明感',
    category: 'singing',
    description: '淡い色調と水彩テクスチャ。',
    layerStyles: {
      character: { right: '10%', bottom: '0', opacity: 0.9 },
      text: { top: '20%', left: '15%', fontSize: '3.5rem', fontWeight: 'bold' },
    }
  },
  {
    id: 'live-audience',
    name: 'ライブシルエット',
    category: 'singing',
    description: '観客越しに見るステージ。',
    layerStyles: {
      character: { bottom: '10%', transform: 'scale(0.8)' },
      text: { top: '10%', width: '100%', textAlign: 'center', fontSize: '4rem' },
    }
  },
  {
    id: 'vinyl-record',
    name: 'レコード盤',
    category: 'singing',
    description: '円形に沿ったタイポグラフィ。',
    layerStyles: {
      character: { left: '10%', bottom: '0' },
      text: { right: '10%', top: '50%', transform: 'translateY(-50%) rotate(90deg)', fontSize: '3rem' },
    }
  },
  {
    id: 'emotional-sunset',
    name: 'エモーショナル夕暮れ',
    category: 'singing',
    description: '夕焼けの切ない雰囲気。',
    layerStyles: {
      character: { right: '0', bottom: '0', filter: 'brightness(0.7)' },
      text: { bottom: '20%', left: '10%', fontSize: '4rem' },
    }
  },

  // --- GAMING CATEGORY ---
  {
    id: 'action-splash',
    name: 'アクションスプラッシュ',
    category: 'gaming',
    description: 'ペンキの飛沫と力強い文字。',
    badgeType: 'hi-ctr',
    layerStyles: {
      character: { right: '5%', bottom: '0', transform: 'rotate(5deg)' },
      text: { top: '15%', left: '5%', fontSize: '6rem', fontWeight: 'black', textShadow: '5px 5px 0 red' },
    }
  },
  {
    id: 'cyber-digital',
    name: 'サイバーデジタル',
    category: 'gaming',
    description: 'ネオン基盤と等幅フォント。',
    layerStyles: {
      character: { left: '10%', bottom: '0' },
      text: { top: '20%', right: '5%', fontSize: '4rem', fontFamily: 'monospace', color: '#00ff00' },
    }
  },
  {
    id: 'rpg-parchment',
    name: 'RPG羊皮紙風',
    category: 'gaming',
    description: '中世ファンタジー風。',
    layerStyles: {
      character: { right: '10%', bottom: '5%' },
      text: { top: '20%', left: '10%', fontSize: '3.5rem', fontFamily: 'serif' },
    }
  },
  {
    id: 'pixel-game',
    name: 'ドット絵ゲーム',
    category: 'gaming',
    description: 'レトロゲーム風の構成。',
    layerStyles: {
      character: { left: '50%', bottom: '0', transform: 'translateX(-50%) image-rendering: pixelated;' },
      text: { top: '10%', width: '100%', textAlign: 'center', fontSize: '4rem' },
    }
  },
  {
    id: 'horror-drip',
    name: 'ホラー・ドロドロ',
    category: 'gaming',
    description: '恐怖を煽る歪んだデザイン。',
    layerStyles: {
      character: { right: '0', bottom: '0', filter: 'contrast(1.5) grayscale(1)' },
      text: { top: '30%', left: '10%', fontSize: '5rem', color: 'red', transform: 'skewX(-10deg)' },
    }
  },
  {
    id: 'gaming-ui',
    name: 'ゲーミングUI',
    category: 'gaming',
    description: 'ステータス画面風のパーツ。',
    layerStyles: {
      character: { right: '5%', top: '10%', width: '40%' },
      text: { bottom: '10%', left: '10%', fontSize: '3rem' },
    }
  },
  {
    id: 'vs-versus',
    name: 'VS対決構図',
    category: 'gaming',
    description: '左右分割のバトルスタイル。',
    layerStyles: {
      character: { left: '0', bottom: '0', width: '45%' },
      text: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8rem', fontStyle: 'italic' },
    }
  },

  // --- ANNOUNCEMENT CATEGORY ---
  {
    id: 'magazine-cover',
    name: '雑誌の表紙風',
    category: 'announcement',
    description: '豊富な見出しと中央コピー。',
    layerStyles: {
      character: { bottom: '0', zIndex: 1 },
      text: { top: '10%', width: '100%', textAlign: 'center', fontSize: '7rem', zIndex: 2 },
    }
  },
  {
    id: 'morning-v',
    name: '朝の食卓',
    category: 'announcement',
    description: '明るく爽やかなおはよう朝。',
    layerStyles: {
      character: { left: '10%', bottom: '0' },
      text: { top: '20%', right: '15%', fontSize: '4rem', color: '#ffaa00' },
    }
  },
  {
    id: 'polaroid-wall',
    name: 'ポラロイド壁',
    category: 'announcement',
    description: '思い出写真が並ぶ風。',
    layerStyles: {
      character: { left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(5deg)' },
      text: { bottom: '10%', right: '10%', fontSize: '2rem' },
    }
  },
  {
    id: 'seasonal-xmas',
    name: '季節限定（クリスマス）',
    category: 'announcement',
    description: 'イベント期間限定デザイン。',
    layerStyles: {
      character: { right: '5%', bottom: '0' },
      text: { top: '15%', left: '10%', fontSize: '5rem', color: '#00aa00' },
    }
  },
  {
    id: 'breaking-news',
    name: '重大発表インパクト',
    category: 'announcement',
    description: '視線を釘付けにする警告色。',
    badgeType: 'trend',
    layerStyles: {
      character: { left: '50%', bottom: '0', transform: 'translateX(-50%)', zIndex: 1 },
      text: { top: '20%', width: '100%', textAlign: 'center', fontSize: '8rem', backgroundColor: 'black', color: 'yellow', zIndex: 2 },
    }
  },
];
