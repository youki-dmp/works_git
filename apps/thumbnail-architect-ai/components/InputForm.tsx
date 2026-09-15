import React, { useRef, useState } from 'react';
import { ThumbnailInputs, AppStatusType, AppStatus } from '../types';
import { Sparkles, Image as ImageIcon, Type, LayoutTemplate, Upload, X, BadgeCheck, Smartphone, Monitor, Palette, Search, Loader2, Target, Heart, ShieldCheck, Zap, Sliders, Layers } from 'lucide-react';

interface InputFormProps {
  inputs: ThumbnailInputs;
  setInputs: React.Dispatch<React.SetStateAction<ThumbnailInputs>>;
  onSubmit: () => void;
  status: AppStatusType;
}

const EMOTIONS = [
  "衝撃・サプライズ", "絶望・ピンチ", "歓喜・達成", "好奇心・謎", "怒り・不満", "感動・エモい", "爆笑・ユーモア", "ポップ・エンタメ", "ホラー・恐怖", "裏技・攻略", "雑談", "歌枠"
];

const InputForm: React.FC<InputFormProps> = ({ inputs, setInputs, onSubmit, status }) => {
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [dragActiveField, setDragActiveField] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      const field = e.currentTarget.getAttribute('data-field');
      if (field) setDragActiveField(field);
    } else if (e.type === "dragleave") {
      setDragActiveField(null);
    }
  };

  const handleDrop = (e: React.DragEvent, fieldName: 'uploadedImage' | 'uploadedLogo' | 'uploadedBackgroundImage' | 'referenceImages') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveField(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], fieldName);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setInputs(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = (file: File, fieldName: 'uploadedImage' | 'uploadedLogo' | 'uploadedBackgroundImage' | 'referenceImages') => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setInputs(prev => {
        if (fieldName === 'referenceImages') {
          const newRefs = [...prev.referenceImages, reader.result as string].slice(0, 3);
          return { ...prev, referenceImages: newRefs };
        }
        return { ...prev, [fieldName]: reader.result as string };
      });
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = (index: number) => {
    setInputs(prev => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index)
    }));
  };

  const isProcessing = status !== AppStatus.IDLE && status !== AppStatus.PLANNED && status !== AppStatus.COMPLETE && status !== AppStatus.POLISHED && status !== AppStatus.ERROR;

  return (
    <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col text-slate-900 transition-all">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            デザイン構成
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Gemini 3.5 Flash & 3 Pro エンジンによるサムネイル最適化</p>
        </div>

        {/* Engine Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setInputs(p => ({ ...p, generationMode: 'speed' }))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${inputs.generationMode === 'speed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            title="高速生成 (Gemini 3.5 Flash)"
          >
            <Zap className="w-3.5 h-3.5" />
            Speed
          </button>
          <button
            onClick={() => setInputs(p => ({ ...p, generationMode: 'quality' }))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${inputs.generationMode === 'quality' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            title="最高品質 (Gemini 3 Pro Image)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pro
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {/* Aspect Ratio */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInputs(prev => ({ ...prev, aspectRatio: '16:9' }))}
            className={`flex items-center justify-center py-3 rounded-2xl text-xs font-bold border transition-all ${inputs.aspectRatio === '16:9' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
          >
            <Monitor className="w-4 h-4 mr-2" /> 16:9 通常画面
          </button>
          <button
            onClick={() => setInputs(prev => ({ ...prev, aspectRatio: '9:16' }))}
            className={`flex items-center justify-center py-3 rounded-2xl text-xs font-bold border transition-all ${inputs.aspectRatio === '9:16' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
          >
            <Smartphone className="w-4 h-4 mr-2" /> 9:16 ショート
          </button>
        </div>

        {/* Layer & Identity Controls (Raw Subject Preservation) */}
        <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">元人物画像を直接非加工レイヤーとして使用</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="preserveRawSubjectLayer"
                checked={inputs.preserveRawSubjectLayer}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            AIによる再描画を行わず、アップロードされた被写体画像をそのままのレイヤーとして背景・テキスト・エフェクトと重ね合わせます。
          </p>
        </div>

        {/* Assets Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-500" /> 素材アセット
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Main Subject */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center">
                  被写体画像（人物・キャラ立ち絵）
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">特徴完全固定</span>
                  <input
                    type="checkbox"
                    name="strictIdentity"
                    checked={inputs.strictIdentity}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-grow">
                  {!inputs.uploadedImage ? (
                    <div
                      data-field="uploadedImage"
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={(e) => handleDrop(e, 'uploadedImage')}
                      onClick={() => mainFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center h-28 transition-all cursor-pointer ${dragActiveField === 'uploadedImage' ? 'border-indigo-500 bg-indigo-50 text-indigo-600 scale-[1.01]' : 'border-slate-200 text-slate-400 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                      <Upload className={`w-5 h-5 mb-1.5 text-slate-400 ${dragActiveField === 'uploadedImage' ? 'animate-bounce text-indigo-600' : ''}`} />
                      <span className="text-xs font-semibold text-slate-600">人物・キャラクター画像をドロップ</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG / JPG 形式</span>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-50 flex items-center justify-center p-2 shadow-sm">
                      <img
                        src={inputs.uploadedImage}
                        className="max-w-full max-h-full object-contain transition-transform duration-300"
                        style={{ transform: `scale(${inputs.subjectScale}) translate(${inputs.subjectX}%, ${inputs.subjectY}%)` }}
                      />
                      <button onClick={() => setInputs(p => ({ ...p, uploadedImage: null }))} className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur shadow-md p-1.5 rounded-full text-white hover:bg-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <input type="file" ref={mainFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedImage')} className="hidden" />
                </div>

                {inputs.uploadedImage && (
                  <div className="w-44 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">構図タイプ</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(['full', 'bust', 'face'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setInputs(p => ({ ...p, subjectType: type, subjectScale: type === 'full' ? 0.8 : type === 'bust' ? 1.2 : 2.0, subjectX: 0, subjectY: type === 'bust' ? -15 : type === 'face' ? -25 : 0 }))}
                            className={`py-1 rounded-lg text-[9px] font-bold border transition-all ${inputs.subjectType === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                          >
                            {type === 'full' ? '全身' : type === 'bust' ? '上半身' : 'ドアップ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>拡大率</span>
                        <span>x{inputs.subjectScale.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={inputs.subjectScale}
                        onChange={(e) => setInputs(p => ({ ...p, subjectScale: parseFloat(e.target.value) }))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Image */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ロゴ画像</label>
              {!inputs.uploadedLogo ? (
                <div
                  data-field="uploadedLogo"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={(e) => handleDrop(e, 'uploadedLogo')}
                  onClick={() => logoFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-2 flex flex-col items-center justify-center h-20 transition-all cursor-pointer ${dragActiveField === 'uploadedLogo' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-slate-50'}`}
                >
                  <Upload className="w-4 h-4 mb-1 text-slate-400" />
                  <span className="text-[10px] font-semibold">ロゴ追加</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-20 bg-slate-50 flex items-center justify-center p-2">
                  <img src={inputs.uploadedLogo} className="max-w-full max-h-full object-contain" />
                  <button onClick={() => setInputs(p => ({ ...p, uploadedLogo: null }))} className="absolute top-1 right-1 bg-slate-900/80 p-1 rounded-full text-white hover:bg-red-500"><X className="w-3 h-3" /></button>
                </div>
              )}
              <input type="file" ref={logoFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedLogo')} className="hidden" />
            </div>

            {/* Background Image */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">背景用スクショ</label>
              {!inputs.uploadedBackgroundImage ? (
                <div
                  data-field="uploadedBackgroundImage"
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={(e) => handleDrop(e, 'uploadedBackgroundImage')}
                  onClick={() => bgFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-2 flex flex-col items-center justify-center h-20 transition-all cursor-pointer ${dragActiveField === 'uploadedBackgroundImage' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-slate-50'}`}
                >
                  <Upload className="w-4 h-4 mb-1 text-slate-400" />
                  <span className="text-[10px] font-semibold">背景画像</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-20">
                  <img src={inputs.uploadedBackgroundImage} className="w-full h-full object-cover" />
                  <button onClick={() => setInputs(p => ({ ...p, uploadedBackgroundImage: null }))} className="absolute top-1 right-1 bg-slate-900/80 p-1 rounded-full text-white hover:bg-red-500"><X className="w-3 h-3" /></button>
                </div>
              )}
              <input type="file" ref={bgFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'uploadedBackgroundImage')} className="hidden" />
            </div>

            {/* Reference Images */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                参考構図サムネイル (最大3枚)
                <span className="text-[10px] text-slate-400 font-medium">{inputs.referenceImages.length}/3</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {inputs.referenceImages.map((refImg, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200 h-16">
                    <img src={refImg} className="w-full h-full object-cover" />
                    <button onClick={() => removeReferenceImage(i)} className="absolute top-1 right-1 bg-slate-900/80 p-1 rounded-full text-white hover:bg-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                {inputs.referenceImages.length < 3 && (
                  <div
                    data-field="referenceImages"
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, 'referenceImages')}
                    onClick={() => refFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-16 transition-all cursor-pointer ${dragActiveField === 'referenceImages' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-slate-50'}`}
                  >
                    <Upload className="w-3.5 h-3.5 mb-0.5 text-slate-400" />
                    <span className="text-[9px] font-bold">参考追加</span>
                  </div>
                )}
              </div>
              <input type="file" ref={refFileInputRef} onChange={(e) => handleFile(e.target.files?.[0]!, 'referenceImages')} className="hidden" />
            </div>
          </div>
        </div>

        {/* Copy & Emotion */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center">
              <Target className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> 競合・企画キーワード
            </label>
            <input
              type="text"
              name="competitorKeyword"
              value={inputs.competitorKeyword}
              onChange={handleChange}
              placeholder="例: Apex ランク立ち回り / マイクラ 自動化"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center">
              <Heart className="w-3.5 h-3.5 mr-1.5 text-rose-500" /> ターゲット感情・ジャンル
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EMOTIONS.map(emo => (
                <button
                  key={emo}
                  onClick={() => setInputs(p => ({ ...p, emotionalTrigger: emo }))}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all truncate ${inputs.emotionalTrigger === emo ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center">
              <Type className="w-3.5 h-3.5 mr-1.5 text-indigo-500" /> サムネイルテロップ（インパクト重視）
            </label>
            <input
              type="text"
              name="copyText"
              value={inputs.copyText}
              onChange={handleChange}
              placeholder="メインコピー (例: 99%が勘違いしている決定的な違い)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
            <input
              type="text"
              name="subCopy"
              value={inputs.subCopy}
              onChange={handleChange}
              placeholder="サブコピー1 (例: 最新環境対応)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
            <input
              type="text"
              name="subCopy2"
              value={inputs.subCopy2}
              onChange={handleChange}
              placeholder="サブコピー2 (例: 衝撃の結末...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-5 mt-4 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isProcessing || !inputs.copyText}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${isProcessing || !inputs.copyText ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-300 active:scale-[0.99]'}`}
        >
          {isProcessing ? (
            <><Loader2 className="animate-spin h-5 w-5" /> AI戦略プランを作成中...</>
          ) : (
            <><Sparkles className="w-5 h-5 text-amber-300" /> AI戦略プランを策定する</>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;