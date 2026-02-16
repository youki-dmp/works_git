export interface Layer {
  id: string;
  name: string;
  type: 'background' | 'effect' | 'character' | 'text';
  isVisible: boolean;
  content?: string; // Image URL or Text string
  style?: React.CSSProperties;
}

export type LayoutPattern =
  | 'chat-standard-left' | 'chat-standard-right' | 'vertical-jp' | 'night-chill' | 'retro-pop'
  | 'botanical-frame' | 'minimal-white' | 'pc-window' | 'diagonal-stripe' | 'speech-bubble'
  | 'stage-light' | 'musical-score' | 'city-night' | 'glitter-stage' | 'watercolor'
  | 'live-audience' | 'vinyl-record' | 'emotional-sunset' | 'action-splash' | 'cyber-digital'
  | 'rpg-parchment' | 'pixel-game' | 'horror-drip' | 'gaming-ui' | 'vs-versus'
  | 'magazine-cover' | 'morning-v' | 'polaroid-wall' | 'seasonal-xmas' | 'breaking-news';

export interface LayoutPreset {
  id: LayoutPattern;
  name: string;
  category: 'chat' | 'singing' | 'gaming' | 'announcement';
  description: string;
  layerStyles: Record<string, React.CSSProperties>;
}

export interface ThumbnailTemplate {
  id: string;
  name: string;
  pattern: LayoutPattern;
  layers: Layer[];
}
