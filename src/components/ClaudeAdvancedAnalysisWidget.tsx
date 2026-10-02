import React from "react";
import {
  Bot,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  Layers,
  Globe2,
  Newspaper,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Flame,
  Zap,
} from "lucide-react";
import { ClaudeAnalysisResult } from "../types";
import { UnifiedAiSuperConfluenceCard } from "./UnifiedAiSuperConfluenceCard";

interface ClaudeAdvancedAnalysisWidgetProps {
  analysis: ClaudeAnalysisResult;
  currentPrice: number;
}

export const ClaudeAdvancedAnalysisWidget: React.FC<ClaudeAdvancedAnalysisWidgetProps> = ({
  analysis,
  currentPrice,
}) => {
  const isBullish = analysis.bias.toLowerCase().includes("bull");
  const liq = analysis.liquidityIntelligence;
  const news = analysis.newsIntelligence;
  const session = analysis.sessionIntelligence;

  return (
    <div className="space-y-4 text-xs font-['Cairo']">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/40 border-2 border-orange-500/40 shadow-2xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-rose-600 text-white shadow-lg font-black">
              <Bot className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  تحليل Claude 3.7 المتطور: السيولة • الأخبار • الجلسات
                </h3>
                <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                  SMC &amp; Macro Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                تفكيك احترافي لمصائد السيولة، وتوقيت الكيل زون، ومحفزات الأخبار الاقتصادية الكبرى
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">قوة التحليل:</span>
              <span className="text-xl font-black text-orange-400">
                {analysis.confidenceScore}%
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs">
              {analysis.tradeSetup.action === "BUY" ? "شراء تمددي" : "بيع تصريفي"}
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          {analysis.summaryAr}
        </p>
      </div>

      {/* Unified AI Super-Confluence: Connecting Whales, Monte Carlo, Central Banks & Squeeze */}
      <UnifiedAiSuperConfluenceCard
        currentPrice={currentPrice}
        engineName="Claude 3.7 Sonnet"
        superConfluence={analysis.superConfluenceSynthesis}
      />

      {/* 3 Dedicated Pillars Grid: 1. Liquidity | 2. News | 3. Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Pillar 1: Advanced SMC Liquidity */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#111928] to-[#0c101c] border border-blue-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>١. هندسة السيولة الذكية (SMC Liquidity)</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.2 rounded-full font-mono">
              {liq?.marketState || "Discount"}
            </span>
          </div>

          <div className="space-y-2 font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">حوض سيولة القمم (BSL):</span>
              <span className="text-xs font-bold text-emerald-400">
                {liq?.bslPoolLevel || `$${analysis.keyLevels.target1}`}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">سيولة القيعان (SSL):</span>
              <span className="text-xs font-bold text-rose-400">
                {liq?.sslPoolLevel || `$${analysis.keyLevels.bounceLevel}`}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">فجوة القيمة العادلة (FVG):</span>
              <span className="text-xs font-bold text-amber-300">
                {liq?.fvgImbalanceZone || "$4,287.50 - $4,291.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">فخ الإغراء (Inducement):</span>
              <span className="text-xs font-bold text-violet-300">
                {liq?.inducementTrapLevel || analysis.liquidityInducementAr}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-200 leading-relaxed font-['Cairo']">
            <strong className="block text-blue-400 mb-0.5">مرحلة دورة السيولة:</strong>
            {liq?.liquidityCycleStageAr || "اكتمال تفريغ السيولة الخارجية وبدء التوسع الداخلي."}
          </div>
        </div>

        {/* Pillar 2: High-Impact Macro & Economic News */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1b1424] to-[#100c17] border border-amber-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Newspaper className="w-4 h-4 text-amber-400" />
              <span>٢. الأخبار والماكرو (Macro News)</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded-full font-bold">
              {news?.volatilityRiskLevel || "High Volatility"}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300 block">الأحداث والبيانات المؤثرة:</span>
            <div className="space-y-1.5">
              {(news?.upcomingEventsAr || [
                "تقرير مؤشر أسعار المستهلكين Core CPI",
                "تصريحات رئيس الفيدرالي جيروم باول",
                "طلبات إعانة البطالة الأسبوعية US Jobless",
              ]).map((event, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-850 flex items-center gap-2 text-[11px] text-slate-200"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{event}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
              <strong className="block text-amber-400 mb-0.5">تأثير الفائدة والدولار DXY:</strong>
              {news?.sentimentImpactAr || "البيانات التضخمية تضعف DXY وتدعم الذهب كملاذ آمن."}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <strong className="block text-white mb-0.5">الأطروحة الماكرو الشاملة:</strong>
              {news?.catalystThesisAr || "تلاقي البيانات مع التوترات الجيوسياسية يحمي قيعان الذهب."}
            </div>
          </div>
        </div>

        {/* Pillar 3: Market Sessions & Killzone Timing */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#14201c] to-[#0a1410] border border-emerald-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>٣. الجلسات وتوقيت الكيل زون</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-full font-bold">
              نشط الآن
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-400 block">الجلسة اللحظية النشطة:</span>
              <span className="text-xs font-bold text-emerald-300 block">
                {session?.activeSessionAr || "تداخل جلسة لندن ونيويورك (London - NY Overlap)"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-400 block">نافذة رصاصة الفضة (Silver Bullet):</span>
              <span className="text-xs font-bold text-amber-300 font-mono block">
                {session?.silverBulletTimeWindowAr || "14:00 - 15:00 UTC (10:00 - 11:00 AM EST)"}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {session?.killzoneStatusAr || "أعلى تدفق تنفيذي للأوامر المؤسسية"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-400 block">فخ جوداس (Judas Swing Trap):</span>
              <span className="text-xs font-semibold text-rose-300 block">
                {session?.judasSwingAr || "تم كسر القاع اللحظي كفخ بيعي وهمي لاصطياد الستوبات"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-200 leading-relaxed">
              <strong className="block text-emerald-400 mb-0.5">اصطياد النطاق الآسيوي:</strong>
              {session?.asianRangeRaidStatusAr || "تم سحب قاع آسيا بالكامل لتفريغ حمولة البائعين."}
            </div>
          </div>
        </div>
      </div>

      {/* Structural Trade Setup by Claude */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/30 via-slate-900 to-amber-950/30 border border-orange-500/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            <span>خطة التداول المؤسسية المقترحة من Claude 3.7:</span>
          </h4>
          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
            العائد للمخاطرة {analysis.tradeSetup.riskReward}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">نطاق الدخول (Entry):</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">{analysis.tradeSetup.entryZone}</span>
          </div>

          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">وقف الخسارة (SL):</span>
            <span className="text-xs sm:text-sm font-bold text-rose-400">{analysis.tradeSetup.stopLoss}</span>
          </div>

          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">الهدف الأول (TP1):</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400">{analysis.tradeSetup.takeProfit1}</span>
          </div>

          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">الهدف الثاني (TP2):</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400">{analysis.tradeSetup.takeProfit2}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <strong className="text-amber-400 block mb-0.5">المنطق الهيكلي للصفقة:</strong>
          {analysis.tradeSetup.rationaleAr}
        </div>

        <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-200">
          <strong className="text-orange-400 block mb-0.5">نصيحة كلود للمتداول:</strong>
          {analysis.keyAdvice}
        </div>
      </div>
    </div>
  );
};
