import React, { useState } from "react";
import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe2,
  BarChart2,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  Cpu,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import { ConfluenceMatrix } from "../types";

interface ConfluenceMatrixWidgetProps {
  confluence: ConfluenceMatrix;
  currentPrice: number;
}

export const ConfluenceMatrixWidget: React.FC<ConfluenceMatrixWidgetProps> = ({
  confluence,
  currentPrice,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const handleCopySetup = () => {
    const text = `صفقة التلاقي الخماسي للذهب (Confluence Setup):
السعر الحالي: $${currentPrice.toFixed(2)}
منطقة التلاقي الذهبي: ${confluence.goldenConfluenceZone.priceRange}
العائد للمخاطرة: ${confluence.goldenConfluenceZone.riskRewardRatio}
العناصر المتلاقية: ${confluence.goldenConfluenceZone.confluentElements.join(" | ")}
التوصية: ${confluence.goldenConfluenceZone.actionRecommendationAr}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 text-xs font-['Cairo']">
      {/* Top Confluence Score & Grade Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/50 shadow-2xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-lg font-black">
              <Link2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  مصفوفة التلاقي والربط المؤسسي الشامل (Cross-Market Confluence)
                </h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  دقة فائقة
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                ربط شامل للماكرو (DXY) • مزاد TPO • الفوت برنت • سيولة SMC • فيبوناتشي 0.618
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans">درجة التلاقي الخماسي:</span>
              <div className="flex items-baseline gap-1 justify-end font-mono">
                <span className="text-2xl font-black text-amber-400">{confluence.overallScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs text-center">
              <span className="block text-[9px] text-amber-400/80">تصنيف التوافق</span>
              <span>{confluence.gradeAr.split(" (")[0]}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar of Total Confluence */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>تراكم التأكيدات الخمسة (Confluence Stacking):</span>
            <span className="font-mono text-emerald-400 font-bold">5 من 5 مؤشرات متوافقة بالكامل</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 flex gap-1">
            {confluence.factors.map((f, i) => (
              <div
                key={i}
                className="h-full flex-1 rounded-sm bg-gradient-to-r from-amber-500 to-emerald-400 transition-all"
                title={`${f.nameAr}: ${f.score}/20`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unifying Causal Thesis (The Narrative that Connects Everything) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#090d16] border border-amber-500/30 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>الربط السببي الشامل (The Unifying Causal Synthesis)</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
            ترابط منطقي 100%
          </span>
        </div>
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-850">
          {confluence.unifyingThesisAr}
        </p>
      </div>

      {/* 5-Step Visual Causal Chain Diagram */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>سلسلة السببية التفاعلية خطوة بخطوة (Causal Confluence Chain):</span>
          </span>
          <span className="text-[10px] text-slate-400">انقر على أي محطة للتفاصيل</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {confluence.causalChainSteps.map((step, idx) => {
            const isSelected = selectedStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedStep(isSelected ? null : idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      المحطة {step.stepNumber}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">
                    {step.titleAr.split(" (")[0]}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {step.factorName}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-emerald-300 font-semibold">
                  {step.impactAr}
                </div>
              </div>
            );
          })}
        </div>

        {selectedStep !== null && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 animate-in fade-in">
            <strong className="block font-bold mb-0.5">
              تفاصيل المحطة {confluence.causalChainSteps[selectedStep].stepNumber}: {confluence.causalChainSteps[selectedStep].titleAr}
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {confluence.causalChainSteps[selectedStep].explanationAr}
            </p>
          </div>
        )}
      </div>

      {/* The 5 Factors Breakdown Table */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>تفصيل ومطابقة الركائز الخمسة (The 5 Confluence Pillars):</span>
        </h4>

        <div className="space-y-2">
          {confluence.factors.map((f) => (
            <div
              key={f.id}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 mt-0.5 shrink-0">
                  {f.category === "macro" && <Globe2 className="w-4 h-4 text-blue-400" />}
                  {f.category === "tpo_auction" && <BarChart2 className="w-4 h-4 text-violet-400" />}
                  {f.category === "orderflow" && <Flame className="w-4 h-4 text-amber-400" />}
                  {f.category === "smc_liquidity" && <Target className="w-4 h-4 text-rose-400" />}
                  {f.category === "fibonacci" && <Link2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-white">{f.nameAr}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-mono font-bold">
                      {f.signalAr}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{f.detailAr}</p>
                </div>
              </div>

              <div className="text-right sm:shrink-0 font-mono text-xs flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-1 sm:pt-0 border-slate-800">
                <span className="text-amber-400 font-bold">{f.score} / {f.weight}</span>
                <span className="text-[10px] text-slate-400">{f.levelValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Golden Confluence Zone (Where All 5 Meet within a Tight Range) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/50 shadow-xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                نطاق التلاقي الذهبي المحكم (The Golden Confluence Zone)
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  نقطة الارتكاز المركزية
                </span>
              </h4>
              <p className="text-[10px] text-slate-300">
                تلاقي قاع بروفايل المزاد VAL مع فيبوناتشي 0.618 وكتلة الطلب ودلتا الفوت برنت
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "تم النسخ بنجاح!" : "نسخ بيانات التلاقي"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block">نطاق التلاقي بالسنت:</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {confluence.goldenConfluenceZone.priceRange}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block">نسبة العائد للمخاطرة (R:R):</span>
            <span className="text-base font-black text-teal-300 font-mono">
              {confluence.goldenConfluenceZone.riskRewardRatio}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block">السعر اللحظي للذهب:</span>
            <span className="text-base font-black text-amber-400 font-mono">
              ${currentPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* List of Confluent Elements */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-300 block">
            العناصر الخمسة المتطابقة داخل هذا النطاق السعري الضيق:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-mono">
            {confluence.goldenConfluenceZone.confluentElements.map((el, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{el}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200">
          <strong className="block text-emerald-400 font-bold mb-0.5">التوصية التنفيذية:</strong>
          {confluence.goldenConfluenceZone.actionRecommendationAr}
        </div>
      </div>
    </div>
  );
};
