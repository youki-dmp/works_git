export type GenerationMode = 'speed' | 'quality';

export interface ThumbnailInputs {
  mainSubject: string;
  uploadedImage: string | null;
  uploadedLogo: string | null;
  background: string;
  uploadedBackgroundImage: string | null;
  referenceImages: string[];
  referenceUrls: string[];
  copyText: string;
  subCopy: string;
  subCopy2: string;
  videoDescription: string;
  aspectRatio: '16:9' | '9:16';
  subjectBorderColor: string;
  subjectGlowColor: string;
  useTrendSearch: boolean;
  emotionalTrigger: string;
  competitorKeyword: string;
  strictIdentity: boolean;
  subjectScale: number; // 0.1 to 2.0
  subjectType: 'full' | 'bust' | 'face';
  subjectX: number; // -50 to 50
  subjectY: number; // -50 to 50
  generationMode: GenerationMode;
  preserveRawSubjectLayer: boolean; // 元人物画像を直接レイヤー重ねで非加工使用するか
}

export interface LayeredAssets {
  background: string;
  subject: string;
  text: string;
  effects: string;
}

export interface FinalImageEntry {
  url: string;
  timestamp: string;
  sourcePattern: string;
  mainCopy: string;
  subCopy: string;
  subCopy2: string;
  plan: string;
  backgroundUrl?: string;
  subjectUrl?: string;
  textUrl?: string;
  effectsUrl?: string;
}

export const AppStatus = {
  IDLE: 'IDLE',
  PLANNING: 'PLANNING',
  PLANNED: 'PLANNED',
  CRITIQUING: 'CRITIQUING',
  RENDERING: 'RENDERING',
  COMPLETE: 'COMPLETE',
  POLISHING: 'POLISHING',
  POLISHED: 'POLISHED',
  ERROR: 'ERROR'
} as const;

export type AppStatusType = typeof AppStatus[keyof typeof AppStatus];