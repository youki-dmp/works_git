
import React, { useState } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import DocumentationViewer from './components/DocumentationViewer';
import { generateDesignPlan, generateVisualMockups, generateFinalImage } from './services/geminiService';
import { ThumbnailInputs, AppStatus, AppStatusType, FinalImageEntry } from './types';
import { Palette, TrendingUp, Book, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<ThumbnailInputs>({
    mainSubject: '', uploadedImage: null, uploadedLogo: null, background: '', uploadedBackgroundImage: null,
    referenceImages: [], referenceUrls: [], copyText: '', subCopy: '', subCopy2: '', videoDescription: '', aspectRatio: '16:9',
    subjectBorderColor: '#ffffff',
    subjectGlowColor: '#6366f1',
    useTrendSearch: false,
    emotionalTrigger: '衝撃・サプライズ',
    competitorKeyword: '',
    strictIdentity: true,
    subjectScale: 1.0,
    subjectType: 'bust',
    subjectX: 0,
    subjectY: 0,
    generationMode: 'speed',
    preserveRawSubjectLayer: true,
  });

  const [plan, setPlan] = useState<string>('');
  const [draftImages, setDraftImages] = useState<string[]>([]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(null);
  const [finalImages, setFinalImages] = useState<FinalImageEntry[]>([]);
  const [status, setStatus] = useState<AppStatusType>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastAction, setLastAction] = useState<{ type: string; args?: any } | null>(null);

  const simulateProgress = (start: number, end: number, duration: number) => {
    const steps = 20;
    const increment = (end - start) / steps;
    const interval = duration / steps;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setProgress(end);
        clearInterval(timer);
      } else {
        setProgress(current);
      }
    }, interval);
    return timer;
  };

  const handleGeneratePlan = async () => {
    setStatus(AppStatus.PLANNING); setError(null); setPlan(''); setDraftImages([]); setSelectedDraftIndex(null); setFinalImages([]);
    setLastAction({ type: 'PLAN' });
    setProgress(5);
    const progressTimer = simulateProgress(5, 90, 4000);
    try {
      if (!process.env.API_KEY || process.env.API_KEY === 'PLACEHOLDER_API_KEY') {
        throw new Error("API_KEY_MISSING");
      }
      const generatedPlan = await generateDesignPlan(inputs);
      clearInterval(progressTimer);
      setProgress(100);
      setPlan(generatedPlan); setStatus(AppStatus.PLANNED);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      if (err?.message === "API_KEY_MISSING") {
        setError("APIキーが設定されていません。.env.local ファイルを確認してください。");
      } else if (err?.message?.includes("leaked")) {
        setError("APIキーが失効しています。新しいキーを発行してください。");
      } else if (err?.message?.includes("Quota") || err?.message?.includes("429")) {
        setError("リクエスト上限に達しました。しばらく待ってから再試行してください。");
      } else {
        setError("AIプランの策定中にエラーが発生しました。");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateDrafts = async (instruction?: string) => {
    if (!plan) return;
    setStatus(AppStatus.RENDERING); setError(null); setDraftImages([]); setSelectedDraftIndex(null);
    setLastAction({ type: 'DRAFTS', args: instruction });
    setProgress(5);
    const progressTimer = simulateProgress(5, 95, 6000);
    try {
      const images = await generateVisualMockups(plan, inputs, instruction);
      clearInterval(progressTimer);
      setProgress(100);
      setDraftImages(images); setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      setError("ラフ案の生成に失敗しました。再試行してください。");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateFinal = async (instruction: string, mainCopy: string, subCopy: string, subCopy2: string, historyIndex?: number | null) => {
    if (selectedDraftIndex === null || !draftImages[selectedDraftIndex]) return;

    setStatus(AppStatus.POLISHING); setError(null);
    setLastAction({ type: 'FINAL', args: { instruction, mainCopy, subCopy, subCopy2 } });
    setProgress(5);
    const progressTimer = simulateProgress(5, 98, 8000);
    try {
      const baseFinalUrl = typeof historyIndex === 'number' ? finalImages[historyIndex].url : null;

      const polishedImage = await generateFinalImage(
        plan, draftImages[selectedDraftIndex], inputs, instruction, mainCopy, subCopy, subCopy2, baseFinalUrl
      );

      clearInterval(progressTimer);
      setProgress(100);
      const patterns = ["High Contrast", "Emotional", "Premium Clean"];
      const sourcePattern = patterns[selectedDraftIndex] || "Custom";
      const now = new Date();
      const timestamp = now.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setFinalImages(prev => [{
        url: polishedImage,
        timestamp,
        sourcePattern,
        mainCopy,
        subCopy,
        subCopy2,
        plan
      }, ...prev]);
      setStatus(AppStatus.POLISHED);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      setError("最終画像のポリッシュに失敗しました。");
      setStatus(AppStatus.ERROR);
    }
  };

  const [showDocs, setShowDocs] = useState(false);

  const handleRetry = () => {
    if (!lastAction) return;
    switch (lastAction.type) {
      case 'PLAN': handleGeneratePlan(); break;
      case 'DRAFTS': handleGenerateDrafts(lastAction.args); break;
      case 'FINAL': handleGenerateFinal(lastAction.args.instruction, lastAction.args.mainCopy, lastAction.args.subCopy, lastAction.args.subCopy2); break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-4 px-8 sticky top-0 z-30 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-200">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                サムネイル職人 AI Studio
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full font-bold tracking-wider">
                  Gemini 3.5 Flash / 3 Pro
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">レイヤー分離非加工合成・超高速サムネイル最適化</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setShowDocs(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-xs font-semibold text-slate-700"
            >
              <Book className="w-4 h-4 text-slate-500" />
              <span>ドキュメント</span>
            </button>
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.6 稼働中</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow p-6 overflow-hidden bg-slate-50">
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-6.5rem)] grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 h-full overflow-hidden">
            <InputForm inputs={inputs} setInputs={setInputs} onSubmit={handleGeneratePlan} status={status} />
          </div>
          <div className="md:col-span-8 h-full overflow-hidden">
            <ResultDisplay
              plan={plan}
              draftImages={draftImages}
              selectedDraftIndex={selectedDraftIndex}
              finalImages={finalImages}
              status={status}
              error={error}
              progress={progress}
              initialCopy={inputs.copyText}
              initialSubCopy={inputs.subCopy}
              initialSubCopy2={inputs.subCopy2}
              onGenerateDrafts={handleGenerateDrafts}
              onSelectDraft={setSelectedDraftIndex}
              onGenerateFinal={handleGenerateFinal}
              onUpdatePlan={setPlan}
              onRetry={handleRetry}
              inputs={inputs}
            />
          </div>
        </div>
      </main>

      {showDocs && (
        <DocumentationViewer onClose={() => setShowDocs(false)} />
      )}
    </div>
  );
};

export default App;

