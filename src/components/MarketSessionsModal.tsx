import React from 'react';
import {
  X,
  Clock,
  Zap,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Globe,
  Sliders,
} from 'lucide-react';
import { getMarketSessionStatus, GOLD_SESSIONS_SCHEDULE } from '../services/marketSessionService';
import { TerminalSettings } from '../types';

interface MarketSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TerminalSettings;
  onUpdateSettings: (newSettings: Partial<TerminalSettings>) => void;
}

export const MarketSessionsModal: React.FC<MarketSessionsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const currentStatus = getMarketSessionStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e131d] border border-amber-500/40 shadow-2xl text-right text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>أوقات جلسات سوق الذهب والسيولة المؤسسية</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                  XAU/USD Market Hours
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                إدارة أوقات افتتاح وإغلاق البورصات العالمية وفلتر حجب التوصيات غير المجدية
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
          {/* Current Live Session & Liquidity Card */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              currentStatus.isMarketOpen
                ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-[#121926] border-amber-500/40'
                : 'bg-rose-950/20 border-rose-800/40'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentStatus.isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="font-bold text-sm text-white">
                  الحالة الحالية: {currentStatus.sessionNameAr}
                </span>
              </div>
              <p className="text-slate-300 text-xs">{currentStatus.liquidityDescriptionAr}</p>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-['JetBrains_Mono']">
                <span>توقيت غرينتش الحالي: {currentStatus.utcTimeStr}</span>
                <span>•</span>
                <span>توقيتك المحلي: {currentStatus.localTimeStr}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 min-w-[170px] text-center shrink-0">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">الحدث القادم في السوق:</span>
              <span className="text-xs font-bold text-amber-300 block mt-0.5">
                {currentStatus.nextEvent.nameAr}
              </span>
              <span className="text-sm font-bold text-white font-['JetBrains_Mono'] block mt-1">
                خلال {currentStatus.nextEvent.countdownStr}
              </span>
            </div>
          </div>

          {/* Golden Rule: Strict Quality Recommendation Guardrail */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>معيار الأمان المؤسسي: عدم إعطاء توصية إذا لم تكن فرص نجاحها مؤكدة (90%+)</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              وفقاً لقواعد إدارة المخاطر الاحترافية، <strong>الامتناع عن التداول هو نصف النجاح</strong>. يقوم النظام بحجب التوصيات تلقائياً في الحالات الآتية:
            </p>
            <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-1">
              <li>
                <strong>عند إغلاق السوق (عطلة نهاية الأسبوع أو استراحة الصيانة اليومية)</strong> لتجنب فجوات الأسعار (Gaps) واتساع السبريد.
              </li>
              <li>
                <strong>في فترات الخمول والسيولة الضعيفة</strong> التي يكثر فيها التذبذب العشوائي (Chop & Fakeouts).
              </li>
              <li>
                <strong>إذا لم تتطابق أركان التوافق الأربعة</strong> (دلتا الفوت برنت + تدفق الفيوتشرز + أوبشن GEX + حماية جدران الليمت) بنسبة نجاح تفوق 90%.
              </li>
            </ul>
          </div>

          {/* Sessions Schedule Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>جدول ومستويات سيولة جلسات الذهب العالمية (بتوقيت UTC)</span>
            </div>

            <div className="space-y-2">
              {GOLD_SESSIONS_SCHEDULE.map((session, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                    session.liquidity === 'PRIME'
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{session.nameAr}</span>
                      {session.liquidity === 'PRIME' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1">
                          <Flame className="w-3 h-3 fill-current" />
                          <span>قمة السيولة (أفضل وقت للدخول)</span>
                        </span>
                      )}
                      {session.liquidity === 'HIGH' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          سيولة مرتفعة
                        </span>
                      )}
                      {session.liquidity === 'MODERATE' && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium text-[10px]">
                          سيولة متوسطة
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px]">{session.descriptionAr}</p>
                  </div>

                  <div className="text-left font-['JetBrains_Mono'] shrink-0 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-amber-400 font-bold">
                      {String(session.startUtc).padStart(2, '0')}:00 - {String(session.endUtc).padStart(2, '0')}:00 UTC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Recommendation Guardrail Controls */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>إعدادات وفلاتر دقة التوصيات (Recommendation Guardrails)</span>
            </div>

            <div className="space-y-2.5">
              {/* Toggle 1: Enforce Market Hours */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block">
                    حظر التوصيات عند إغلاق السوق وعطلة الأسبوع
                  </span>
                  <span className="text-[11px] text-slate-400">
                    منع أي إشارة أثناء إغلاق بورصات الذهب لحماية الحساب من الفجوات السعرية
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      enforceMarketHoursOnly: !settings.enforceMarketHoursOnly,
                    })
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.enforceMarketHoursOnly ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.enforceMarketHoursOnly ? 'translate-x-0' : '-translate-x-6'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Only High Liquidity Sessions */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block">
                    حصر التوصيات في جلسات السيولة العالية فقط (لندن ونيويورك)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    تجاهل إشارات فترات الخمول والتركيز على ذروة السيولة والانفجار السعري
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      onlyHighLiquiditySessions: !settings.onlyHighLiquiditySessions,
                    })
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.onlyHighLiquiditySessions ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.onlyHighLiquiditySessions ? 'translate-x-0' : '-translate-x-6'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Strict High Win Rate Only */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-xs block">
                    فلتر الصفقات الناجحة والمؤكدة بنسبة 90%+ فقط (Strict A+ Filter)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    حجب أي صفقة غير مكتملة الأركان وعدم المخاطرة إلا في الصفقات المؤسسية الكبرى
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      strictHighWinRateOnly: !settings.strictHighWinRateOnly,
                    })
                  }
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    settings.strictHighWinRateOnly ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.strictHighWinRateOnly ? 'translate-x-0' : '-translate-x-6'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            أفضل ساعات التداول اليومية: <strong>12:00 إلى 16:00 UTC (تداخل لندن ونيويورك)</strong>
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
          >
            تطبيق وحفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};
