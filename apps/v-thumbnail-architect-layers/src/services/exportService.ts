import { Layer, LayoutPattern } from '../types';
import { LAYOUT_PRESETS } from './layoutPresets';

export const exportThumbnail = async (layers: Layer[], pattern: LayoutPattern): Promise<void> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const preset = LAYOUT_PRESETS.find(p => p.id === pattern) || LAYOUT_PRESETS[0];

  // Draw layers in order
  const sortedLayers = [...layers].sort((a, b) => getZIndex(a.type) - getZIndex(b.type));

  for (const layer of sortedLayers) {
    if (!layer.isVisible) continue;

    const style = preset.layerStyles[layer.type] || {};

    if (layer.type === 'text') {
      await drawTextLayer(ctx, layer.content || '', style, canvas.width, canvas.height);
    } else if (layer.content) {
      await drawImageLayer(ctx, layer.content, style, canvas.width, canvas.height);
    }
  }

  // Trigger download
  const link = document.createElement('a');
  link.download = `v-thumbnail-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

const drawImageLayer = (ctx: CanvasRenderingContext2D, src: string, style: any, cw: number, ch: number): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();

      // Parse styles (simplified for MVP)
      const scale = style.transform ? parseFloat(style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1') : 1;
      const x = style.left ? (parseFloat(style.left) / 100) * cw : style.right ? cw - ((parseFloat(style.right) / 100) * cw) - (cw * scale) : 0;
      const y = style.top ? (parseFloat(style.top) / 100) * ch : style.bottom ? ch - ((parseFloat(style.bottom) / 100) * ch) - (ch * scale) : 0;

      // Draw image
      ctx.drawImage(img, x, y, cw * scale, ch * scale);

      ctx.restore();
      resolve();
    };
    img.src = src;
  });
};

const drawTextLayer = (ctx: CanvasRenderingContext2D, text: string, style: any, cw: number, ch: number) => {
  ctx.save();

  const fontSize = style.fontSize ? parseFloat(style.fontSize) * 16 : 80;
  ctx.font = `black ${fontSize}px "Noto Sans JP", sans-serif`;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 8;
  ctx.textAlign = style.textAlign || 'center';

  const x = style.left ? (parseFloat(style.left) / 100) * cw : style.right ? cw - (parseFloat(style.right) / 100) * cw : cw / 2;
  const y = style.top ? (parseFloat(style.top) / 100) * ch : style.bottom ? ch - (parseFloat(style.bottom) / 100) * ch : ch / 2;

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.restore();
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
