import React, { useState } from 'react';
import ThumbnailCanvas from './components/ThumbnailCanvas';
import LayerEditor from './components/LayerEditor';
import LayoutSelector from './components/LayoutSelector';
import { Layer, LayoutPattern } from './types';
import { generateLayerAsset } from './services/aiService';
import { exportThumbnail } from './services/exportService';
import { Upload, Download, Wand2 } from 'lucide-react';
import './styles/index.css';

const App: React.FC = () => {
  const [pattern, setPattern] = useState<LayoutPattern>('chat-standard-left');
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: '背景', type: 'background', isVisible: true, content: '' },
    { id: '2', name: 'エフェクト', type: 'effect', isVisible: true, content: '' },
    { id: '3', name: '立ち絵', type: 'character', isVisible: true, content: '' },
    { id: '4', name: '文字', type: 'text', isVisible: true, content: '雑談だ文字だ' },
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleToggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }, type: 'character' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setLayers(layers.map(l => l.type === type ? { ...l, content: url } : l));
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
      // Default to character upload for drag and drop on preview
      handleFileUpload({ target: { files: e.dataTransfer.files } }, 'character');
    }
  };

  const handleGenerateLayer = async (type: Layer['type']) => {
    if (type === 'character') return;

    setLoading(true);
    try {
      const result = await generateLayerAsset(type as any, "Japanese Style VTuber Theme");
      // TODO: Result processing (images come back as base64/blobs in real implementation)
      setLayers(layers.map(l => l.type === type ? { ...l, content: result } : l));
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportThumbnail(layers, pattern);
  };

  return (
    <div className="app-container">
      <header className="mb-12 text-center">
        <h1 className="text-5xl mb-2 font-black italic">
          <span className="gradient-text">V-THUMBNAIL</span> ARCHITECT
        </h1>
        <p className="text-text-muted font-light tracking-[0.3em] text-xs">LAYER-BASED AI GENERATOR</p>
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
              onTextChange={(newText) => setLayers(layers.map(l => l.type === 'text' ? { ...l, content: newText } : l))}
            />
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
