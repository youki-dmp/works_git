import React, { useState, useEffect, useRef } from 'react';
import { ThumbnailInputs, AppStatus, AppStatusType, FinalImageEntry } from '../types';
import { FileText, Sparkles, Image as ImageIcon, AlertCircle, Loader2, Star, CheckCircle, RefreshCw, PenTool, Type, Download, Edit3, History, Wand2, Calendar, Zap, Palette, TrendingUp, Quote, MessageSquare, Smartphone, Eye, Clock, User, MoreVertical, Search, ShieldCheck, X, Target, MapPin, RotateCcw, FolderArchive, Layers, Play } from 'lucide-react';
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
  initialSubCopy2: string;
  onGenerateDrafts: (instruction?: string) => void;
  onSelectDraft: (index: number) => void;
  onGenerateFinal: (instruction: string, mainCopy: string, subCopy: string, subCopy2: string, historyIndex?: number | null) => void;
  onUpdatePlan: (plan: string) => void;
  progress: number;
  onRetry: () => void;
  inputs: ThumbnailInputs;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  plan, draftImages, selectedDraftIndex, finalImages, status, error,
  initialCopy, initialSubCopy, initialSubCopy2, onGenerateDrafts, onSelectDraft, onGenerateFinal, onUpdatePlan,
  progress, onRetry, inputs
}) => {
  const [brushupInstruction, setBrushupInstruction] = useState("");
  const [editMainCopy, setEditMainCopy] = useState(initialCopy);
  const [editSubCopy, setEditSubCopy] = useState(initialSubCopy);
  const [editSubCopy2, setEditSubCopy2] = useState(initialSubCopy2);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedPlan, setEditedPlan] = useState("");
  const [critique, setCritique] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [selectedFinalIndex, setSelectedFinalIndex] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

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

      const layers = await import('../services/geminiService').then(m =>
        m.generateLayeredAssets(targetEntry.plan, targetEntry.url, inputs)
      );

      setExportProgress(40);

      const washAndAdd = async (name: string, data: string | undefined) => {
        if (!data) return;
        const washed = await washImageThroughCanvas(data);
        zip.file(name, washed.split(',')[1], { base64: true });
      };

      await washAndAdd("01_final_render.png", targetEntry.url);
      setExportProgress(50);
      await washAndAdd("02_background_layer.png", layers.background);
      setExportProgress(60);
      await washAndAdd("03_subject_layer.png", layers.subject);
      setExportProgress(70);
      await washAndAdd("04_text_layer.png", layers.text);
      setExportProgress(80);
      await washAndAdd("05_effects_layer.png", layers.effects);
      setExportProgress(90);

      zip.file("strategy_plan.txt", targetEntry.plan);

      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thumbnail-v${finalImages.length - selectedIndex}_layers.zip`;
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

  const downloadImageBuffer = async (dataUrl: string, filename: string) => {
    try {
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
      console.error("ダウンロードエラー:", err);
    }
  };

  const [marker, setMarker] = useState<Marker | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleQuickRefine = (action: string) => {
    let instruction = "";
    if (action === 'text-big') instruction = "メインコピーの文字をもっと大きくして、視認性を最大化してください。";
    if (action === 'face-focus') instruction = "被写体の顔に寄せて、より表情が感情的に伝わるようにズームしてください。";
    if (action === 'impact') instruction = "全体的なインパクトを高めるために、ライティングとコントラストを強化してください。";

    onGenerateFinal(instruction, editMainCopy, editSubCopy, editSubCopy2, selectedFinalIndex);
  };

  useEffect(() => { if (plan) setEditedPlan(plan); }, [plan]);
  useEffect(() => { setEditMainCopy(initialCopy); setEditSubCopy(initialSubCopy); setEditSubCopy2(initialSubCopy2); }, [initialCopy, initialSubCopy, initialSubCopy2]);

  const handleCritique = async () => {
    if (selectedDraftIndex === null || !draftImages[selectedDraftIndex]) return;
    setIsCritiquing(true);
    setCritique(null);
    try {
      const result = await critiqueDraft(plan, draftImages[selectedDraftIndex], inputs);
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
      const locationDesc = `画像の ${Math.round(marker.x)}% (横), ${Math.round(marker.y)}% (縦) の位置にある部分に対して、以下の修正を行ってください：`;
      finalInstruction = `${locationDesc}\n${brushupInstruction}`;
    }
    onGenerateFinal(finalInstruction, editMainCopy, editSubCopy, editSubCopy2, selectedFinalIndex);
  };

  const currentPreviewImage = (selectedFinalIndex !== null && finalImages[selectedFinalIndex])
    ? finalImages[selectedFinalIndex].url
    : (finalImages.length > 0 ? finalImages[0].url : (selectedDraftIndex !== null ? draftImages[selectedDraftIndex] : null));

  const parseCritiquePoints = (text: string | null) => {
    if (!text) return [];
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
    const textarea = document.querySelector('textarea');
    textarea?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const prevLengthRef = useRef(finalImages.length);
  useEffect(() => {
    if (finalImages.length > prevLengthRef.current) {
      setSelectedFinalIndex(0);
    }
    prevLengthRef.current = finalImages.length;

    if (finalImages.length > 0 && selectedFinalIndex === null) {
      setSelectedFinalIndex(0);
    }
  }, [finalImages, selectedFinalIndex]);

  const critiquePoints = parseCritiquePoints(critique);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col overflow-hidden relative text-slate-900">
      {/* Header Bar */}
      <div className="border-b border-slate-100 p-5 bg-white/80 backdrop-blur-md flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">ワークスペース＆プレビュー</h2>
            <p className="text-[11px] text-slate-400 font-medium">リアルタイム構図テスト＆YouTube実機検証</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSafeZone(!showSafeZone)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${showSafeZone ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Clock className="w-3.5 h-3.5 inline mr-1.5" /> セーフゾーン 1:23 {showSafeZone ? "ON" : "OFF"}
          </button>
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${showSimulator ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
          >
            <Smartphone className="w-3.5 h-3.5 inline mr-1.5" /> YouTube実機ビュー
          </button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Console Area */}
        <div className={`flex-grow overflow-y-auto p-7 space-y-8 custom-scrollbar transition-all duration-300 ${showSimulator ? 'w-2/3' : 'w-full'}`}>
          {/* Strategy Plan Section */}
          {plan && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" /> AI サムネイル戦略・構図解析
                </h3>
                <button onClick={() => setIsEditingPlan(!isEditingPlan)} className="text-xs text-indigo-600 hover:underline font-semibold">
                  {isEditingPlan ? "編集完了" : "戦略プランを直接修正"}
                </button>
              </div>

              {isEditingPlan ? (
                <textarea
                  value={editedPlan}
                  onChange={(e) => { setEditedPlan(e.target.value); onUpdatePlan(e.target.value); }}
                  className="w-full h-44 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none font-medium shadow-inner"
                />
              ) : (
                <div className="relative bg-slate-50/70 border border-slate-200/80 p-6 rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                  <div className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-medium">
                    {plan}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Draft Variations Section */}
          {plan && (
            <div className="space-y-5 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center text-sm tracking-tight">
                  <ImageIcon className="w-4 h-4 mr-2 text-indigo-600" /> 1. ラフ案デザイン (3パターン同時生成)
                </h3>
              </div>

              {draftImages.length === 0 && status !== AppStatus.RENDERING && (
                <button
                  onClick={() => onGenerateDrafts()}
                  className="w-full py-12 bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl text-slate-500 hover:bg-indigo-50/40 hover:border-indigo-300 hover:text-indigo-600 transition-all font-bold text-xs flex flex-col items-center gap-3 group"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  Gemini 3.6 でラフ案 3 パターンを一元生成する
                </button>
              )}

              {status === AppStatus.RENDERING && (
                <div className="py-12 px-8 text-center flex flex-col items-center bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <ProgressBar progress={progress} label="デザイン案を生成中..." />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {draftImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectDraft(idx)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 ${selectedDraftIndex === idx ? 'border-indigo-600 shadow-md ring-4 ring-indigo-100 scale-[1.01]' : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'}`}
                  >
                    <img src={img} alt="Draft" className="w-full h-auto" />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      案 {idx + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Critique Feedback */}
              {selectedDraftIndex !== null && (
                <div className="pt-2">
                  {!critique && !isCritiquing ? (
                    <button
                      onClick={handleCritique}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      プロ視点でこのラフ案を添削（AI Critique）
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-indigo-600" /> AI 添削アドバイス
                        </h4>
                        {isCritiquing && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />}
                      </div>

                      {isCritiquing ? (
                        <p className="text-xs text-slate-500 font-medium">添削ポイントを抽出しています...</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {critiquePoints.map((point, i) => (
                            <button
                              key={i}
                              onClick={() => applyCritiqueSuggestion(point)}
                              className="bg-white border border-slate-200 p-4 rounded-xl text-left hover:border-indigo-500 hover:shadow-sm transition-all text-xs font-medium text-slate-800"
                            >
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Final Render and Refinement Section */}
          {currentPreviewImage && status !== AppStatus.RENDERING && (
            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center text-sm tracking-tight">
                  <Star className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" /> 2. プレビュー＆最終ポリッシュ
                </h3>
              </div>

              {/* Main Image Container */}
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
                <div className="relative cursor-crosshair w-full" onClick={handleImageClick}>
                  <img
                    ref={imageRef}
                    src={currentPreviewImage}
                    className="w-full h-auto select-none"
                    alt="Current Work"
                  />

                  {/* YouTube 1:23 Duration Badge Overlay (Safe Zone) */}
                  {showSafeZone && (
                    <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wider shadow-lg flex items-center gap-1 border border-white/10 pointer-events-none">
                      <Play className="w-2.5 h-2.5 fill-white text-white" /> 1:23
                    </div>
                  )}

                  {/* Interactive Pin Marker */}
                  {marker && (
                    <div
                      className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    >
                      <MapPin className="w-7 h-7 text-indigo-600 fill-current drop-shadow-[0_2px_8px_rgba(79,70,229,0.8)]" />
                    </div>
                  )}
                </div>

                {/* Download Actions */}
                {finalImages.length > 0 && selectedFinalIndex !== null && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                    <button
                      onClick={() => downloadImageBuffer(currentPreviewImage, `thumbnail-v${finalImages.length - selectedFinalIndex}.png`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-slate-800 transition-all"
                    >
                      <Download className="w-4 h-4" /> サムネイル画像を保存
                    </button>

                    <button
                      onClick={() => selectedFinalIndex !== null && downloadLayersAsZip(selectedFinalIndex)}
                      disabled={isExporting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-800 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderArchive className="w-4 h-4 text-indigo-600" />}
                      <span>{isExporting ? "レイヤー抽出中..." : "透過レイヤー別 Zip 書き出し"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Refinement Inputs */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 space-y-5">
                <h4 className="text-xs font-bold text-slate-800 flex items-center">
                  <Edit3 className="w-4 h-4 mr-1.5 text-indigo-600" /> ピンポイント修正・ブラッシュアップ指示
                </h4>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleQuickRefine('text-big')} className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                    <Type className="w-3.5 h-3.5 inline mr-1" /> 文字を大きく
                  </button>
                  <button onClick={() => handleQuickRefine('face-focus')} className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                    <User className="w-3.5 h-3.5 inline mr-1" /> 被写体をズーム
                  </button>
                  <button onClick={() => handleQuickRefine('impact')} className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> インパクト強調
                  </button>
                </div>

                <textarea
                  value={brushupInstruction}
                  onChange={(e) => setBrushupInstruction(e.target.value)}
                  placeholder={marker ? "クリックされた位置の要素に対して具体的な修正指示を入力..." : "全体への修正指示 (例: 背景を暗くしてテロップを目立たせる)"}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-900 h-28 resize-none outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                />

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editMainCopy}
                    onChange={(e) => setEditMainCopy(e.target.value)}
                    placeholder="メインコピー"
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-bold outline-none"
                  />
                  <input
                    type="text"
                    value={editSubCopy}
                    onChange={(e) => setEditSubCopy(e.target.value)}
                    placeholder="サブコピー1"
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none"
                  />
                  <input
                    type="text"
                    value={editSubCopy2}
                    onChange={(e) => setEditSubCopy2(e.target.value)}
                    placeholder="サブコピー2"
                    className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateFinalWithMarker}
                  disabled={status === AppStatus.POLISHING || (!brushupInstruction && !editMainCopy)}
                  className="w-full py-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {status === AppStatus.POLISHING ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {finalImages.length > 0 ? "修正を反映して再レンダリング" : "最高画質で最終レンダリング"}
                </button>
              </div>

              {/* History Gallery */}
              {finalImages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 flex items-center">
                    <History className="w-3.5 h-3.5 mr-1.5" /> 生成履歴
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {finalImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedFinalIndex(idx)}
                        className={`group relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedFinalIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2">
                          <span className="text-[9px] font-bold text-white">v{finalImages.length - idx}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* YouTube Feed Simulator Panel */}
        {showSimulator && (
          <div className="w-1/3 border-l border-slate-200 bg-slate-50 p-6 flex flex-col items-center overflow-y-auto space-y-6">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-xs font-bold text-slate-700 flex items-center">
                <Smartphone className="w-4 h-4 mr-1.5 text-indigo-600" /> YouTube 表示プレビュー
              </h3>
              <button onClick={() => setShowSimulator(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Feed Card */}
            <div className="w-full bg-white rounded-2xl border border-slate-200 p-3 shadow-sm space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                {currentPreviewImage && <img src={currentPreviewImage} className="w-full h-full object-cover" />}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  1:23
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  AI
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {editMainCopy || "YouTube動画タイトルサンプル"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">チャンネル名 • 1.2万回視聴 • 2時間前</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 max-w-xl w-[90%] font-semibold text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="flex-grow">{error}</p>
          <button onClick={onRetry} className="px-3 py-1.5 bg-white text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors">
            再試行
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;