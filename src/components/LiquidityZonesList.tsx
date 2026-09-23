import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BookOpen,
  Sparkles,
  Info,
} from "lucide-react";
import { LiquidityZone, DualSmartLevel } from "../types";
import { generateDualSmartLevels } from "../services/correlationService";
import { LiquidityExplainerModal } from "./LiquidityExplainerModal";

interface LiquidityZonesListProps {
  zones: LiquidityZone[];
  currentPrice: number;
  dualLevels?: {
    upperLevel: DualSmartLevel;
    lowerLevel: DualSmartLevel;
  };
  onOpenDualLevelsModal?: () => void;
}

export const LiquidityZonesList: React.FC<LiquidityZonesListProps> = ({
  zones,
  currentPrice,
  dualLevels,
  onOpenDualLevelsModal,
}) => {
  const [showDualCard, setShowDualCard] = useState(true);
  const [selectedZoneForExplain, setSelectedZoneForExplain] = useState<LiquidityZone | null>(null);
  const [hoveredTooltipZoneId, setHoveredTooltipZoneId] = useState<string | null>(null);

  const levels = dualLevels || generateDualSmartLevels(currentPrice, zones);
  const { upperLevel, lowerLevel } = levels;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none font-['Cairo']">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>رادار كشف مناطق السيولة (Liquidity Pools Radar)</span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          {zones.length} مناطق نشطة
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {/* Dynamic Dual Smart Levels (Upper Buy & Lower Sell) */}
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>المستويات الذكية المرنة (Flex Dual Levels)</span>
            </div>
            <div className="flex items-center gap-1">
              {onOpenDualLevelsModal && (
                <button
                  onClick={onOpenDualLevelsModal}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  تفاصيل ←
                </button>
              )}
              <button
                onClick={() => setShowDualCard(!showDualCard)}
                className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                {showDualCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showDualCard && (
            <div className="space-y-1.5 pt-1">
              {/* Upper Level */}
              <div className="p-2 rounded bg-slate-950/70 border border-rose-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                    المستوى الشرائي العلوي (فوق السعر)
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    ${upperLevel.levelPrice.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-center">
                    🟢 اختراق: شراء ذكي
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20 text-center">
                    🔴 ارتداد: بيع ذكي
                  </div>
                </div>
              </div>

              {/* Lower Level */}
              <div className="p-2 rounded bg-slate-950/70 border border-sky-500/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-sky-400" />
                    المستوى البيعي السفلي (تحت السعر)
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    ${lowerLevel.levelPrice.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
                  <div className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20 text-center">
                    🔴 كسر: بيع ذكي
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-center">
                    🟢 ارتداد: شراء ذكي
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zones List Header */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1 pt-1">
          <span>أحواض السيولة الكلاسيكية المرصودة:</span>
          <span className="text-amber-400/90 flex items-center gap-1">
            <Info className="w-3 h-3" />
            اضغط "تفسير الهيكل" لفهم سياق الـ BSL و SSL
          </span>
        </div>

        {zones.map((zone) => {
          const isAbove = zone.priceBottom > currentPrice;
          const distPrice = Math.abs(currentPrice - (zone.priceTop + zone.priceBottom) / 2);
          const pips = (distPrice * 10).toFixed(0);

          let badgeClass = "";
          let badgeLabel = "";
          let structureReason = "";

          if (zone.type === "BSL") {
            badgeClass = "bg-rose-500/15 border-rose-500/30 text-rose-300";
            badgeLabel = "سيولة شراء علوية (BSL)";
            structureReason = "قمة رئيسية / تكدس أوامر وقف الخسارة للبيع (Buy Stops)";
          } else if (zone.type === "SSL") {
            badgeClass = "bg-emerald-500/15 border-emerald-500/30 text-emerald-300";
            badgeLabel = "سيولة بيع سفلية (SSL)";
            structureReason = "قاع رئيسي / تكدس أوامر وقف الخسارة للشراء (Sell Stops)";
          } else {
            badgeClass = "bg-amber-500/15 border-amber-500/30 text-amber-300";
            badgeLabel = "فجوة قيمة عادلة (FVG)";
            structureReason = "اختلال سعري مؤسسي (Imbalance Void)";
          }

          const isHovered = hoveredTooltipZoneId === zone.id;

          return (
            <div
              key={zone.id}
              className={`relative p-2.5 rounded-xl border transition-all ${
                zone.status === "swept"
                  ? "bg-slate-900/40 border-slate-800/60 opacity-60"
                  : "bg-slate-900/80 border-slate-750 hover:border-slate-700 shadow-xs"
              }`}
            >
              {/* Row 1: Badges, Distance & Explain Trigger Button */}
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                    {badgeLabel}
                  </span>

                  {/* Visual 'Explain' Trigger Button with Tooltip Support */}
                  <div className="relative">
                    <button
                      onClick={() => setSelectedZoneForExplain(zone)}
                      onMouseEnter={() => setHoveredTooltipZoneId(zone.id)}
                      onMouseLeave={() => setHoveredTooltipZoneId(null)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 hover:text-amber-200 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="تفسير سبب تصنيف المنطقة كهيكل BSL/SSL"
                    >
                      <HelpCircle className="w-3 h-3 text-amber-400" />
                      <span>تفسير الهيكل (Explain)</span>
                    </button>

                    {/* Inline Quick Visual Tooltip */}
                    {isHovered && (
                      <div className="absolute top-full right-0 mt-1.5 z-40 w-64 p-2 rounded-lg bg-slate-950 border border-amber-500/40 shadow-xl text-[11px] text-slate-200 animate-in fade-in zoom-in-95 pointer-events-none">
                        <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>سياق هيكل السوق:</span>
                        </div>
                        <p className="leading-tight text-slate-300 mb-1">{structureReason}</p>
                        <span className="text-[10px] text-amber-400/90 font-semibold block">
                          اضغط لفتح التقرير التحليلي الكامل ومخطط صانع السوق ←
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-['JetBrains_Mono'] text-slate-300 flex items-center gap-1">
                  {isAbove ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  يبعد {distPrice.toFixed(2)}$ ({pips} pt)
                </span>
              </div>

              {/* Row 2: Name & Price Boundaries */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold text-white">{zone.nameAr}</span>
                <span className="font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
                  ${zone.priceBottom.toFixed(2)} - ${zone.priceTop.toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 leading-relaxed mb-1.5">{zone.description}</p>

              {/* Structural Context Quick Banner */}
              <div className="mb-2 px-2 py-1 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>الدافع الهيكلي:</span>
                  <strong className="text-slate-200">{structureReason}</strong>
                </span>
                <button
                  onClick={() => setSelectedZoneForExplain(zone)}
                  className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer"
                >
                  تفاصيل أكثر
                </button>
              </div>

              {/* Row 3: Volume Cluster & Live Status */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  حجم السيولة التقديري:{" "}
                  <strong className="text-slate-200 font-['JetBrains_Mono']">
                    {zone.volumeCluster} Lot
                  </strong>
                </span>
                <span
                  className={`font-semibold ${
                    zone.status === "swept"
                      ? "text-rose-400"
                      : zone.status === "mitigated"
                      ? "text-slate-400"
                      : "text-emerald-400"
                  }`}
                >
                  {zone.status === "swept"
                    ? "⚠️ تم سحب السيولة (Swept)"
                    : zone.status === "mitigated"
                    ? "✓ تم التخفيف"
                    : "🎯 هدف نشط (Untested)"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liquidity Zone Market Structure Explainer Modal */}
      <LiquidityExplainerModal
        zone={selectedZoneForExplain}
        currentPrice={currentPrice}
        onClose={() => setSelectedZoneForExplain(null)}
      />
    </div>
  );
};
