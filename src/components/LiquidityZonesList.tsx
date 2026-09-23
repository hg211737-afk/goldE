import React, { useState, useMemo } from "react";
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
  BarChart3,
  PieChart,
  Filter,
  CheckCircle2,
  AlertTriangle,
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

type FilterType = "all" | "untested" | "swept" | "bsl" | "ssl";

export const LiquidityZonesList: React.FC<LiquidityZonesListProps> = ({
  zones,
  currentPrice,
  dualLevels,
  onOpenDualLevelsModal,
}) => {
  const [showDualCard, setShowDualCard] = useState(true);
  const [showStatsCard, setShowStatsCard] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedZoneForExplain, setSelectedZoneForExplain] = useState<LiquidityZone | null>(null);
  const [hoveredTooltipZoneId, setHoveredTooltipZoneId] = useState<string | null>(null);

  const levels = dualLevels || generateDualSmartLevels(currentPrice, zones);
  const { upperLevel, lowerLevel } = levels;

  // --- Dynamic Liquidity Statistics Calculations ---
  const stats = useMemo(() => {
    const total = zones.length;
    const swept = zones.filter((z) => z.status === "swept");
    const untested = zones.filter((z) => z.status === "untested");
    const mitigated = zones.filter((z) => z.status === "mitigated");

    const bslZones = zones.filter((z) => z.type === "BSL");
    const sslZones = zones.filter((z) => z.type === "SSL");
    const fvgZones = zones.filter((z) => z.type.includes("FVG"));

    const sweptPct = total > 0 ? Math.round((swept.length / total) * 100) : 0;
    const untestedPct = total > 0 ? Math.round((untested.length / total) * 100) : 0;

    // Liquidity Concentration relative to Current Price
    const aboveZones = zones.filter((z) => z.priceBottom >= currentPrice);
    const belowZones = zones.filter((z) => z.priceTop <= currentPrice);
    const spanningZones = zones.filter(
      (z) => z.priceBottom < currentPrice && z.priceTop > currentPrice
    );

    const volAbove = aboveZones.reduce((sum, z) => sum + (z.volumeCluster || 0), 0);
    const volBelow = belowZones.reduce((sum, z) => sum + (z.volumeCluster || 0), 0);
    const volSpanning = spanningZones.reduce((sum, z) => sum + (z.volumeCluster || 0), 0);
    const totalVolume = volAbove + volBelow + volSpanning || 1;

    const abovePct = Math.round((volAbove / totalVolume) * 100);
    const belowPct = Math.round((volBelow / totalVolume) * 100);

    const dominantSide: "above" | "below" = volAbove >= volBelow ? "above" : "below";
    const dominantPct = dominantSide === "above" ? abovePct : belowPct;
    const dominantVol = dominantSide === "above" ? volAbove : volBelow;
    const dominantCount = dominantSide === "above" ? aboveZones.length : belowZones.length;

    return {
      total,
      sweptCount: swept.length,
      untestedCount: untested.length,
      mitigatedCount: mitigated.length,
      bslCount: bslZones.length,
      sslCount: sslZones.length,
      fvgCount: fvgZones.length,
      sweptPct,
      untestedPct,
      volAbove,
      volBelow,
      abovePct,
      belowPct,
      dominantSide,
      dominantPct,
      dominantVol,
      dominantCount,
    };
  }, [zones, currentPrice]);

  // Filtered zones list
  const filteredZones = useMemo(() => {
    switch (activeFilter) {
      case "untested":
        return zones.filter((z) => z.status === "untested");
      case "swept":
        return zones.filter((z) => z.status === "swept");
      case "bsl":
        return zones.filter((z) => z.type === "BSL");
      case "ssl":
        return zones.filter((z) => z.type === "SSL");
      default:
        return zones;
    }
  }, [zones, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none font-['Cairo']">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>رادار كشف مناطق السيولة (Liquidity Pools Radar)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono font-bold">
            {stats.total} مناطق
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {/* ============================================================== */}
        {/* NEW: DEDICATED LIQUIDITY STATS PANEL (لوحة إحصائيات السيولة) */}
        {/* ============================================================== */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#121827] via-[#0f1422] to-[#0a0e17] border border-amber-500/30 shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>لوحة إحصائيات السيولة (Liquidity Stats Panel)</span>
            </div>
            <button
              onClick={() => setShowStatsCard(!showStatsCard)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
              title="طي أو فتح الإحصائيات"
            >
              {showStatsCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showStatsCard && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              {/* Row 1: Total Zones & Swept vs Untested Ratio */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {/* Metric 1: Total Zones & Types Breakdown */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    إجمالي مناطق السيولة المرصودة
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-base sm:text-lg font-black font-['JetBrains_Mono'] text-white">
                      {stats.total}
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">منطقة</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 flex-wrap">
                    <span className="text-rose-400 font-bold">{stats.bslCount} BSL</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{stats.sslCount} SSL</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{stats.fvgCount} FVG</span>
                  </div>
                </div>

                {/* Metric 2: Swept vs Untested Ratio */}
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      {stats.untestedPct}% نشطة
                    </span>
                    <span className="text-rose-400 flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {stats.sweptPct}% مكتسحة
                    </span>
                  </div>

                  {/* Progress Ratio Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full mt-2 overflow-hidden flex border border-slate-800">
                    <div
                      style={{ width: `${stats.untestedPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`أهداف نشطة غير مكتسحة: ${stats.untestedCount}`}
                    />
                    <div
                      style={{ width: `${stats.sweptPct}%` }}
                      className="bg-rose-500 h-full transition-all duration-500"
                      title={`مناطق تم اكتساحها: ${stats.sweptCount}`}
                    />
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1.5 block font-mono">
                    {stats.untestedCount} هدف نشط • {stats.sweptCount} مسحوبة
                  </span>
                </div>
              </div>

              {/* Row 2: Dominant Liquidity Concentration Banner */}
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-amber-500/25 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                    <PieChart className="w-3.5 h-3.5 text-amber-400" />
                    <span>تركيز السيولة الأكبر بالنسبة للسعر:</span>
                  </span>
                  <span className="font-black text-amber-400 font-['JetBrains_Mono'] text-xs">
                    {stats.dominantPct}% ({stats.dominantVol.toFixed(0)} Lot)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    {stats.dominantSide === "above" ? (
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {stats.dominantSide === "above"
                        ? `سيولة شراء علوية (BSL) فوق $${currentPrice.toFixed(2)}`
                        : `سيولة بيع سفلية (SSL) تحت $${currentPrice.toFixed(2)}`}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {stats.dominantCount} مناطق تكتل
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed pt-0.5 border-t border-slate-800/80">
                  {stats.dominantSide === "above"
                    ? "🧲 مغناطيس صاعد: تكتل أحجام سيولة الشراء فوق السعر الحالي يجذب حركة صناع السوق لسحب أوامر الوقف (Buy Stops Sweep)."
                    : "🧲 مغناطيس هابط: تكتل أوامر البيع ووقف الخسارة أسفل السعر الحالي يمثل هدف سحب محتمل (Sell Stops Run)."}
                </p>
              </div>
            </div>
          )}
        </div>

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

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-semibold no-scrollbar">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3 h-3" />
            تصفية:
          </span>
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
              activeFilter === "all"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            الكل ({zones.length})
          </button>
          <button
            onClick={() => setActiveFilter("untested")}
            className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
              activeFilter === "untested"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800"
            }`}
          >
            أهداف نشطة ({stats.untestedCount})
          </button>
          <button
            onClick={() => setActiveFilter("swept")}
            className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
              activeFilter === "swept"
                ? "bg-rose-500 text-slate-950 font-bold"
                : "bg-slate-900 text-rose-400/80 hover:text-rose-300 border border-slate-800"
            }`}
          >
            مكتسحة ({stats.sweptCount})
          </button>
          <button
            onClick={() => setActiveFilter("bsl")}
            className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
              activeFilter === "bsl"
                ? "bg-indigo-600 text-white font-bold"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            BSL علوي ({stats.bslCount})
          </button>
          <button
            onClick={() => setActiveFilter("ssl")}
            className={`px-2 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
              activeFilter === "ssl"
                ? "bg-teal-600 text-white font-bold"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            SSL سفلي ({stats.sslCount})
          </button>
        </div>

        {/* Zones List Header */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1 pt-1">
          <span>قائمة أحواض السيولة ({filteredZones.length}):</span>
          <span className="text-amber-400/90 flex items-center gap-1">
            <Info className="w-3 h-3" />
            اضغط "تفسير الهيكل" لشرح الـ ICT/SMC
          </span>
        </div>

        {filteredZones.map((zone) => {
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
