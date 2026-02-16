import React from 'react';
import { Layer, LayoutPattern } from '../types';
import { LAYOUT_PRESETS } from '../services/layoutPresets';

interface ThumbnailCanvasProps {
  layers: Layer[];
  pattern: LayoutPattern;
  onTextChange?: (text: string) => void;
  className?: string;
}

const ThumbnailCanvas: React.FC<ThumbnailCanvasProps> = ({ layers, pattern, onTextChange, className }) => {
  const preset = LAYOUT_PRESETS.find(p => p.id === pattern) || LAYOUT_PRESETS[0];

  return (
    <div className={`preview-canvas ${className || ''}`}>
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
                    pointerEvents: 'auto', // Allow editing
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
