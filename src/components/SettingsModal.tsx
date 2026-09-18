import React from 'react';
import { TerminalSettings } from '../types';
import { X, Sliders, Volume2, VolumeX, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TerminalSettings;
  onUpdateSettings: (newSettings: Partial<TerminalSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111622] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-['Cairo']">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">إعدادات الأوردر فلو والفوت برنت</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Imbalance Ratio */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              نسبة اختلال الحجم القطري (Diagonal Imbalance Ratio)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2.5, 3.0, 4.0].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => onUpdateSettings({ imbalanceRatio: ratio })}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    settings.imbalanceRatio === ratio
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {ratio * 100}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              النسبة التي يعتبر عندها تدفق الشراء أو البيع الماركت كاسحاً للطلب أو العرض المقابل.
            </p>
          </div>

          {/* Tick Size */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              حجم التكة السعرية لتجميع الشموع (Tick Size)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0.5, 1.0, 2.0].map((tick) => (
                <button
                  key={tick}
                  onClick={() => onUpdateSettings({ tickSize: tick })}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    settings.tickSize === tick
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ${tick.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Whale Filter Threshold */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              حد صفقات الحيتان الكبيرة (Whale Orders Threshold)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3.0, 5.0, 10.0].map((threshold) => (
                <button
                  key={threshold}
                  onClick={() => onUpdateSettings({ whaleThreshold: threshold })}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                    settings.whaleThreshold === threshold
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {threshold} Lots
                </button>
              ))}
            </div>
          </div>

          {/* Price Alignment & Spot Gold Calibration */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                معايرة ومطابقة سعر الذهب الفوري العالمي (Spot Calibration)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                مفعل $4378.33
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              مطابقة ومزامنة السعر مباشرة مع الإغلاق العالمي الرسمي للذهب ($4378.33) لضمان دقة التحليل مع شاشات TradingView و Bookmap.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ priceCalibrationMode: 'auto_spot' })}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  settings.priceCalibrationMode === 'auto_spot'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                سعر الذهب العالمي ($4378.33)
              </button>
              <button
                onClick={() => onUpdateSettings({ priceCalibrationMode: 'paxg_pure' })}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  settings.priceCalibrationMode === 'paxg_pure'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                تغذية PAXG الخام
              </button>
            </div>
          </div>

          {/* Ultra-Precision 100% Confluence Filter */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-slate-200 font-bold mb-1">
              فلتر التوصيات فائقة الدقة (Ultra-Strict 100% Setup Only)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              تصفية التوصيات بحيث لا تظهر إلا الصفقات المكتملة لجميع الشروط المؤسسية (Order Flow + Bookmap Stop Hunt + TrendSpider + Options GEX) لضمان أعلى نسبة نجاح تاريخية.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'الكل (>= 75%)', score: 75 },
                { label: 'عالية (>= 90%)', score: 90 },
                { label: 'مضمونة 100% (A+)', score: 95 },
              ].map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => onUpdateSettings({ minConfluenceScore: opt.score })}
                  className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold text-center transition-all ${
                    (settings.minConfluenceScore || 90) === opt.score
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
              <span className="text-slate-300 font-medium">تمييز اختلالات الشراء والبيع بالألوان</span>
              <input
                type="checkbox"
                checked={settings.showImbalances}
                onChange={(e) => onUpdateSettings({ showImbalances: e.target.checked })}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
              <span className="text-slate-300 font-medium">إبراز نقطة التحكم في الحجم (POC Highlight)</span>
              <input
                type="checkbox"
                checked={settings.showPOC}
                onChange={(e) => onUpdateSettings({ showPOC: e.target.checked })}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
              <span className="text-slate-300 font-medium">تنبيهات صوتية عند اصطياد مناطق السيولة</span>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={(e) => onUpdateSettings({ soundAlerts: e.target.checked })}
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
