import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Zap,
  CheckCircle2,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DualSmartLevel, SmartDualScenario } from "../types";

interface DualSmartLevelsWidgetProps {
  upperLevel: DualSmartLevel;
  lowerLevel: DualSmartLevel;
  currentPrice: number;
}

export const DualSmartLevelsWidget: React.FC<DualSmartLevelsWidgetProps> = ({
  upperLevel,
  lowerLevel,
  currentPrice,
}) => {
  // active tabs for upper and lower level scenarios ('break' or 'bounce')
  const [upperScenarioMode, setUpperScenarioMode] = useState<"break" | "bounce">("break");
  const [lowerScenarioMode, setLowerScenarioMode] = useState<"break" | "bounce">("bounce");
  const [expandedLevel, setExpandedLevel] = useState<"upper" | "lower" | "both">("both");

  return (
    <div className="space-y-3 select-none">
      {/* Introduction Card */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white">
                المستويات الذكية المرنة ثنائية الاتجاه (Dual-Scenario Smart Levels)
              </h4>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                XAU/USD
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              مستويات مرنة تتكيف مع حركة صناع السوق:
              <strong className="text-amber-300 mx-1">المستوى الشرائي فوق السعر</strong> (شراء عند الاختراق أو بيع عند الارتداد)،
              و<strong className="text-sky-300 mx-1">المستوى البيعي تحت السعر</strong> (بيع عند الكسر أو شراء عند الصمود والارتداد).
            </p>
          </div>
        </div>

        <div className="text-left shrink-0 font-mono hidden sm:block">
          <span className="text-[10px] text-slate-400 block">السعر اللحظي</span>
          <span className="text-sm font-bold text-amber-400">${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ========================================================= */}
        {/* CARD 1: UPPER LEVEL (SMART BUY LEVEL - ABOVE PRICE)       */}
        {/* ========================================================= */}
        <div className="rounded-xl border border-rose-500/30 bg-slate-900/90 overflow-hidden shadow-sm">
          {/* Level Header */}
          <div className="p-3 bg-gradient-to-l from-rose-500/10 via-slate-900 to-slate-900 border-b border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {upperLevel.titleAr}
                </span>
                <span className="text-[10px] text-rose-300 font-medium">
                  {upperLevel.badgeLabel}
                </span>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-base font-extrabold text-rose-300 block">
                ${upperLevel.levelPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">
                يبعد +${upperLevel.distanceFromPrice.toFixed(2)} (+{upperLevel.distancePips} نقطة)
              </span>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {/* Dual Scenario Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 rounded-lg border border-slate-800">
              <button
                onClick={() => setUpperScenarioMode("break")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  upperScenarioMode === "break"
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>عند الاختراق: شراء ذكي</span>
              </button>

              <button
                onClick={() => setUpperScenarioMode("bounce")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  upperScenarioMode === "bounce"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>عند الارتداد: بيع ذكي</span>
              </button>
            </div>

            {/* Active Scenario Display */}
            {upperScenarioMode === "break" ? (
              <ScenarioCard
                scenario={upperLevel.breakScenario}
                badgeClass="bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                accentColor="emerald"
                isBullish={true}
              />
            ) : (
              <ScenarioCard
                scenario={upperLevel.bounceScenario}
                badgeClass="bg-rose-500/15 border-rose-500/30 text-rose-300"
                accentColor="rose"
                isBullish={false}
              />
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARD 2: LOWER LEVEL (SMART SELL LEVEL - BELOW PRICE)       */}
        {/* ========================================================= */}
        <div className="rounded-xl border border-sky-500/30 bg-slate-900/90 overflow-hidden shadow-sm">
          {/* Level Header */}
          <div className="p-3 bg-gradient-to-l from-sky-500/10 via-slate-900 to-slate-900 border-b border-sky-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {lowerLevel.titleAr}
                </span>
                <span className="text-[10px] text-sky-300 font-medium">
                  {lowerLevel.badgeLabel}
                </span>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-base font-extrabold text-sky-300 block">
                ${lowerLevel.levelPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400">
                يبعد -${lowerLevel.distanceFromPrice.toFixed(2)} (-{lowerLevel.distancePips} نقطة)
              </span>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {/* Dual Scenario Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/70 rounded-lg border border-slate-800">
              <button
                onClick={() => setLowerScenarioMode("break")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lowerScenarioMode === "break"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>عند الكسر: بيع ذكي</span>
              </button>

              <button
                onClick={() => setLowerScenarioMode("bounce")}
                className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  lowerScenarioMode === "bounce"
                    ? "bg-emerald-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>عند الصمود: شراء ذكي</span>
              </button>
            </div>

            {/* Active Scenario Display */}
            {lowerScenarioMode === "break" ? (
              <ScenarioCard
                scenario={lowerLevel.breakScenario}
                badgeClass="bg-rose-500/15 border-rose-500/30 text-rose-300"
                accentColor="rose"
                isBullish={false}
              />
            ) : (
              <ScenarioCard
                scenario={lowerLevel.bounceScenario}
                badgeClass="bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                accentColor="emerald"
                isBullish={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScenarioCardProps {
  scenario: SmartDualScenario;
  badgeClass: string;
  accentColor: "emerald" | "rose";
  isBullish: boolean;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  badgeClass,
  accentColor,
  isBullish,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Title & Condition */}
      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
            {scenario.titleAr}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            احتمالية التحقق: <strong className="text-amber-400">{scenario.probabilityScore}%</strong>
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
          {scenario.conditionAr}
        </p>
        <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>شرط التفعيل: {scenario.triggerCondition}</span>
        </div>
      </div>

      {/* Target & Execution Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
        <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
          <span className="text-[9px] text-slate-400 font-['Cairo'] block">منطقة الدخول</span>
          <span className="text-xs font-bold text-white">{scenario.entryZone}</span>
        </div>
        <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
          <span className="text-[9px] text-rose-400 font-['Cairo'] block">وقف الخسارة (SL)</span>
          <span className="text-xs font-bold text-rose-300">{scenario.stopLoss}</span>
        </div>
        <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
          <span className="text-[9px] text-emerald-400 font-['Cairo'] block">الهدف الأول (TP1)</span>
          <span className="text-xs font-bold text-emerald-300">{scenario.takeProfit1}</span>
        </div>
        <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
          <span className="text-[9px] text-amber-400 font-['Cairo'] block">العائد/المخاطرة</span>
          <span className="text-xs font-bold text-amber-300">{scenario.riskReward}</span>
        </div>
      </div>

      {/* Institutional Rationale */}
      <div className="p-2 rounded bg-slate-950/40 border border-slate-850 text-[11px] text-slate-300 leading-relaxed">
        <strong className="text-slate-400 block text-[10px] mb-0.5">المنطق المؤسسي:</strong>
        {scenario.rationaleAr}
      </div>
    </div>
  );
};
