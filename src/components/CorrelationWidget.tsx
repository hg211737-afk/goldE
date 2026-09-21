import React, { useState } from "react";
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Zap,
  Info,
  ChevronRight,
  Activity,
} from "lucide-react";
import { MacroCorrelationReport, CorrelationAsset } from "../types";

interface CorrelationWidgetProps {
  report: MacroCorrelationReport;
  goldPrice: number;
  onRefresh?: () => void;
  compact?: boolean;
}

export const CorrelationWidget: React.FC<CorrelationWidgetProps> = ({
  report,
  goldPrice,
  onRefresh,
  compact = false,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<CorrelationAsset>(
    report.assets[0] || null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const isBullishAlignment = report.alignmentScore >= 60;
  const isBearishAlignment = report.alignmentScore <= 40;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Globe2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>ارتباط الذهب بمؤشر الدولار والعملات</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                DXY & FX
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              showExplanation
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="شرح معادلة الارتباط الماكرو"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Explanation toggle */}
        {showExplanation && (
          <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-[11px] text-slate-300 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>كيف يؤثر مؤشر الدولار DXY والعملات على الذهب؟</span>
            </div>
            <p>
              • <strong>مؤشر الدولار (DXY):</strong> علاقة عكسية قوية (~ -0.91). ضعف الدولار يعزز جاذبية الذهب فورياً كأصل احتياطي خالي من مخاطر العملة الورقية.
            </p>
            <p>
              • <strong>الفضة (XAG/USD):</strong> علاقة طردية قوية (+0.88). حركة الفضة استباقية وتؤكد مصداقية كسر المقاومات في الذهب.
            </p>
            <p>
              • <strong>عوائد السندات (US10Y):</strong> انخفاض العوائد يقلل تكلفة الاحتفاظ بالذهب ويوجه الصناديق الاستثمارية نحوه.
            </p>
          </div>
        )}

        {/* Institutional Macro Alignment Score */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isBullishAlignment
              ? "bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 border-emerald-500/30"
              : isBearishAlignment
              ? "bg-gradient-to-r from-rose-500/10 via-slate-900 to-slate-900 border-rose-500/30"
              : "bg-slate-900/80 border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>مؤشر التوافق المؤسسي للذهب</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-['JetBrains_Mono'] ${
                isBullishAlignment
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isBearishAlignment
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {report.alignmentScore}% توافق
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isBullishAlignment
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : isBearishAlignment
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : "bg-gradient-to-r from-amber-500 to-sky-400"
              }`}
              style={{ width: `${report.alignmentScore}%` }}
            />
          </div>

          <p className="text-[11px] font-semibold text-slate-200">
            {report.overallSentimentAr}
          </p>
        </div>

        {/* Macro Divergence Alert (if any) */}
        {report.divergenceDetected && report.divergenceAlertAr && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-amber-200">
              <strong className="block text-amber-300 mb-0.5">
                تنبيه انفصال ماكرو (Macro Divergence):
              </strong>
              {report.divergenceAlertAr}
            </div>
          </div>
        )}

        {/* DXY Spotlight Card */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-750 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 font-mono">
                $
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  مؤشر الدولار الأمريكي (DXY)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  معامل الارتباط: -0.91 (عكسي شديد)
                </span>
              </div>
            </div>

            {report.assets[0] && (
              <div className="text-left">
                <span className="text-sm font-bold text-white font-mono block">
                  {report.assets[0].price.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                    report.assets[0].changePercent24h >= 0
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {report.assets[0].changePercent24h >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {report.assets[0].changePercent24h >= 0 ? "+" : ""}
                  {report.assets[0].changePercent24h.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800/80 leading-relaxed">
            {report.dxyAnalysisAr}
          </p>
        </div>

        {/* Other Correlated Assets Grid */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 block px-1">
            سلة الأصول والعملات المرتبطة:
          </span>

          <div className="grid grid-cols-1 gap-1.5">
            {report.assets.map((asset) => {
              const isSelected = selectedAsset?.symbol === asset.symbol;
              const isPositiveChange = asset.changePercent24h >= 0;
              const isBullishForGold = asset.goldImpact === "bullish";

              return (
                <div
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-850 border-amber-500/50 shadow-xs"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] font-mono ${
                          asset.correlationType === "inverse"
                            ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white">
                            {asset.symbol}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {asset.nameAr}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">
                          ارتباط {asset.correlationCoef > 0 ? "+" : ""}
                          {asset.correlationCoef.toFixed(2)}{" "}
                          ({asset.correlationType === "inverse" ? "عكسي" : "طردي"})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-left font-mono">
                        <span className="text-xs font-bold text-slate-200 block">
                          {asset.symbol === "EUR/USD"
                            ? asset.price.toFixed(4)
                            : asset.symbol === "US10Y"
                            ? `${asset.price.toFixed(2)}%`
                            : asset.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isPositiveChange ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositiveChange ? "+" : ""}
                          {asset.changePercent24h.toFixed(2)}%
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isBullishForGold
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {isBullishForGold ? "داعمة للذهب" : "ضاغطة للذهب"}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-slate-850 text-[11px] text-slate-300 leading-relaxed">
                      {asset.impactDescriptionAr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Summary */}
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>القرار المؤسسي بناءً على الماكرو:</span>
          </div>
          <p>{report.institutionalAdviceAr}</p>
        </div>
      </div>
    </div>
  );
};
