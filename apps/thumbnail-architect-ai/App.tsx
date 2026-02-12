
import React, { useState } from 'react';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import DocumentationViewer from './components/DocumentationViewer';
import { generateDesignPlan, generateVisualMockups, generateFinalImage } from './services/geminiService';
import { ThumbnailInputs, AppStatus, AppStatusType, FinalImageEntry } from './types';
import { Palette, TrendingUp, Book } from 'lucide-react';

const App: React.FC = () => {
  // Added missing emotionalTrigger and competitorKeyword to the initial state to comply with ThumbnailInputs interface.
  const [inputs, setInputs] = useState<ThumbnailInputs>({
    mainSubject: '', uploadedImage: null, uploadedLogo: null, background: '', uploadedBackgroundImage: null,
    referenceImages: [], referenceUrls: [], copyText: '', subCopy: '', videoDescription: '', aspectRatio: '16:9',
    subjectBorderColor: '#ffffff',
    subjectGlowColor: '#6366f1',
    useTrendSearch: false,
    emotionalTrigger: 'Excitement',
    competitorKeyword: '',
    strictIdentity: true,
    subjectScale: 1.0,
    subjectType: 'bust',
    subjectX: 0,
    subjectY: 0
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
    const progressTimer = simulateProgress(5, 90, 8000);
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
      if (err?.message === "API_KEY_MISSING" || err?.message?.includes("API key")) {
        setError("APIキーが設定されていません。.env.local ファイルを確認してください。");
      } else if (err?.message?.includes("Requested entity was not found")) {
        setError("モデルが見つかりません。config.ts のモデル名設定を確認してください。");
      } else if (err?.message?.includes("Safety")) {
        setError("コンテンツポリシーに抵触した可能性があるため、生成を中止しました。入力を変更して試してください。");
      } else if (err?.message?.includes("Quota") || err?.message?.includes("429")) {
        setError("リクエスト制限に達しました。しばらく待ってからリトライしてください。");
      } else {
        setError("プラン生成中に予期せぬエラーが発生しました。");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateDrafts = async (instruction?: string) => {
    if (!plan) return;
    setStatus(AppStatus.RENDERING); setError(null); setDraftImages([]); setSelectedDraftIndex(null);
    setLastAction({ type: 'DRAFTS', args: instruction });
    setProgress(5);
    const progressTimer = simulateProgress(5, 95, 12000);
    try {
      const images = await generateVisualMockups(plan, inputs, instruction);
      clearInterval(progressTimer);
      setProgress(100);
      setDraftImages(images); setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      if (err?.message?.includes("Safety")) {
        setError("安全性の制限により、画像の生成がスキップされました。");
      } else if (err?.message?.includes("Requested entity was not found") || err?.message?.includes("API key")) {
        setError("APIキーエラーです。キーの再選択を試みてください。");
      } else {
        setError("ラフ生成に失敗しました。もう一度お試しください。");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateFinal = async (instruction: string, mainCopy: string, subCopy: string) => {
    if (selectedDraftIndex === null || !draftImages[selectedDraftIndex]) return;

    setStatus(AppStatus.POLISHING); setError(null);
    setLastAction({ type: 'FINAL', args: { instruction, mainCopy, subCopy } });
    setProgress(5);
    const progressTimer = simulateProgress(5, 98, 15000);
    try {
      const previousFinal = finalImages.length > 0 ? finalImages[0].url : null;

      const polishedImage = await generateFinalImage(
        plan, draftImages[selectedDraftIndex], inputs, instruction, mainCopy, subCopy, previousFinal
      );

      clearInterval(progressTimer);
      setProgress(100);
      const patterns = ["Trend-Focused", "Psychological", "Premium"];
      const sourcePattern = patterns[selectedDraftIndex] || "Custom";
      const now = new Date();
      const timestamp = now.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setFinalImages(prev => [{ url: polishedImage, timestamp, sourcePattern }, ...prev]);
      setStatus(AppStatus.POLISHED);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      if (err?.message?.includes("Safety")) {
        setError("画像の仕上げ中に安全性の問題が検出されました。");
      } else {
        setError("最終画像の生成に失敗しました。");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const [showDocs, setShowDocs] = useState(false);

  const handleRetry = () => {
    if (!lastAction) return;
    switch (lastAction.type) {
      case 'PLAN': handleGeneratePlan(); break;
      case 'DRAFTS': handleGenerateDrafts(lastAction.args); break;
      case 'FINAL': handleGenerateFinal(lastAction.args.instruction, lastAction.args.mainCopy, lastAction.args.subCopy); break;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-50 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 px-8 shadow-2xl z-20 sticky top-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-xl mr-4 shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-400/20"><Palette className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white flex items-center">
                THUMBNAIL ARCHITECT <span className="ml-2 text-[10px] bg-white text-black px-1.5 py-0.5 rounded tracking-widest font-black">ULTIMATE</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Gemini 3 Pro Deep Research Engine Active</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowDocs(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all"
            >
              <Book className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Team Library</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
              <TrendingUp className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Trend Analysis Mode</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow p-6 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-7rem)] grid grid-cols-1 md:grid-cols-12 gap-6">
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
