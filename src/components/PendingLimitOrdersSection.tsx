import React, { useState } from "react";
import {
  Clock,
  ShieldCheck,
  Target,
  Copy,
  Check,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { InstitutionalPendingLimitSetup } from "../types";

interface PendingLimitOrdersSectionProps {
  setups: InstitutionalPendingLimitSetup[];
  currentPrice: number;
  onRefresh?: () => void;
  compact?: boolean;
}

export const PendingLimitOrdersSection: React.FC<PendingLimitOrdersSectionProps> = ({
  setups,
  currentPrice,
  onRefresh,
  compact = false,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "BUY LIMIT" | "SELL LIMIT">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(setups[0]?.id || null);

  const filteredSetups = setups.filter((s) => {
    if (selectedFilter === "ALL") return true;
    return s.orderType === selectedFilter;
  });

  const handleCopyCommand = (setup: InstitutionalPendingLimitSetup) => {
    navigator.clipboard.writeText(setup.mtCommand);
    setCopiedId(setup.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4 text-xs font-['Cairo']">
      {/* Top Banner */}
      {!compact && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/40 border-2 border-emerald-500/40 shadow-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-lg font-black">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    صفقات Limit المعلقة فائقة الدقة والضمان (A++ Pending Limits)
                  </h3>
                  <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                    مضمونة بنسبة 98%+
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  السعر لم يصل إليها بعد — أوامر معلقة مدروسة رقمياً تتمركز عند مصائد السيولة والجيب الذهبي
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 block font-['Cairo']">السعر اللحظي:</span>
                <span className="text-lg font-black text-amber-400">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === "ALL"
                  ? "bg-emerald-500 text-slate-950 shadow-sm font-black"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              جميع الأوامر المعلقة ({setups.length})
            </button>
            <button
              onClick={() => setSelectedFilter("BUY LIMIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFilter === "BUY LIMIT"
                  ? "bg-emerald-500 text-slate-950 shadow-sm font-black"
                  : "bg-slate-900 text-emerald-400 hover:text-white border border-emerald-500/30"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>أمر BUY LIMIT (القاع الذهبي)</span>
            </button>
            <button
              onClick={() => setSelectedFilter("SELL LIMIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFilter === "SELL LIMIT"
                  ? "bg-rose-500 text-white shadow-sm font-black"
                  : "bg-slate-900 text-rose-400 hover:text-white border border-rose-500/30"
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>أمر SELL LIMIT (سقف السيولة)</span>
            </button>
          </div>
        </div>
      )}

      {/* Pending Orders Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSetups.map((setup) => {
          const isBuy = setup.orderType === "BUY LIMIT";
          const isExpanded = expandedId === setup.id;
          const isCopied = copiedId === setup.id;

          return (
            <div
              key={setup.id}
              className={`rounded-2xl border-2 transition-all overflow-hidden shadow-xl ${
                isBuy
                  ? "bg-gradient-to-br from-[#0c131d] to-[#080d15] border-emerald-500/40 hover:border-emerald-400"
                  : "bg-gradient-to-br from-[#180c13] to-[#0d070b] border-rose-500/40 hover:border-rose-400"
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider flex items-center gap-1.5 shadow-md ${
                        isBuy
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{setup.orderType}</span>
                    </span>

                    <span className="text-xs sm:text-sm font-bold text-white">
                      {setup.titleAr}
                    </span>

                    <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      ثقة {setup.probabilityScore}%
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyCommand(setup)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md ${
                      isCopied
                        ? "bg-emerald-400 text-slate-950 font-black scale-105"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? "تم النسخ لـ MT4/MT5!" : "نسخ الأمر المعلق"}</span>
                  </button>
                </div>

                {/* Distance & Approach Status Banner */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span className="text-slate-300 font-semibold text-xs">
                      حالة الأمر: <strong className="text-white">لم يصل السعر بعد</strong> (يبعد{" "}
                      <strong className="text-amber-400 font-mono font-bold">
                        ${setup.distanceDollars}
                      </strong>{" "}
                      أو{" "}
                      <strong className="text-amber-400 font-mono font-bold">
                        {setup.distancePips} نقطة
                      </strong>
                      )
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    نطاق الارتكاز: <span className="text-emerald-300 font-bold">{setup.institutionalOrderBlockZone}</span>
                  </span>
                </div>

                {/* Visual Progress Bar to Limit Price */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>مدى اقتراب السعر اللحظي من نقطة التنفيذ:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {setup.approachProgressPercent}% مسار الوصول
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBuy
                          ? "bg-gradient-to-r from-teal-500 to-emerald-400"
                          : "bg-gradient-to-r from-amber-500 to-rose-400"
                      }`}
                      style={{ width: `${setup.approachProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Parameters Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">سعر اللمت المعلق (Entry):</span>
                    <span className="text-base font-black text-amber-300">
                      ${setup.limitPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">وقف الخسارة (Stop Loss):</span>
                    <span className="text-base font-black text-rose-400">
                      ${setup.stopLoss.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-['Cairo'] mt-0.5">
                      مخاطرة: {setup.slDistancePips} نقطة (${setup.slDistanceDollars})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">الهدف الأول TP1:</span>
                    <span className="text-base font-black text-emerald-400">
                      ${setup.tp1.price.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-emerald-300 block font-['Cairo'] mt-0.5">
                      ربح: +{setup.tp1.profitPips} نقطة (${setup.tp1.profitDollars})
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">العائد للمخاطرة (R:R):</span>
                    <span className="text-base font-black text-teal-300">
                      {setup.riskRewardRatio}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-['Cairo'] mt-0.5">
                      نسبة ربح ممتازة
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Deep Details (Guarantee Proof & Confluence Pillars) */}
              <div className="p-4 sm:p-5 bg-slate-950/60 space-y-3">
                {/* Why Guaranteed Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : setup.id)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>لماذا هذه الصفقة المعلقة مضمونة جداً؟ (The Guarantee Proof)</span>
                  </div>

                  <button className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]">
                    <span>{isExpanded ? "إخفاء التفاصيل" : "عرض أسباب الضمان"}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Guarantee Summary */}
                <p className="text-slate-200 text-xs leading-relaxed bg-[#0a0e17] p-3 rounded-xl border border-slate-800">
                  {setup.guaranteeReasonSummaryAr}
                </p>

                {isExpanded && (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                    {/* The 4 Pillars Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {setup.confluencePillars.map((pillar, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {pillar.pillar}
                            </span>
                            <span className="text-[11px] text-slate-300 leading-relaxed block mt-0.5">
                              {pillar.descriptionAr}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Targets Breakdown (TP1, TP2, TP3) */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span>خريطة الأهداف الكاملة بعد تفعيل اللمت:</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold">الهدف الأول TP1</span>
                            <span className="text-white font-bold">${setup.tp1.price.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-['Cairo'] block mt-1">
                            +{setup.tp1.profitPips} نقطة • {setup.tp1.descriptionAr}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold">الهدف الثاني TP2</span>
                            <span className="text-white font-bold">${setup.tp2.price.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-['Cairo'] block mt-1">
                            +{setup.tp2.profitPips} نقطة • {setup.tp2.descriptionAr}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold">الهدف الممتد TP3</span>
                            <span className="text-white font-bold">${setup.tp3.price.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-['Cairo'] block mt-1">
                            +{setup.tp3.profitPips} نقطة • {setup.tp3.descriptionAr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Copyable MT Command Box */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      <div className="font-mono text-xs text-amber-300 flex items-center gap-2">
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-['Cairo']">
                          أمر منصات التداول
                        </span>
                        <span>{setup.mtCommand}</span>
                      </div>

                      <button
                        onClick={() => handleCopyCommand(setup)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        {isCopied ? "تم النسخ!" : "نسخ الكود"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
