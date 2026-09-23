import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Crosshair,
  DollarSign,
  Flame,
  Info,
  Layers,
  Percent,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SniperPrecisionSetup } from "../types";
import { calculatePositionSize } from "../services/sniperPrecisionService";

interface SniperRecommendationCardProps {
  setup: SniperPrecisionSetup;
  currentPrice: number;
  onRecordFeedback?: (outcome: "win" | "loss") => void;
  className?: string;
}

export const SniperRecommendationCard: React.FC<SniperRecommendationCardProps> = ({
  setup,
  currentPrice,
  onRecordFeedback,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [showCalculator, setShowCalculator] = useState(true);

  const isBuy = setup.direction === "BUY";
  const posSize = calculatePositionSize(accountBalance, riskPercent, setup.slDistancePips);

  const handleCopy = () => {
    navigator.clipboard.writeText(setup.mtCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Price distance to entry
  const distanceToEntry = Math.round((currentPrice - setup.optimalEntryPrice) * 100) / 100;
  const isNearEntry = Math.abs(distanceToEntry) <= 1.25;

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-b from-[#131927] to-[#0c101c] p-4 sm:p-5 shadow-2xl transition-all font-['Cairo'] relative overflow-hidden ${
        isBuy
          ? "border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.12)]"
          : "border-rose-500/40 shadow-[0_0_35px_rgba(244,63,94,0.12)]"
      } ${className}`}
    >
      {/* Background Accent Glow */}
      <div
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBuy ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />

      {/* Top Header Badge & Meta */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isBuy
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            <Crosshair className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                  isBuy
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {setup.orderType}
              </span>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                {setup.grade}
              </span>

              <span className="text-[11px] font-bold text-slate-400 font-mono">
                توافق {setup.qualityScore}%
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white mt-1">
              {setup.titleAr}
            </h3>
          </div>
        </div>

        {/* Copy Command Button */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95 ${
            copied
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-amber-500/30"
          }`}
          title="نسخ أمر التوصية بصيغة منصات MT4 / MT5 / cTrader"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "تم النسخ بنجاح!" : "نسخ للمنصة (MT4/5)"}</span>
        </button>
      </div>

      {/* Main Execution Numbers (Entry - Stop Loss - R:R) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* Entry Block */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 relative">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-bold flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              نقطة الدخول المثالية (Limit)
            </span>
            {isNearEntry && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono animate-pulse">
                السعر الحالي قرب الدخول
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
              ${setup.optimalEntryPrice.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              [${setup.entryZoneRange.min.toFixed(2)} - ${setup.entryZoneRange.max.toFixed(2)}]
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            {setup.exactTriggerConditionAr}
          </p>
        </div>

        {/* Stop Loss Block */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 relative">
          <div className="flex items-center justify-between text-rose-300 text-xs mb-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              وقف الخسارة المحكم (SL بالملي)
            </span>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold">
              {setup.slDistancePips} نقطة (Pips)
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono tracking-tight">
              ${setup.exactStopLoss.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              (حماية {setup.slDistancePips} pips)
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1 leading-snug">
            {setup.slStructuralRationaleAr}
          </p>
        </div>

        {/* Risk / Reward Block */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
              <span className="font-bold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                نسبة العائد إلى المخاطرة (R:R)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                محسوبة رياضياً
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {setup.riskRewardRatio}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            متوسط ربح موزون: كل دولار مخاطرة يقابله{" "}
            <strong className="text-emerald-400 font-mono">${setup.riskRewardValue.toFixed(2)}</strong> ربح
            محتمل.
          </div>
        </div>
      </div>

      {/* 3-Tier Multi-Stage Target Ladder (الأهداف المرحلية الثلاثية) */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            الأهداف المرحلية المتعددة وتكتيك حجز الأرباح (Multi-Tier Targets)
          </span>
          <span className="text-[10px] text-slate-400">
            تأمين العقد تدريجياً لضمان عدم خروج الصفقة بخسارة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* TP1 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/25 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                TP1: ${setup.tp1.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                +{setup.tp1.distancePips} pips ({setup.tp1.closeVolumePercent}%)
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-200 block">
              {setup.tp1.labelAr}
            </span>
            <p className="text-[10px] text-amber-200/90 leading-snug">
              ⚡ {setup.tp1.instructionAr}
            </p>
          </div>

          {/* TP2 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/35 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">
                TP2: ${setup.tp2.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                +{setup.tp2.distancePips} pips ({setup.tp2.closeVolumePercent}%)
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-200 block">
              {setup.tp2.labelAr}
            </span>
            <p className="text-[10px] text-emerald-300/90 leading-snug">
              🎯 {setup.tp2.instructionAr}
            </p>
          </div>

          {/* TP3 */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 font-mono">
                TP3: ${setup.tp3.price.toFixed(2)}
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                +{setup.tp3.distancePips} pips ({setup.tp3.closeVolumePercent}%)
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-200 block">
              {setup.tp3.labelAr}
            </span>
            <p className="text-[10px] text-sky-300/90 leading-snug">
              🚀 {setup.tp3.instructionAr}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Capital & Lot Sizing Calculator (حاسبة اللوت وإدارة رأس المال اللحظية) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-[#111624] to-slate-950 border border-slate-800 space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>حاسبة حجم العقد الصارم (Lot Size &amp; Capital Guard)</span>
          </div>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            {showCalculator ? "إخفاء التفاصيل" : "تعديل الرصيد والمخاطرة"}
          </button>
        </div>

        {showCalculator && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            {/* Account Balance Input */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                رصيد الحساب ($):
              </label>
              <input
                type="number"
                min={50}
                step={100}
                value={accountBalance}
                onChange={(e) => setAccountBalance(Math.max(50, Number(e.target.value) || 100))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Risk % Selector */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-bold">
                نسبة المخاطرة (%):
              </label>
              <div className="flex items-center gap-1">
                {[1, 1.5, 2].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRiskPercent(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                      riskPercent === r
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Lot */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">حجم العقد الأقصى الموصى به:</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {posSize.lotSize.toFixed(2)} Lot
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                ({posSize.microLots} ميكرو لوت)
              </span>
            </div>

            {/* Max Risk $ & Target Profit */}
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">أقصى خسارة / الربح المتوقع:</span>
              <div className="flex items-baseline gap-1 font-mono text-xs font-bold mt-0.5">
                <span className="text-rose-400">-${posSize.lossIfSlHit}</span>
                <span className="text-slate-500">/</span>
                <span className="text-emerald-400">
                  +${Math.round(posSize.lossIfSlHit * setup.riskRewardValue)}
                </span>
              </div>
              <span className="text-[9px] text-slate-500 block">حماية رأس المال من التصفير</span>
            </div>
          </div>
        )}
      </div>

      {/* Confluence Checkpoints & Invalidation Rule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Confluences */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            شروط التأكيد وتوافق تدفق الأوامر (5/5 Confluence):
          </span>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            {setup.confluencePoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Invalidation & Best Session */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              شرط الإلغاء الفوري (Invalidation Rule):
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {setup.invalidationConditionAr}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-850">
            <span className="text-[10px] text-slate-400 block font-bold">
              توقيت السيولة الأفضل للتنفيذ (Execution Window):
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {setup.bestSessionWindowAr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
