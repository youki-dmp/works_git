import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailInputs, AppStatus, AppStatusType, FinalImageEntry } from '../types';
import { FileText, Sparkles, Image as ImageIcon, AlertCircle, Loader2, Star, CheckCircle, RefreshCw, PenTool, Type, Download, Edit3, History, Wand2, Calendar, Zap, Palette, TrendingUp, Quote, MessageSquare, Smartphone, Eye, Clock, User, MoreVertical, Search, ShieldCheck, X, Target, MapPin, RotateCcw, FolderArchive } from 'lucide-react';
import { critiqueDraft } from '../services/geminiService';
import ProgressBar from './ProgressBar';
import JSZip from 'jszip';

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

  // 匠のデリバリー 2.0：AIによる真のレイヤー別Zip書き出し
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // 匠の画像洗浄 (Washing): ブラウザのCanvasを通して再エンコードし、Mac Finderでのプレビューを確実にする
  const washImageThroughCanvas = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error("Image load failed for washing"));
      img.src = dataUrl;
    });
  };

  const downloadLayersAsZip = async (selectedIndex: number) => {
    const targetEntry = finalImages[selectedIndex];
    if (!targetEntry) return;

    setIsExporting(true);
    setExportProgress(10);
    try {
      const zip = new JSZip();

      // AIによるレイヤー抽出を呼び出し
      const layers = await import('../services/geminiService').then(m =>
        m.generateLayeredAssets(targetEntry.plan, targetEntry.url, inputs)
      );

      setExportProgress(40);

      // 各レイヤーをCanvasで「洗浄」してMac Finder対応させる
      const washAndAdd = async (name: string, data: string | undefined) => {
        if (!data) return;
        const washed = await washImageThroughCanvas(data);
        zip.file(name, washed.split(',')[1], { base64: true });
      };

      // 1. 最終レンダリング画像
      await washAndAdd("01_final_render.png", targetEntry.url);
      setExportProgress(50);

      // 2. 背景レイヤー (AI抽出)
      await washAndAdd("02_background_layer.png", layers.background);
      setExportProgress(60);

      // 3. 被写体レイヤー (AI抽出)
      await washAndAdd("03_subject_layer.png", layers.subject);
      setExportProgress(70);

      // 4. 文字レイヤー (AI抽出)
      await washAndAdd("04_text_layer.png", layers.text);
      setExportProgress(80);

      // 5. エフェクトレイヤー (AI抽出)
      await washAndAdd("05_effects_layer.png", layers.effects);
      setExportProgress(90);

      // 6. 戦略プラン
      zip.file("strategy_plan.txt", targetEntry.plan);

      // Zip生成とダウンロード (DEFLATE圧縮で整合性を向上)
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumbnail-v${finalImages.length - selectedIndex}_layers_匠.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Zip抽出中にエラーが発生しました:", err);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // 匠のダウンロード・バッファ処理 (Mac Finder プレビュー対応)
  const downloadImageBuffer = async (dataUrl: string, filename: string) => {
    try {
      // ダウンロード前にCanvasで再エンコード
      const washedDataUrl = await washImageThroughCanvas(dataUrl);

      const parts = washedDataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("ダウンロード中にエラーが発生しました:", err);
    }
  };

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

  const currentPreviewImage = (selectedFinalIndex !== null && finalImages[selectedFinalIndex])
    ? finalImages[selectedFinalIndex].url
    : (finalImages.length > 0 ? finalImages[0].url : (selectedDraftIndex !== null ? draftImages[selectedDraftIndex] : null));

  // 匠のインサイト・ダイレクト・アクション：添削結果を解析してボタン化
  const parseCritiquePoints = (text: string | null) => {
    if (!text) return [];
    // 箇条書きや番号付きリストを抽出（1. XXX, - XXX, ・XXX など）
    const lines = text.split('\n');
    return lines
      .map(line => line.trim())
      .filter(line => /^(\d+\.|[-・*])\s+/.test(line))
      .map(line => line.replace(/^(\d+\.|[-・*])\s+/, ''));
  };

  const applyCritiqueSuggestion = (suggestion: string) => {
    setBrushupInstruction(prev => {
      const separator = prev ? "\n" : "";
      return `${prev}${separator}【添削反映】${suggestion}`;
    });
    // スムーズな遷移のため、textareaへスクロール
    const textarea = document.querySelector('textarea');
    textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const critiquePoints = parseCritiquePoints(critique);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.05)] h-full flex flex-col overflow-hidden">
      <div className="border-b border-slate-50 p-6 bg-white flex justify-between items-center z-10">
        <h2 className="font-semibold text-slate-800 flex items-center tracking-tight text-sm"><Zap className="w-4 h-4 mr-3 text-slate-900" />制作ワークスペース</h2>
        <div className="flex gap-4">
          <button onClick={() => setShowSimulator(!showSimulator)} className={`text-xs font-semibold px-5 py-2.5 rounded-2xl border transition-all ${showSimulator ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
            <Smartphone className="w-4 h-4 mr-2" /> {showSimulator ? "プレビューを閉じる" : "モバイル実機シミュレーター"}
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-slate-900" /> 戦略・競合分析レポート
                </h3>
                <button onClick={() => setIsEditingPlan(!isEditingPlan)} className="text-xs text-slate-400 hover:text-slate-900 transition-colors font-medium">
                  {isEditingPlan ? "編集を終了" : "戦略を編集"}
                </button>
              </div>
              {isEditingPlan ? (
                <textarea value={editedPlan} onChange={(e) => { setEditedPlan(e.target.value); onUpdatePlan(e.target.value); }} className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm text-slate-700 focus:ring-1 focus:ring-slate-900 outline-none resize-none shadow-inner" />
              ) : (
                <div className="relative bg-white border border-slate-100 p-10 rounded-[2.5rem] group shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-slate-900"></div>
                  <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-semibold">
                    {plan}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drafts Section */}
          {plan && (
            <div className="space-y-8 pt-8 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center text-sm tracking-tight"><ImageIcon className="w-5 h-5 mr-3 text-slate-900" /> 1. ラフ案デザイン</h3>
              </div>
              {draftImages.length === 0 && status !== AppStatus.RENDERING && (
                <button onClick={() => onGenerateDrafts()} className="w-full py-16 bg-slate-50 border-2 border-slate-100 border-dashed rounded-[2rem] text-slate-400 hover:bg-slate-100 transition-all font-semibold text-sm flex flex-col items-center group relative overflow-hidden">
                  <Sparkles className="w-10 h-10 mb-5 text-slate-300 group-hover:scale-110 transition-transform" />
                  デザインプロトタイプを生成（3パターン）
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

              {/* AI Critique Section */}
              {selectedDraftIndex !== null && (
                <div className="pt-6">
                  {!critique && !isCritiquing ? (
                    <button
                      onClick={handleCritique}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm group"
                    >
                      <Search className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      プロ視点でこの案を添削（AI Critique）
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-indigo-500" /> AI Insights & Critique
                        </h4>
                        {isCritiquing && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                      </div>

                      {isCritiquing ? (
                        <div className="flex items-center gap-4 py-4">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                          </div>
                          <p className="text-xs font-semibold text-slate-500">匠の視点で微調整ポイントを抽出中...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {critiquePoints.map((point, i) => (
                            <button
                              key={i}
                              onClick={() => applyCritiqueSuggestion(point)}
                              className="group relative bg-white border border-slate-100 p-5 rounded-2xl text-left hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all active:scale-[0.98]"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-xs font-bold text-slate-700 leading-relaxed group-hover:text-indigo-900">{point}</p>
                              </div>
                              <div className="mt-3 flex items-center justify-end">
                                <span className="text-[8px] font-black text-slate-300 group-hover:text-indigo-500 uppercase tracking-widest">修正指示に反映</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {!isCritiquing && (
                        <button onClick={handleCritique} className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                          <RefreshCw className="w-3 h-3" /> 再添削
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Final Deliverables / Brush-up Area */}
          {currentPreviewImage && status !== AppStatus.RENDERING && (
            <div className="space-y-10 pt-10 border-t border-slate-50 animate-in slide-in-from-bottom-8">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 flex items-center text-sm tracking-tight">
                  <Star className="w-5 h-5 mr-3 text-slate-900" /> 最終出力とブラッシュアップ
                </h3>
              </div>

              {/* Main Preview */}
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
                <div className="relative cursor-crosshair w-full" onClick={handleImageClick}>
                  <img
                    ref={imageRef}
                    src={currentPreviewImage}
                    className="w-full h-auto select-none"
                    alt="Current Work"
                  />
                  {marker && (
                    <>
                      <div
                        className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 rounded-full animate-[pulse_2s_infinite] ${isAutoSelect ? 'bg-indigo-500/20 border-indigo-400' : 'bg-pink-500/10 border-pink-500/50'}`}
                        style={{ left: `${marker.x}%`, top: `${marker.y}%`, width: `${selectionRadius}%`, height: `${selectionRadius * (inputs.aspectRatio === '16:9' ? 1.77 : 0.56)}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                          {isAutoSelect && <Sparkles className="w-6 h-6 text-indigo-400" />}
                        </div>
                      </div>
                      <div className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 animate-bounce pointer-events-none z-10" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
                        <MapPin className={`w-8 h-8 ${isAutoSelect ? 'text-indigo-400' : 'text-pink-500'} fill-current drop-shadow-[0_0_15px_rgba(236,72,153,1)]`} />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center">
                      <Edit3 className="w-3 h-3 mr-2" /> Click to pinpoint edits
                    </div>
                  </div>
                </div>

                {/* Download Buttons (below image) */}
                {finalImages.length > 0 && selectedFinalIndex !== null && (
                  <div className="p-6 bg-white border-t border-slate-50 space-y-4">
                    <button
                      onClick={() => downloadImageBuffer(currentPreviewImage, `thumbnail-v${finalImages.length - selectedFinalIndex}.png`)}
                      className="w-full flex items-center justify-center gap-4 py-5 bg-slate-900 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-slate-200 hover:scale-[1.01] active:scale-[0.98] transition-all"
                    >
                      <Download className="w-5 h-5" /> 画像をダウンロード (Mac対応)
                    </button>

                    <button
                      onClick={() => selectedFinalIndex !== null && downloadLayersAsZip(selectedFinalIndex)}
                      disabled={isExporting}
                      className="w-full flex flex-col items-center justify-center gap-2 py-5 bg-white text-slate-900 rounded-2xl font-semibold text-sm border-2 border-slate-900 hover:bg-slate-50 hover:scale-[1.01] active:scale-[0.98] transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderArchive className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span>{isExporting ? "AIがレイヤーを精密抽出中..." : "匠の透明納品 2.0 (透過レイヤー一括書出)"}</span>
                      </div>
                      {isExporting && (
                        <div className="w-2/3 mt-2">
                          <ProgressBar progress={exportProgress} label="" />
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Refinement Options */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Identity Boost */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2" /> 同一性の完全維持
                    </label>
                    <button
                      onClick={() => {
                        const boostMsg = "【同一性維持モード】被写体の顔・髪型・服装の特徴を一切変更せず、完全に固定した状態で高品質レンダリングしてください。";
                        setBrushupInstruction(prev => prev.includes(boostMsg) ? prev : prev + "\n" + boostMsg);
                      }}
                      className="w-full py-4 bg-slate-50 rounded-2xl text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-100"
                    >
                      <Zap className="w-5 h-5" /> 同一性ブースト起動
                    </button>
                  </div>

                  {/* Quick Position */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center">
                      <Target className="w-4 h-4 mr-2 text-slate-900" /> 立ち位置の調整
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '左端', msg: "被写体を左端に配置してください。" },
                        { label: '中央', msg: "被写体を中央に配置してください。" },
                        { label: '右端', msg: "被写体を右端に配置してください。" }
                      ].map((pos, i) => (
                        <button key={i} onClick={() => setBrushupInstruction(prev => prev + "\n" + pos.msg)} className="py-4 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100">
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Quick Refines */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button onClick={() => handleQuickRefine('text-big')} className="px-5 py-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all flex items-center shadow-sm">
                    <Type className="w-4 h-4 mr-2" /> 文字を大きく
                  </button>
                  <button onClick={() => handleQuickRefine('face-focus')} className="px-5 py-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all flex items-center shadow-sm">
                    <User className="w-4 h-4 mr-2" /> 表情を強調（ズーム）
                  </button>
                  <button onClick={() => handleQuickRefine('impact')} className="px-5 py-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all flex items-center shadow-sm">
                    <Zap className="w-4 h-4 mr-2" /> インパクトを強化
                  </button>
                </div>

                <textarea
                  value={brushupInstruction}
                  onChange={(e) => setBrushupInstruction(e.target.value)}
                  placeholder={marker ? "この選択範囲に対して、どのような修正を加えたいですか？" : "画像全体への具体的な修正指示を入力してください..."}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm text-slate-900 h-36 resize-none outline-none focus:ring-1 focus:ring-slate-900 transition-all font-medium shadow-inner"
                />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-1">メインコピー</span>
                    <input type="text" value={editMainCopy} onChange={(e) => setEditMainCopy(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-900 shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-1">サブコピー</span>
                    <input type="text" value={editSubCopy} onChange={(e) => setEditSubCopy(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-900 shadow-inner" />
                  </div>
                </div>

                <button
                  onClick={handleGenerateFinalWithMarker}
                  disabled={status === AppStatus.POLISHING}
                  className="w-full py-6 bg-slate-900 text-white font-semibold text-base rounded-[2rem] shadow-2xl shadow-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-30"
                >
                  {status === AppStatus.POLISHING ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Wand2 className="w-6 h-6 mr-3" />}
                  {finalImages.length > 0 ? "修正を実行して保存" : "最高画質でレンダリングを開始"}
                </button>
              </div>

              {/* History */}
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
                          <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate">v{finalImages.length - idx}</span>
                          <span className="text-[6px] text-slate-400 font-bold">{img.timestamp.split(' ')[1]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Polishing State Animation */}
        {status === AppStatus.POLISHING && (
          <div className="py-16 px-12 flex flex-col items-center bg-slate-950/60 rounded-[2.5rem] border border-slate-800 border-dashed space-y-8 animate-in zoom-in-95">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
            <ProgressBar progress={progress} label="Polishing Visual Excellence..." />
          </div>
        )}
      </div>

      {/* Simulator */}
      {showSimulator && (
        <div className="w-full sm:w-1/3 border-l border-slate-800 bg-slate-950/80 p-8 flex flex-col items-center overflow-y-auto">
          <div className="flex items-center justify-between w-full mb-8">
            <h3 className="text-[10px] text-slate-500 flex items-center uppercase tracking-widest font-black">
              <Smartphone className="w-4 h-4 mr-2" /> Mobile Simulator
            </h3>
            <button onClick={() => setShowSimulator(false)} className="sm:hidden"><X className="w-5 h-5 text-slate-500" /></button>
          </div>
          <div className="w-[280px] bg-[#0f0f0f] rounded-[3rem] border-[10px] border-[#1a1a1a] shadow-2xl p-4 aspect-[9/19.5] relative overflow-hidden">
            <div className="mt-8 space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900">
                {currentPreviewImage && <img src={currentPreviewImage} className="w-full h-full object-cover" />}
              </div>
              <div className="px-1">
                <span className="text-[13px] text-white font-bold block line-clamp-2">{editMainCopy || "Title Here"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;