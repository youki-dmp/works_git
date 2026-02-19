import React from 'react';
import { Layer, LayoutPattern } from '../types';
import { LAYOUT_PRESETS } from '../services/layoutPresets';
import { Info, Smartphone } from 'lucide-react';

interface ThumbnailCanvasProps {
  layers: Layer[];
  pattern: LayoutPattern;
  onTextChange?: (text: string) => void;
  className?: string;
  showGuides?: boolean;
  mobileMode?: boolean;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({
  layers,
  pattern,
  onTextChange,
  className,
  showGuides = true,
  mobileMode = false
}) => {
  const preset = LAYOUT_PRESETS.find(p => p.id === pattern) || LAYOUT_PRESETS[0];

  return (
    <div className={`preview-canvas ${className || ''} ${mobileMode ? 'mobile-preview' : ''}`}>
      {layers
        .filter((l) => l.isVisible)
        .map((layer) => {
          const presetStyle = preset.layerStyles[layer.type] || {};
          return (
            <div
              key={layer.id}
              className={`layer layer-${layer.type}`}
              style={{
                ...presetStyle,
                ...layer.style,
                zIndex: getZIndex(layer.type),
              }}
            >
              {layer.type === 'text' ? (
                <div
                  className="text-layer-content"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newText = e.currentTarget.textContent || '';
                    onTextChange?.(newText);
                  }}
                  style={{
                    color: 'white',
                    textShadow: '0 0 10px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.2)',
                    lineHeight: 1.1,
                    pointerEvents: 'auto',
                    cursor: 'text',
                  }}
                >
                  {layer.content}
                </div>
              ) : layer.content ? (
                <img src={layer.content} alt={layer.name} className="layer-img" />
              ) : null}
            </div>
          );
        })}

      {/* YouTube Deadzone Guide */}
      {showGuides && !mobileMode && (
        <div className="absolute bottom-4 right-4 z-[100] opacity-70 pointer-events-none">
          <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md border border-white/20 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>YT TIME BADGE AREA</span>
          </div>
          <div className="w-24 h-8 bg-red-500/20 border-2 border-dashed border-red-500/50 mt-1 rounded-sm"></div>
        </div>
      )}

      {/* Mobile Center Guide */}
      {showGuides && mobileMode && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[405px] border-x-2 border-dashed border-accent-neon/50 z-[100] pointer-events-none flex items-start justify-center pt-4">
          <div className="bg-accent-neon/20 text-accent-neon text-[10px] px-2 py-1 rounded-md backdrop-blur-md border border-accent-neon/30 flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <span>MOBILE SAFE AREA</span>
          </div>
        </div>
      )}
    </div>
  );
};

const getZIndex = (type: Layer['type']) => {
  switch (type) {
    case 'background': return 1;
    case 'effect': return 2;
    case 'character': return 3;
    case 'text': return 4;
    default: return 0;
  }
};

export default ThumbnailCanvas;
