import React from 'react';
import { X, Layers, Sparkles, ArrowRight, Zap, Terminal } from 'lucide-react';
import { PresetScript } from '../types';
import { PRESET_SCRIPTS } from '../data/presets';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetScript) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                نماذج السكربتات الهجينة الجاهزة (Polyglot Presets)
              </h2>
              <p className="text-xs text-slate-400">
                سكربتات استثنائية جاهزة توضح قمة دمج لغات البرمجة وتوليد الأكواد المتطورة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_SCRIPTS.map((preset) => (
            <div
              key={preset.id}
              className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-cyan-950/20 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {preset.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {preset.paradigm}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {preset.titleAr}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {preset.descriptionAr}
                </p>

                {/* Languages Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {preset.languages.map((langId) => {
                    const langObj = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
                    return (
                      <span
                        key={langId}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-700/60"
                        style={{
                          backgroundColor: langObj?.badgeBg || 'rgba(255,255,255,0.05)',
                          color: langObj?.color || '#fff',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: langObj?.color }}
                        />
                        {langObj?.name || langId}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-indigo-600 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>تحميل وبناء هذا السكربت</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
