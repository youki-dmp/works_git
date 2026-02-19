import React, { useState } from 'react';
import ThumbnailCanvas from './components/ThumbnailCanvas';
import LayerEditor from './components/LayerEditor';
import LayoutSelector from './components/LayoutSelector';
import { Layer, LayoutPattern } from './types';
import { generateLayerAsset } from './services/aiService';
import { exportThumbnail } from './services/exportService';
import { Upload, Download, Wand2, RotateCcw, RotateCw, Smartphone, Info } from 'lucide-react';
import './styles/index.css';

const App: React.FC = () => {
  const [pattern, setPattern] = useState<LayoutPattern>('chat-standard-left');
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: '背景', type: 'background', isVisible: true, content: '' },
    { id: '2', name: 'エフェクト', type: 'effect', isVisible: true, content: '' },
    { id: '3', name: '立ち絵', type: 'character', isVisible: true, content: '' },
    { id: '4', name: '文字', type: 'text', isVisible: true, content: '雑談だ文字だ' },
  ]);

  const [history, setHistory] = useState<Layer[][]>([]);
  const [redoStack, setRedoStack] = useState<Layer[][]>([]);
  const [loadingLayers, setLoadingLayers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [mobileMode, setMobileMode] = useState<boolean>(false);

  const pushToHistory = (newLayers: Layer[]) => {
    setHistory(prev => [...prev, layers]);
    setRedoStack([]);
    setLayers(newLayers);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(prevStack => [...prevStack, layers]);
    setHistory(prevHistory => prevHistory.slice(0, -1));
    setLayers(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prevHistory => [...prevHistory, layers]);
    setRedoStack(prevStack => prevStack.slice(0, -1));
    setLayers(next);
  };

  const handleToggleVisibility = (id: string) => {
    const newLayers = layers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l);
    pushToHistory(newLayers);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }, type: 'character' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newLayers = layers.map(l => l.type === type ? { ...l, content: url } : l);
        pushToHistory(newLayers);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragover') setIsDragOver(true);
    else setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload({ target: { files: e.dataTransfer.files } }, 'character');
    }
  };

  const getDominantColor = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#00f2ff');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
        const count = data.length / 4;
        resolve(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`);
      };
      img.onerror = () => resolve('#00f2ff');
      img.src = imageUrl;
    });
  };

  const handleGenerateLayer = async (type: Layer['type']) => {
    if (type === 'character') return;

    const targetLayer = layers.find(l => l.type === type);
    const charLayer = layers.find(l => l.type === 'character');
    if (!targetLayer) return;

    setLoadingLayers(prev => ({ ...prev, [targetLayer.id]: true }));
    setLoading(true);

    try {
      let baseColor = undefined;
      if (charLayer?.content) {
        baseColor = await getDominantColor(charLayer.content);
      }

      const result = await generateLayerAsset(type as any, "Japanese Style VTuber Theme", baseColor);
      const newLayers = layers.map(l => l.type === type ? { ...l, content: result } : l);
      pushToHistory(newLayers);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoadingLayers(prev => ({ ...prev, [targetLayer.id]: false }));
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportThumbnail(layers, pattern);
  };

  return (
    <div className="app-container">
      <header className="mb-12 text-center">
        <h1 className="text-5xl mb-2 font-black italic text-center">
          <span className="gradient-text">V-THUMBNAIL</span> ARCHITECT
        </h1>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`p-2 rounded-full border border-glass-border hover:bg-white/10 transition-all ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="取り消し (Undo)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded-full border border-glass-border hover:bg-white/10 transition-all ${redoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            title="やり直し (Redo)"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
        <p className="text-text-muted font-light tracking-[0.3em] text-xs text-center mt-4 uppercase">LAYER-BASED AI GENERATOR</p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isDragOver ? 'ring-4 ring-accent-neon ring-offset-4 ring-offset-bg-dark scale-[1.02]' : ''}`}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <ThumbnailCanvas
              layers={layers}
              pattern={pattern}
              showGuides={showGuides}
              mobileMode={mobileMode}
              onTextChange={(newText) => pushToHistory(layers.map(l => l.type === 'text' ? { ...l, content: newText } : l))}
            />
            {/* Guide Toggles */}
            <div className="absolute top-4 right-4 flex gap-2 z-[60]">
              <button
                onClick={() => setMobileMode(!mobileMode)}
                className={`p-2 rounded-lg backdrop-blur-md border transition-all ${mobileMode ? 'bg-accent-neon text-black border-accent-neon' : 'bg-black/40 text-white border-white/20'}`}
                title="モバイルプレビュー切替"
              >
                <Smartphone className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`p-2 rounded-lg backdrop-blur-md border transition-all ${showGuides ? 'bg-accent-purple text-white border-accent-purple' : 'bg-black/40 text-white border-white/20'}`}
                title="ガイド表示切替"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            {isDragOver && (
              <div className="absolute inset-0 bg-accent-neon/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-accent-neon pointer-events-none">
                <Upload className="w-16 h-16 mb-4 animate-bounce" />
                <span className="text-2xl font-black italic tracking-wider">DROP TO UPLOAD CHARACTER</span>
              </div>
            )}
          </div>

          <div className="premium-card flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <label className="btn-generate flex items-center gap-2 bg-secondary-gradient cursor-pointer hover:opacity-90 transition-opacity">
                <Upload className="w-4 h-4" />
                立ち絵アップロード
                <input type="file" hidden onChange={e => handleFileUpload(e, 'character')} accept="image/*" />
              </label>
            </div>
            <button
              className="btn-generate flex items-center gap-2 px-8 hover:opacity-90 transition-opacity"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              完成画像を書き出し
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <LayoutSelector selectedId={pattern} onSelect={setPattern} />

          <div className="premium-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-accent-neon" />
              一括魔法生成
            </h3>
            <p className="text-sm text-text-muted mb-6">
              Nano Banana Pro が立ち絵の雰囲気に合わせて背景・エフェクト・文字を自動作成します。
            </p>
            <button
              className="btn-generate w-full py-4 text-lg"
              onClick={() => {
                handleGenerateLayer('background');
                handleGenerateLayer('effect');
                handleGenerateLayer('text');
              }}
              disabled={loading}
            >
              {loading ? "魔法発動中..." : "全レイヤーを生成"}
            </button>
          </div>

          <LayerEditor
            layers={layers}
            loadingLayers={loadingLayers}
            onToggleVisibility={handleToggleVisibility}
            onGenerateLayer={handleGenerateLayer}
          />
        </div>
      </main>

      <footer className="mt-20 text-text-muted text-xs">
        &copy; 2026 V-Thumbnail Architect. Powered by Nano Banana Pro.
      </footer>
    </div>
  );
};

export default App;
