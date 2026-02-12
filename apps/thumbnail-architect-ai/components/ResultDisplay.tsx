import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailInputs, AppStatus, AppStatusType, FinalImageEntry } from '../types';
import { FileText, Sparkles, Image as ImageIcon, AlertCircle, Loader2, Star, CheckCircle, RefreshCw, PenTool, Type, Download, Edit3, History, Wand2, Calendar, Zap, Palette, TrendingUp, Quote, MessageSquare, Smartphone, Eye, Clock, User, MoreVertical, Search, ShieldCheck, X, Target, MapPin, RotateCcw } from 'lucide-react';
import { critiqueDraft } from '../services/geminiService';
import ProgressBar from './ProgressBar';

interface Marker {
  x: number;
  y: number;
}

interface ResultDisplayProps {
  plan: string;
  draftImages: string[];
  selectedDraftIndex: number | null;
  finalImages: FinalImageEntry[];
  status: AppStatusType;
  error: string | null;
  initialCopy: string;
  initialSubCopy: string;
  onGenerateDrafts: (instruction?: string) => void;
  onSelectDraft: (index: number) => void;
  onGenerateFinal: (instruction: string, mainCopy: string, subCopy: string) => void;
  onUpdatePlan: (plan: string) => void;
  progress: number;
  onRetry: () => void;
  inputs: ThumbnailInputs;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  plan, draftImages, selectedDraftIndex, finalImages, status, error,
  initialCopy, initialSubCopy, onGenerateDrafts, onSelectDraft, onGenerateFinal, onUpdatePlan,
  progress, onRetry, inputs
}) => {
  const [brushupInstruction, setBrushupInstruction] = useState("");
  const [editMainCopy, setEditMainCopy] = useState(initialCopy);
  const [editSubCopy, setEditSubCopy] = useState(initialSubCopy);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedPlan, setEditedPlan] = useState("");
  const [critique, setCritique] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedFinalIndex, setSelectedFinalIndex] = useState<number | null>(null);
  const [selectionRadius, setSelectionRadius] = useState(15);
  const [isAutoSelect, setIsAutoSelect] = useState(false);

  // Visual Annotation State
  const [marker, setMarker] = useState<Marker | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleQuickRefine = (action: string) => {
    let instruction = "";
    if (action === 'text-big') instruction = "メインコピーの文字をもっと大きくして、視認性を最大化してください。";
    if (action === 'face-focus') instruction = "被写体の顔に寄せて、より表情が感情的に伝わるようにズームしてください。";
    if (action === 'impact') instruction = "全体的なインパクトを高めるために、ライティングとコントラストを強化してください。";

    onGenerateFinal(instruction, editMainCopy, editSubCopy);
  };

  useEffect(() => { if (plan) setEditedPlan(plan); }, [plan]);
  useEffect(() => { setEditMainCopy(initialCopy); setEditSubCopy(initialSubCopy); }, [initialCopy, initialSubCopy]);

  const handleCritique = async () => {
    if (selectedDraftIndex === null || !draftImages[selectedDraftIndex]) return;
    setIsCritiquing(true);
    setCritique(null);
    try {
      const result = await critiqueDraft(plan, draftImages[selectedDraftIndex]);
      setCritique(result);
    } catch (e) { console.error(e); } finally { setIsCritiquing(false); }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMarker({ x, y });
  };

  const handleGenerateFinalWithMarker = () => {
    let finalInstruction = brushupInstruction;
    if (marker) {
      const modeDesc = isAutoSelect ? "【AI自動選択モード】周辺の関連オブジェクトやセグメントをインテリジェントに自動認識し、マスク範囲として扱ってください。" : "";
      const locationDesc = `画像の ${Math.round(marker.x)}% (横), ${Math.round(marker.y)}% (縦) の位置にある部分 ${modeDesc} に対して、以下の修正を行ってください：`;
      finalInstruction = `${locationDesc}\n${brushupInstruction}`;
    }
    onGenerateFinal(finalInstruction, editMainCopy, editSubCopy);
  };

  const currentPreviewImage = selectedFinalIndex !== null && finalImages[selectedFinalIndex]
    ? finalImages[selectedFinalIndex].url
    : (finalImages.length > 0 ? finalImages[0].url : (selectedDraftIndex !== null ? draftImages[selectedDraftIndex] : null));

  const prevLengthRef = useRef(finalImages.length);
  useEffect(() => {
    if (finalImages.length > prevLengthRef.current) {
      setSelectedFinalIndex(0); // 新しい画像が生成されたら自動的に最新版を表示
    }
    prevLengthRef.current = finalImages.length;

    if (finalImages.length > 0 && selectedFinalIndex === null) {
      setSelectedFinalIndex(0);
    }
  }, [finalImages, selectedFinalIndex]);

  if (status === AppStatus.IDLE) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800 p-8">
      <TrendingUp className="w-16 h-16 text-indigo-500/20 mb-4" />
      <p className="text-lg font-black text-slate-400 uppercase tracking-tighter italic text-center">Architecting High-CTR Assets</p>
      <p className="text-xs mt-2 text-slate-600 text-center">市場分析と戦略立案を開始してください</p>
    </div>
  );

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 shadow-2xl h-full flex flex-col overflow-hidden backdrop-blur-xl">
      <div className="border-b border-slate-800 p-4 bg-slate-950/40 flex justify-between items-center z-10">
        <h2 className="font-black text-white flex items-center uppercase tracking-widest text-xs"><Zap className="w-4 h-4 mr-2 text-yellow-500" /> Production Workspace</h2>
        <div className="flex gap-4">
          <button onClick={() => setShowSimulator(!showSimulator)} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border flex items-center transition-all ${showSimulator ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <Smartphone className="w-3.5 h-3.5 mr-2" /> {showSimulator ? "Close Mobile Preview" : "Mobile Simulator"}
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Console */}
        <div className={`flex-grow overflow-y-auto p-6 space-y-10 custom-scrollbar transition-all duration-500 ${showSimulator ? 'w-2/3 opacity-50 pointer-events-none sm:opacity-100 sm:pointer-events-auto' : 'w-full'}`}>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-xl items-start animate-in fade-in flex justify-between">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="text-xs font-medium">{error}</p>
              </div>
              <button
                onClick={onRetry}
                className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center transition-all"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" /> Retry
              </button>
            </div>
          )}

          {/* Strategy Section */}
          {plan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-widest flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-2 text-indigo-500" /> 戦略・競合分析レポート
                </h3>
                <button onClick={() => setIsEditingPlan(!isEditingPlan)} className="text-[10px] text-indigo-400 hover:text-white transition-colors underline decoration-indigo-500/30 font-bold">
                  {isEditingPlan ? "Close Editor" : "Edit Strategy"}
                </button>
              </div>
              {isEditingPlan ? (
                <textarea value={editedPlan} onChange={(e) => { setEditedPlan(e.target.value); onUpdatePlan(e.target.value); }} className="w-full h-48 bg-black/40 border border-slate-700 rounded-xl p-4 text-[11px] text-slate-300 font-mono focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              ) : (
                <div className="relative bg-black/20 border border-slate-800 p-5 rounded-2xl group">
                  <Quote className="absolute -top-3 -left-3 w-8 h-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" />
                  <div className="whitespace-pre-wrap text-[11px] text-slate-300 leading-relaxed font-medium">
                    {plan}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drafts Section */}
          {plan && (
            <div className="space-y-6 pt-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white flex items-center text-xs uppercase tracking-widest"><ImageIcon className="w-4 h-4 mr-2 text-pink-500" /> 1. ラフ案デザイン</h3>
              </div>
              {draftImages.length === 0 && status !== AppStatus.RENDERING && (
                <button onClick={() => onGenerateDrafts()} className="w-full py-12 bg-indigo-600/5 border border-indigo-500/10 border-dashed rounded-3xl text-indigo-400 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all font-black text-xs flex flex-col items-center group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Sparkles className="w-8 h-8 mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                  プロトタイプを生成（3パターン）
                </button>
              )}
              {status === AppStatus.RENDERING && (
                <div className="py-16 px-12 text-center flex flex-col items-center bg-black/20 rounded-3xl border border-slate-800 space-y-6">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-500 animate-pulse" />
                  </div>
                  <ProgressBar progress={progress} label="Rendering Design Patterns..." />
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Generative engine synthesizing variations</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {draftImages.map((img, idx) => (
                  <div key={idx} onClick={() => onSelectDraft(idx)} className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-500 ${selectedDraftIndex === idx ? 'border-indigo-500 scale-[1.02] shadow-[0_0_30px_rgba(79,70,229,0.4)]' : 'border-slate-800 opacity-60 hover:opacity-100 hover:scale-[1.01]'}`}>
                    <img src={img} alt="Draft" className="w-full h-auto" />
                    <div className={`absolute inset-0 bg-indigo-600/10 transition-opacity ${selectedDraftIndex === idx ? 'opacity-100' : 'opacity-0'}`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Deliverables / Brush-up Area */}
          {currentPreviewImage && status !== AppStatus.RENDERING && (
            <div className="space-y-8 pt-8 border-t border-slate-800 animate-in slide-in-from-bottom-8">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-white flex items-center text-xs uppercase tracking-widest">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" /> {finalImages.length > 0 ? "Final Assets & Iteration" : "Draft Refinement"}
                </h3>
              </div>

              {/* Main Preview with Visual Annotation */}
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
                <div
                  className="relative cursor-crosshair w-full"
                  onClick={handleImageClick}
                >
                  <img
                    ref={imageRef}
                    src={currentPreviewImage}
                    className="w-full h-auto select-none"
                    alt="Current Work"
                  />

                  {/* Visual Marker (Pin) & Mask */}
                  {marker && (
                    <>
                      {/* Detection / Mask Area Effect */}
                      <div
                        className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 border-pink-500/50 rounded-full animate-[pulse_2s_infinite] shadow-[0_0_50px_rgba(236,72,153,0.3)] ${isAutoSelect ? 'bg-indigo-500/20 border-indigo-400' : 'bg-pink-500/10'}`}
                        style={{ left: `${marker.x}%`, top: `${marker.y}%`, width: `${selectionRadius}%`, height: `${selectionRadius * (inputs.aspectRatio === '16:9' ? 1.77 : 0.56)}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          {isAutoSelect && <Sparkles className="w-6 h-6 text-indigo-400" />}
                        </div>
                      </div>
                      <div
                        className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 animate-bounce pointer-events-none z-10"
                        style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                      >
                        <MapPin className={`w-8 h-8 ${isAutoSelect ? 'text-indigo-400' : 'text-pink-500'} fill-current drop-shadow-[0_0_15px_rgba(236,72,153,1)]`} />
                      </div>
                    </>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                      <Edit3 className="w-3 h-3 mr-2" /> Click anywhere to pinpoint edits
                    </div>
                  </div>

                  {/* Download Action Overlay (Visible on Hover if Final) */}
                  {finalImages.length > 0 && selectedFinalIndex !== null && (
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto">
                      <a
                        href={currentPreviewImage!}
                        download={`thumbnail-v${finalImages.length - selectedFinalIndex}.png`}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-2xl font-black text-xs shadow-2xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4" /> DOWNLOAD FINAL
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className="font-black text-white text-[11px] uppercase tracking-widest flex items-center">
                      <PenTool className="w-4 h-4 mr-2 text-indigo-400" />
                      {marker ? "Targeted Refinement" : "General Refinement"}
                    </h4>
                    {marker && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-pink-400 font-bold uppercase">
                          Radius: {selectionRadius}%
                        </span>
                        <input
                          type="range" min="5" max="40" value={selectionRadius}
                          onChange={(e) => setSelectionRadius(parseInt(e.target.value))}
                          className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAutoSelect(!isAutoSelect)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all flex items-center ${isAutoSelect ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-2" /> {isAutoSelect ? "Smart Select ON" : "AI AutoSelect"}
                    </button>
                    {marker && (
                      <button onClick={() => setMarker(null)} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center">
                        <X className="w-3 h-3 mr-1" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject Refinement Controls */}
                <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <User className="w-3.5 h-3.5 mr-2 text-indigo-400" /> 被写体の再調整
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold text-slate-500 uppercase">改変禁止</span>
                      <input
                        type="checkbox"
                        checked={inputs.strictIdentity}
                        readOnly
                        className="w-3 h-3 rounded border-slate-700 bg-slate-900 text-indigo-600 opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-grow grid grid-cols-3 gap-1">
                      {(['full', 'bust', 'face'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            // Temporary refinement override logic could go here
                            setBrushupInstruction(prev => prev + `\n【被写体調整】${type === 'full' ? '全身' : type === 'bust' ? 'バストアップ' : 'ドアップ'}に変更してください。`);
                          }}
                          className={`py-1.5 rounded text-[9px] font-bold border transition-all ${inputs.subjectType === type ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        >
                          {type === 'full' ? '全身' : type === 'bust' ? '上半身' : 'アップ'}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setBrushupInstruction(prev => prev + `\n【位置調整】被写体をさらに上（頭側）へ移動させて、顔周りを目立たせてください。`)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[8px] font-black text-slate-400 hover:text-white"
                      >
                        位置を上げる(UP)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleQuickRefine('text-big')} className="px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black text-slate-300 hover:bg-indigo-600 hover:border-indigo-400 hover:text-white transition-all flex items-center">
                    <Type className="w-3.5 h-3.5 mr-2" /> 文字を大きく
                  </button>
                  <button onClick={() => handleQuickRefine('face-focus')} className="px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black text-slate-300 hover:bg-indigo-600 hover:border-indigo-400 hover:text-white transition-all flex items-center">
                    <User className="w-3.5 h-3.5 mr-2" /> 顔を強調（ドアップ）
                  </button>
                  <button onClick={() => handleQuickRefine('impact')} className="px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-[10px] font-black text-slate-300 hover:bg-indigo-600 hover:border-indigo-400 hover:text-white transition-all flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-2" /> 全体のインパクトUP
                  </button>
                </div>

                <textarea
                  value={brushupInstruction}
                  onChange={(e) => setBrushupInstruction(e.target.value)}
                  placeholder={marker ? "この選択範囲をどう修正したいですか？" : "全体的な修正指示を入力..."}
                  className="w-full bg-black/60 border border-slate-800 rounded-2xl p-5 text-sm text-white h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase ml-1">Title Update</span>
                    <input type="text" value={editMainCopy} onChange={(e) => setEditMainCopy(e.target.value)} className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase ml-1">Sub Copy Update</span>
                    <input type="text" value={editSubCopy} onChange={(e) => setEditSubCopy(e.target.value)} className="w-full bg-black/40 border border-slate-700 rounded-xl p-3 text-xs text-white" />
                  </div>
                </div>

                <button
                  onClick={handleGenerateFinalWithMarker}
                  disabled={status === AppStatus.POLISHING}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-sm rounded-2xl shadow-2xl hover:shadow-indigo-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all relative z-10 uppercase tracking-widest flex items-center justify-center disabled:opacity-50"
                >
                  {status === AppStatus.POLISHING ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                  {finalImages.length > 0 ? "実行して上書き保存" : "最高品質でレンダリング"}
                </button>
              </div>

              {/* Version History List */}
              {finalImages.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center">
                    <History className="w-3.5 h-3.5 mr-2" /> Generation History
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {finalImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedFinalIndex(idx)}
                        className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedFinalIndex === idx ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                          <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate">v{finalImages.length - idx} • {img.sourcePattern}</span>
                          <span className="text-[6px] text-slate-400 font-bold">{img.timestamp.split(' ')[1]}</span>
                        </div>
                        {idx === 0 && <div className="absolute top-1 right-1 bg-indigo-600 text-[6px] font-black px-1 rounded uppercase">Latest</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Polishing State Animation */}
          {status === AppStatus.POLISHING && (
            <div className="py-16 px-12 flex flex-col items-center bg-slate-950/60 rounded-[2.5rem] border border-slate-800 border-dashed space-y-8 animate-in zoom-in-95">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
              </div>
              <ProgressBar progress={progress} label="Polishing Visual Excellence..." />
              <div className="flex flex-col items-center space-y-1">
                <p className="text-[11px] text-slate-200 font-black uppercase tracking-[0.1em]">Finalizing AI Masterpiece</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.3em]">correcting Japanese artifacts & lighting</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Simulator Panel */}
        {showSimulator && (
          <div className="w-full sm:w-1/3 border-l border-slate-800 bg-slate-950/80 p-8 flex flex-col items-center animate-in slide-in-from-right-10 duration-700 overflow-y-auto custom-scrollbar sticky top-0 h-full backdrop-blur-2xl z-20">
            <div className="flex items-center justify-between w-full mb-8">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-indigo-500" /> Mobile Simulator
              </h3>
              <button onClick={() => setShowSimulator(false)} className="sm:hidden text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="w-[280px] bg-[#0f0f0f] rounded-[3rem] border-[10px] border-[#1a1a1a] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-4 aspect-[9/19.5] relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1a1a1a] rounded-b-3xl z-30"></div>
              <div className="mt-8 space-y-6">
                <div className="flex justify-between px-2 items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center"><Zap className="w-3 h-3 text-white fill-white" /></div>
                    <span className="text-white font-black text-[14px] tracking-tighter">YouTube</span>
                  </div>
                  <div className="flex gap-4">
                    <Search className="w-4 h-4 text-white" />
                    <div className="w-5 h-5 rounded-full bg-slate-700"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
                    {currentPreviewImage && <img src={currentPreviewImage} className="w-full h-full object-cover" />}
                    <div className="absolute bottom-2 right-2 bg-black/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center shadow-lg border border-white/10 z-10">12:45</div>
                  </div>
                  <div className="flex gap-3 px-1">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0"></div>
                    <div className="flex-grow space-y-1">
                      <div className="min-h-[2.5rem] leading-tight">
                        <span className="text-[13px] text-white font-bold block line-clamp-2">{editMainCopy || "Title Here"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span>Creator</span> • <span>1.5M views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;