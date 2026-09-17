import React from 'react';
import { ConfluenceTradeSetup } from '../types';
import {
  X,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Award,
  AlertCircle,
  Crosshair,
} from 'lucide-react';

interface ConfluenceSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setups: ConfluenceTradeSetup[];
  currentPrice: number;
}

export const ConfluenceSignalsModal: React.FC<ConfluenceSignalsModalProps> = ({
  isOpen,
  onClose,
  setups,
  currentPrice,
}) => {
  if (!isOpen) return null;

  const activeSetup = setups[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#111622] border border-amber-500/40 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden text-slate-100 font-['Cairo']">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                صفقات التوافق المؤسسي عالي الدقة (Multi-Confluence A+ Setups)
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  دقة قصوى
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                دمج فوت برنت + فيوتشر فلو + أوبشن فلو + جدران الأوردرات الليمت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
          {activeSetup ? (
            <>
              {/* Top Confluence Score & Setup Grade */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      activeSetup.type === 'BUY_LONG'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {activeSetup.type === 'BUY_LONG' ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-white">
                        {activeSetup.type === 'BUY_LONG' ? 'صفقة شراء قناص (Long Sniper)' : 'صفقة بيع تصريفي (Short Sniper)'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                        {activeSetup.grade}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      الأصل: <strong className="text-white font-mono">{activeSetup.symbol}</strong> | السعر الحالي: <strong className="text-amber-400 font-mono">${currentPrice.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* Confluence Percentage Ring / Score */}
                <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">معدل التوافق الكلي</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold font-['JetBrains_Mono'] text-emerald-400">
                        {activeSetup.confluenceScore}%
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold font-['Cairo']">
                        (A+ توافق كامل)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Coordinates (Entry, SL with Wall Protection, TPs) */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>إحداثيات الدخول وإدارة المخاطر المحمية</span>
                  </div>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    R:R {activeSetup.riskRewardRatio}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-['JetBrains_Mono']">
                  <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-750">
                    <span className="text-[10px] text-slate-400 font-['Cairo'] block">نطاق الدخول</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      ${activeSetup.entryRange[0]} - ${activeSetup.entryRange[1]}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                    <span className="text-[10px] text-rose-400 font-['Cairo'] block">وقف الخسارة (SL)</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-300">
                      ${activeSetup.stopLoss}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف 1 (TP1)</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-300">
                      ${activeSetup.tp1}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                    <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف 2 (TP2)</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-300">
                      ${activeSetup.tp2}
                    </span>
                  </div>
                </div>

                {/* Wall Protection Banner */}
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs">
                    <strong>حماية الوقف:</strong> {activeSetup.stopLossProtection}
                  </span>
                </div>
              </div>

              {/* Confluence Factor Matrix */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>مصفوفة التوافق الرباعية (Confluence Pillars)</span>
                </div>

                <div className="space-y-2">
                  {activeSetup.confluenceFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white text-xs block">
                            {factor.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {factor.detail}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-['JetBrains_Mono'] text-amber-300">
                          {factor.weightPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Reasons */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-300 block">أسباب الدخول الفنية والحجمية:</span>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                  {activeSetup.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              جاري مسح الأسواق وتوليد صفقات التوافق عالي الدقة...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
