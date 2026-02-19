import React, { useRef, useState } from 'react';
import { ThumbnailInputs, AppStatusType, AppStatus } from '../types';
import { Sparkles, Image as ImageIcon, Type, LayoutTemplate, Upload, X, BadgeCheck, Smartphone, Monitor, Palette, Search, Loader2, Target, Heart, ShieldCheck } from 'lucide-react';

interface InputFormProps {
  inputs: ThumbnailInputs;
  setInputs: React.Dispatch<React.SetStateAction<ThumbnailInputs>>;
  onSubmit: () => void;
  status: AppStatusType;
}

const EMOTIONS = [
  "衝撃・サプライズ", "絶望・ピンチ", "歓喜・達成", "好奇心・謎", "怒り・不満", "感動・エモい", "爆笑・ユーモア", "ポップ・エンタメ", "ホラー・恐怖", "裏技・攻略"
];

const InputForm: React.FC<InputFormProps> = ({ inputs, setInputs, onSubmit, status }) => {
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setInputs(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (file: File, fieldName: 'uploadedImage' | 'uploadedLogo' | 'uploadedBackgroundImage') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setInputs(prev => ({ ...prev, [fieldName]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const isProcessing = status !== AppStatus.IDLE && status !== AppStatus.PLANNED && status !== AppStatus.COMPLETE && status !== AppStatus.POLISHED && status !== AppStatus.ERROR;

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-full flex flex-col text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold tracking-tight flex items-center text-slate-800">
          <LayoutTemplate className="w-6 h-6 mr-3 text-slate-900" />
          デザイン構成
        </h2>
        <label className="flex items-center cursor-pointer group">
          <div className="mr-3 text-xs font-medium text-slate-400 group-hover:text-slate-900 transition-colors">トレンド調査</div>
          <div className="relative">
            <input type="checkbox" name="useTrendSearch" checked={inputs.useTrendSearch} onChange={handleChange} className="sr-only" />
            <div className={`block w-10 h-6 rounded-full transition-colors ${inputs.useTrendSearch ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${inputs.useTrendSearch ? 'transform translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {/* Aspect Ratio */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setInputs(prev => ({ ...prev, aspectRatio: '16:9' }))} className={`flex items-center justify-center py-3 rounded-xl text-sm font-medium border transition-all ${inputs.aspectRatio === '16:9' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
            <Monitor className="w-4 h-4 mr-2" /> 16:9 通常画面
          </button>
          <button onClick={() => setInputs(prev => ({ ...prev, aspectRatio: '9:16' }))} className={`flex items-center justify-center py-3 rounded-xl text-sm font-medium border transition-all ${inputs.aspectRatio === '9:16' ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
            <Smartphone className="w-4 h-4 mr-2" /> 9:16 ショート
          </button>
        </div>

        {/* Assets Section */}
        <div className="space-y-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" /> 素材アセット
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Main Subject */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-300 font-bold flex items-center">
                  被写体画像（立ち絵）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">改変禁止</span>
                  <input
                    type="checkbox"
                    name="strictIdentity"
                    checked={inputs.strictIdentity}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-grow">
                  {!inputs.uploadedImage ? (
                    <div onClick={() => mainFileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 h-28 hover:bg-slate-50 transition-all cursor-pointer">
                      <Upload className="w-5 h-5 mb-2" />
                      <span className="text-xs font-medium">人物・キャラクター</span>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-28 bg-slate-50 flex items-center justify-center p-2 shadow-inner">
                      <img
                        src={inputs.uploadedImage}
                        className={`max-w-full max-h-full object-contain transition-transform duration-300`}
                        style={{ transform: `scale(${inputs.subjectScale}) translate(${inputs.subjectX}%, ${inputs.subjectY}%)` }}
                      />
                      <button onClick={() => setInputs(p => ({ ...p, uploadedImage: null }))} className="absolute top-2 right-2 bg-slate-900 shadow-lg p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  <input type="file" ref={mainFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedImage')} className="hidden" />
                </div>

                {inputs.uploadedImage && (
                  <div className="w-40 space-y-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase">Size Control</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(['full', 'bust', 'face'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setInputs(p => ({ ...p, subjectType: type, subjectScale: type === 'full' ? 0.8 : type === 'bust' ? 1.2 : 2.0, subjectX: 0, subjectY: type === 'bust' ? -15 : type === 'face' ? -25 : 0 }))}
                            className={`py-1 rounded text-[8px] font-bold border transition-all ${inputs.subjectType === type ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                          >
                            {type === 'full' ? '全身' : type === 'bust' ? '上半身' : 'アップ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase">Position Fine-tune</span>
                      <div className="flex items-center justify-between gap-1">
                        <div className="grid grid-cols-3 gap-1">
                          <div />
                          <button onClick={() => setInputs(p => ({ ...p, subjectY: Math.max(-100, p.subjectY - 5) }))} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Monitor className="w-2.5 h-2.5 text-white transform rotate-180" /></button>
                          <div />
                          <button onClick={() => setInputs(p => ({ ...p, subjectX: Math.max(-100, p.subjectX - 5) }))} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Monitor className="w-2.5 h-2.5 text-white transform -rotate-90" /></button>
                          <button onClick={() => setInputs(p => ({ ...p, subjectX: 0, subjectY: 0 }))} className="p-1 bg-slate-700 rounded hover:bg-slate-600 font-bold text-[7px] text-white">R</button>
                          <button onClick={() => setInputs(p => ({ ...p, subjectX: Math.min(100, p.subjectX + 5) }))} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Monitor className="w-2.5 h-2.5 text-white transform rotate-90" /></button>
                          <div />
                          <button onClick={() => setInputs(p => ({ ...p, subjectY: Math.min(100, p.subjectY + 5) }))} className="p-1 bg-slate-700 rounded hover:bg-slate-600"><Monitor className="w-2.5 h-2.5 text-white" /></button>
                          <div />
                        </div>
                        <div className="flex flex-col text-[7px] text-slate-500 font-bold">
                          <span>X: {inputs.subjectX}%</span>
                          <span>Y: {inputs.subjectY}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Scale: x{inputs.subjectScale.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={inputs.subjectScale}
                        onChange={(e) => setInputs(p => ({ ...p, subjectScale: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Image */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] text-slate-300 font-bold flex items-center">
                チャンネルロゴ
              </label>
              {!inputs.uploadedLogo ? (
                <div onClick={() => logoFileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-lg p-2 flex flex-col items-center justify-center text-slate-500 h-16 hover:bg-slate-700/50 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[8px] uppercase">Logo</span>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-slate-600 h-16 bg-slate-900 flex items-center justify-center p-2">
                  <img src={inputs.uploadedLogo} className="max-w-full max-h-full object-contain" />
                  <button onClick={() => setInputs(p => ({ ...p, uploadedLogo: null }))} className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-white hover:bg-red-500"><X className="w-3 h-3" /></button>
                </div>
              )}
              <input type="file" ref={logoFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedLogo')} className="hidden" />
            </div>
          </div>

          {/* Background Image (Full Width) */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-300 font-bold flex items-center">
              背景画像（ゲーム画面など）
            </label>
            {!inputs.uploadedBackgroundImage ? (
              <div onClick={() => bgFileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center text-slate-500 h-24 hover:bg-slate-700/50 transition-all cursor-pointer">
                <Upload className="w-5 h-5 mb-1 text-slate-600" />
                <span className="text-[9px] uppercase font-bold">Background Upload</span>
                <p className="text-[8px] text-slate-600 mt-1">ゲームのスクショなどを背景に指定できます</p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-slate-600 h-24">
                <img src={inputs.uploadedBackgroundImage} className="w-full h-full object-cover" />
                <button onClick={() => setInputs(p => ({ ...p, uploadedBackgroundImage: null }))} className="absolute top-1 right-1 bg-black/70 p-1.5 rounded-full text-white hover:bg-red-500 shadow-lg"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <input type="file" ref={bgFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedBackgroundImage')} className="hidden" />
          </div>
        </div>

        {/* Analysis & Copy */}
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
              <Target className="w-3 h-3 mr-2" /> 競合分析ターゲット
            </label>
            <input type="text" name="competitorKeyword" value={inputs.competitorKeyword} onChange={handleChange} placeholder="例: マインクラフト 建築" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:ring-2 focus:ring-slate-950 transition-all outline-none" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
              <Heart className="w-3 h-3 mr-2 text-pink-500" /> 感情フック
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map(emo => (
                <button key={emo} onClick={() => setInputs(p => ({ ...p, emotionalTrigger: emo }))} className={`py-3 px-1 rounded-xl text-[10px] font-bold border transition-all ${inputs.emotionalTrigger === emo ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-800'}`}>
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
              <Type className="w-3 h-3 mr-2" /> サムネイルコピー
            </label>
            <input type="text" name="copyText" value={inputs.copyText} onChange={handleChange} placeholder="メインコピー（一瞬で伝わる！）" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 mb-3 focus:ring-2 focus:ring-slate-950 transition-all outline-none" />
            <input type="text" name="subCopy" value={inputs.subCopy} onChange={handleChange} placeholder="サブコピー" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 focus:ring-1 focus:ring-slate-950 transition-all outline-none" />
          </div>
        </div>
      </div>

      <div className="pt-8 mt-6 border-t border-slate-100">
        <button onClick={onSubmit} disabled={isProcessing || !inputs.copyText} className={`w-full py-5 px-6 rounded-2xl font-semibold text-white flex items-center justify-center transition-all ${isProcessing || !inputs.copyText ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:scale-[1.01] active:scale-[0.99]'}`}>
          {isProcessing ? (<><Loader2 className="animate-spin mr-3 h-6 w-6" /> 分析・構成中...</>) : (<><Sparkles className="w-6 h-6 mr-3" /> 戦略プランを策定する</>)}
        </button>
      </div>
    </div>
  );
};

export default InputForm;