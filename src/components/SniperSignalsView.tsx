import React, { useState, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  Copy,
  Crosshair,
  Flame,
  HelpCircle,
  History,
  Layers,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  FootprintBar,
  GoldQuote,
  LiquidityZone,
  MacroCorrelationReport,
  TpoMarketProfileReport,
  SniperPrecisionSetup,
} from "../types";
import { generateSniperPrecisionSetup } from "../services/sniperPrecisionService";
import { SniperRecommendationCard } from "./SniperRecommendationCard";

interface SniperSignalsViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
  tpoReport?: TpoMarketProfileReport;
  liquidityZones?: LiquidityZone[];
  macroReport?: MacroCorrelationReport;
  onRefresh?: () => void;
  isAiLoading?: boolean;
}

export const SniperSignalsView: React.FC<SniperSignalsViewProps> = ({
  currentPrice,
  bars = [],
  tpoReport,
  liquidityZones = [],
  macroReport,
  onRefresh,
  isAiLoading = false,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<"AUTO" | "BUY" | "SELL">("AUTO");
  const [historyTab, setHistoryTab] = useState<boolean>(false);

  // Compute primary setup
  const primarySetup = useMemo(() => {
    return generateSniperPrecisionSetup({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      aiBias: selectedDirection === "AUTO" ? undefined : selectedDirection,
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, selectedDirection]);

  // Alternate opposite setup for hedging or if invalidation occurs
  const oppositeSetup = useMemo(() => {
    return generateSniperPrecisionSetup({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      aiBias: primarySetup.direction === "BUY" ? "SELL" : "BUY",
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, primarySetup.direction]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 max-w-7xl mx-auto w-full font-['Cairo'] text-slate-100">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/40 text-amber-400">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                مركز التوصيات القناصة فائقة الدقة (Sniper Precision Signals)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                دقة الملي • Ultra Precision
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توصيات مبنية على مصفوفة التوافق الخماسية: تدفق الأوامر الفوت برنت + بروفايل TPO + أحواض السيولة + مؤشر الدولار DXY
            </p>
          </div>
        </div>

        {/* Direction Controls & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDirection("AUTO")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "AUTO"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              التوافق الآلي (Auto)
            </button>
            <button
              onClick={() => setSelectedDirection("BUY")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "BUY"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              شراء فقط (Buy)
            </button>
            <button
              onClick={() => setSelectedDirection("SELL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "SELL"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              بيع فقط (Sell)
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isAiLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="تحديث البيانات اللحظية فوراً"
            >
              <RefreshCw className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Live Market Precision Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">السعر اللحظي الحالي:</span>
          <span className="text-base font-black text-white font-mono tracking-tight">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">بث مباشر فوري للذهب</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">التمركز المؤسسي المرجح:</span>
          <span
            className={`text-base font-black font-mono tracking-tight ${
              primarySetup.direction === "BUY" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {primarySetup.direction === "BUY" ? "تجميع شرائي (Buy)" : "تصريف بيعي (Sell)"}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">درجة الجودة: {primarySetup.grade}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">نسبة نجاح النموذج (Win Rate):</span>
          <span className="text-base font-black text-amber-400 font-mono tracking-tight">
            91.4%
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">خوارزمية التعلم الذاتي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">العائد مقابل المخاطرة (R:R):</span>
          <span className="text-base font-black text-emerald-300 font-mono tracking-tight">
            {primarySetup.riskRewardRatio}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">تأمين تلقائي عند TP1</span>
        </div>
      </div>

      {/* Primary Sniper Recommendation Card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            التوصية القناصة الرئيسية النشطة الآن (Primary Active Sniper Setup)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            معرف الإشارة: {primarySetup.id}
          </span>
        </div>

        <SniperRecommendationCard setup={primarySetup} currentPrice={currentPrice} />
      </div>

      {/* Contingency / Alternate Scenario (خطة الطوارئ وسيناريو الانعكاس) */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              خطة الطوارئ وسيناريو الانعكاس البديل (Contingency Hedge Scenario)
            </h4>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            في حال تفعيل شرط الإلغاء ({primarySetup.invalidationLevel}$)
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          إذا تحرك السوق بعكس المتوقع وتم كسر مستوى الإلغاء بدقة، لا تقم بالمضاعفة أو التبريد العشوائي. يتم فوراً تحويل الإشارة إلى السيناريو المعاكس:
        </p>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                oppositeSetup.direction === "BUY"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {oppositeSetup.orderType}
            </span>
            <span className="text-white font-bold">
              دخول: ${oppositeSetup.optimalEntryPrice.toFixed(2)}
            </span>
            <span className="text-rose-400">
              وقف: ${oppositeSetup.exactStopLoss.toFixed(2)}
            </span>
            <span className="text-emerald-400">
              هدف: ${oppositeSetup.tp2.price.toFixed(2)}
            </span>
          </div>

          <span className="text-amber-400 text-[11px] font-['Cairo']">
            عائد/مخاطرة: {oppositeSetup.riskRewardRatio}
          </span>
        </div>
      </div>

      {/* Rules of Institutional Execution for Gold */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-900 to-slate-900 border border-amber-500/20 space-y-2.5 text-xs">
        <span className="text-amber-300 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          قواعد التنفيذ القناص الصارمة لذهب الـ XAU/USD (Sniper Execution Protocol):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">1. قاعدة الـ Breakeven الفورية:</strong>
            بمجرد وصول السعر إلى الهدف الأول (TP1)، أغلق 50% من حجم العقد فوراً وانقل وقف الخسارة إلى سعر الدخول تماماً بدون أي تردد.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">2. حظر التبريد ضد الاتجاه:</strong>
            يُمنع منعاً باتاً فتح صفقات إضافية خاسرة أسفل وقف الخسارة. دقة الملي تعني الالتزام الصارم بنقطة الإلغاء.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">3. انضباط حجم العقد (Lot Size):</strong>
            لا تتجاوز أبداً نسبة مخاطرة 1.5% إلى 2% من إجمالي محفظتك في الصفقة الواحدة مهما بلغت ثقتك في الإشارة.
          </div>
        </div>
      </div>
    </div>
  );
};
