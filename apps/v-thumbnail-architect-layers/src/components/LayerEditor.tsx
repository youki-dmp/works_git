import React from 'react';
import { Layer } from '../types';
import { Eye, EyeOff, RefreshCw, Layers } from 'lucide-react';

interface LayerEditorProps {
  layers: Layer[];
  loadingLayers: Record<string, boolean>;
  onToggleVisibility: (id: string) => void;
  onGenerateLayer: (type: Layer['type']) => void;
}

const LayerEditor: React.FC<LayerEditorProps> = ({ layers, loadingLayers, onToggleVisibility, onGenerateLayer }) => {
  return (
    <div className="premium-card">
      <h2 className="gradient-text flex items-center gap-2">
        <Layers className="w-6 h-6 text-pink-500" />
        レイヤー編集
      </h2>
      <div className="layer-list mt-4">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`layer-item ${loadingLayers[layer.id] ? 'skeleton' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(layer.type)} ${loadingLayers[layer.id] ? 'animate-pulse' : ''}`}></span>
              <span className="font-semibold text-sm uppercase tracking-wide">{layer.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onToggleVisibility(layer.id)}
                className="text-text-muted hover:text-white transition-colors"
                title={layer.isVisible ? "隠す" : "表示"}
                disabled={loadingLayers[layer.id]}
              >
                {layer.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              {layer.type !== 'character' && (
                <button
                  onClick={() => onGenerateLayer(layer.type)}
                  className={`btn-generate flex items-center gap-2 py-1 px-3 text-xs ${loadingLayers[layer.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loadingLayers[layer.id]}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingLayers[layer.id] ? 'animate-spin' : ''}`} />
                  {loadingLayers[layer.id] ? "施工中..." : "生成"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (type: Layer['type']) => {
  switch (type) {
    case 'background': return 'bg-blue-500';
    case 'effect': return 'bg-purple-500';
    case 'character': return 'bg-green-500';
    case 'text': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export default LayerEditor;
