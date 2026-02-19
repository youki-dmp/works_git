import React, { useState } from 'react';
import { LAYOUT_PRESETS } from '../services/layoutPresets';
import { LayoutPattern, LayoutPreset } from '../types';
import { Layout, MessageSquare, Music, Gamepad2, Megaphone, Star } from 'lucide-react';

interface LayoutSelectorProps {
  selectedId: LayoutPattern;
  onSelect: (id: LayoutPattern) => void;
}

const LayoutMiniPreview: React.FC<{ preset: LayoutPreset }> = ({ preset }) => {
  const charStyle = preset.layerStyles.character || {};
  const textStyle = preset.layerStyles.text || {};

  return (
    <div className="layout-mini-preview">
      {/* Background Placeholder */}
      <div className="absolute inset-0 bg-white/5"></div>

      {/* Character Placeholder */}
      <div
        className="mini-element mini-char-placeholder"
        style={{
          width: '40%',
          height: '80%',
          ...charStyle,
          position: 'absolute',
          // Simplify styles for mini-view
          fontSize: '0',
          transform: (charStyle.transform as string)?.includes('scale') ? charStyle.transform : 'none'
        }}
      ></div>

      {/* Text Placeholder */}
      <div
        className="mini-element flex flex-col gap-[2px]"
        style={{
          ...textStyle,
          position: 'absolute',
          width: '45%',
          height: 'auto',
          fontSize: '0'
        }}
      >
        <div className="mini-text-placeholder w-full"></div>
        <div className="mini-text-placeholder w-[80%]"></div>
        <div className="mini-text-placeholder w-[90%]"></div>
      </div>
    </div>
  );
};

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedId, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'singing' | 'gaming' | 'announcement'>('chat');

  const categories = [
    { id: 'chat', name: '雑談', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'singing', name: '歌枠', icon: <Music className="w-4 h-4" /> },
    { id: 'gaming', name: 'ゲーム', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'announcement', name: '告知', icon: <Megaphone className="w-4 h-4" /> },
  ];

  const filteredPresets = LAYOUT_PRESETS.filter(p => p.category === activeTab);

  const getBadgeLabel = (type?: string) => {
    switch (type) {
      case 'hi-ctr': return 'HI-CTR';
      case 'trend': return 'TREND';
      case 'classic': return 'CLASSIC';
      default: return null;
    }
  };

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black flex items-center gap-2 italic">
          <Layout className="w-6 h-6 text-accent-neon" />
          <span className="gradient-text">ARCHIVE:</span> TEMPLATES
        </h3>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
            {LAYOUT_PRESETS.length} Models Verified
          </span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-black/20 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-black transition-all whitespace-nowrap flex-1 ${activeTab === cat.id
              ? 'bg-white/10 text-white shadow-inner border border-white/10'
              : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="layout-grid max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`layout-card group ${selectedId === preset.id ? 'selected' : ''}`}
          >
            <LayoutMiniPreview preset={preset} />

            <div className="layout-metadata">
              <div className="flex items-center justify-between gap-1 overflow-hidden">
                <span className={`font-black text-[10px] uppercase truncate ${selectedId === preset.id ? 'text-accent-neon' : 'text-white'}`}>
                  {preset.name}
                </span>
                {preset.badgeType && (
                  <span className={`badge-tag badge-${preset.badgeType} shrink-0`}>
                    {getBadgeLabel(preset.badgeType)}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-text-muted leading-tight line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity">
                {preset.description}
              </p>
            </div>

            {selectedId === preset.id && (
              <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-accent-neon rounded-full shadow-lg border border-black/20">
                <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
