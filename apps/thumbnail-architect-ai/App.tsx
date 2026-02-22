
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
    referenceImages: [], referenceUrls: [], copyText: '', subCopy: '', subCopy2: '', videoDescription: '', aspectRatio: '16:9',
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
      if (err?.message === "API_KEY_MISSING") {
        setError("APIキーが設定されていません。.env.local ファイルを確認してください。");
      } else if (err?.message?.includes("leaked")) {
        setError("APIキーが漏洩したため、Googleによって失効されました。新しいキーを発行して .env.local を更新してください。");
      } else if (err?.message?.includes("API key") || err?.message?.includes("invalid")) {
        setError("APIキーが無効です。正しいキーが設定されているか確認してください。");
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
      } else if (err?.message?.includes("leaked")) {
        setError("APIキーが漏洩・失効しています。新しいキーを発行してください。");
      } else if (err?.message?.includes("Requested entity was not found") || err?.message?.includes("API key") || err?.message?.includes("invalid")) {
        setError("APIキーエラーです。キーの設定内容を確認してください。");
      } else {
        setError("ラフ生成に失敗しました。もう一度お試しください。");
      }
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateFinal = async (instruction: string, mainCopy: string, subCopy: string, subCopy2: string, historyIndex?: number | null) => {
    if (selectedDraftIndex === null || !draftImages[selectedDraftIndex]) return;

    setStatus(AppStatus.POLISHING); setError(null);
    setLastAction({ type: 'FINAL', args: { instruction, mainCopy, subCopy, subCopy2 } });
    setProgress(5);
    const progressTimer = simulateProgress(5, 98, 15000);
    try {
      const baseFinalUrl = typeof historyIndex === 'number' ? finalImages[historyIndex].url : null;

      const polishedImage = await generateFinalImage(
        plan, draftImages[selectedDraftIndex], inputs, instruction, mainCopy, subCopy, subCopy2, baseFinalUrl
      );

      clearInterval(progressTimer);
      setProgress(100);
      const patterns = ["Trend-Focused", "Psychological", "Premium"];
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
      case 'FINAL': handleGenerateFinal(lastAction.args.instruction, lastAction.args.mainCopy, lastAction.args.subCopy, lastAction.args.subCopy2); break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-5 px-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)] z-20 sticky top-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2.5 bg-slate-900 rounded-2xl mr-4 shadow-lg shadow-slate-200"><Palette className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                サムネイル職人 <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full tracking-widest font-bold">2026年度版</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">Gemini 3 Pro 解析エンジン稼働中</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowDocs(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
            >
              <Book className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold text-slate-700">チームライブラリ</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-xl border border-slate-100">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500">トレンド分析モード</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow p-8 overflow-hidden bg-slate-50">
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
