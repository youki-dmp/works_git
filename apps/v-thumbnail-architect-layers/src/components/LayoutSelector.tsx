import React, { useState } from 'react';
import { LAYOUT_PRESETS } from '../services/layoutPresets';
import { LayoutPattern } from '../types';
import { Layout, MessageSquare, Music, Gamepad2, Megaphone } from 'lucide-react';

interface LayoutSelectorProps {
  selectedId: LayoutPattern;
  onSelect: (id: LayoutPattern) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedId, onSelect }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'singing' | 'gaming' | 'announcement'>('chat');

  const categories = [
    { id: 'chat', name: '雑談', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'singing', name: '歌枠', icon: <Music className="w-4 h-4" /> },
    { id: 'gaming', name: 'ゲーム', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'announcement', name: '告知', icon: <Megaphone className="w-4 h-4" /> },
  ];

  const filteredPresets = LAYOUT_PRESETS.filter(p => p.category === activeTab);

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Layout className="w-5 h-5 text-blue-400" />
          テンプレート研究成果
        </h3>
        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
          {LAYOUT_PRESETS.length} PATTERNS
        </span>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === cat.id
                ? 'bg-primary-gradient text-white'
                : 'bg-white/5 text-text-muted hover:bg-white/10'
              }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${selectedId === preset.id
                ? 'border-accent-neon bg-accent-neon/5'
                : 'border-glass-border bg-white/5 hover:border-white/10'
              }`}
          >
            <div className="flex-grow">
              <div className={`font-bold text-sm ${selectedId === preset.id ? 'text-accent-neon' : 'text-white'}`}>
                {preset.name}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
                {preset.description}
              </div>
            </div>
            {selectedId === preset.id && (
              <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LayoutSelector;
