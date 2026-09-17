import React from 'react';
import { AIAnalysisResult } from '../types';
import {
  X,
  Cpu,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RotateCw,
  Award,
} from 'lucide-react';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIAnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentPrice: number;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onRefresh,
  currentPrice,
}) => {
  if (!isOpen) return null;

  const isBullish = analysis?.bias?.includes('صاعد') || analysis?.bias?.toLowerCase().includes('bullish');
  const isBearish = analysis?.bias?.includes('هابط') || analysis?.bias?.toLowerCase().includes('bearish');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#111622] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden text-slate-100 font-['Cairo']">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                محلل الأوردر فلو والسيولة الذكي (Gemini AI)
                <span className="text-[10px] bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded font-mono">
                  XAU/USD
                </span>
              </h2>
              <p className="text-xs text-slate-400">تحليل تدفق الأوامر واصطياد السيولة المؤسسية بدقة عالية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="تحديث التحليل"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                <Cpu className="absolute inset-0 m-auto w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">جاري تحليل دفتر الأوامر وشارت الفوت برنت...</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  يقوم الذكاء الاصطناعي برصد اختلالات الدلتا ومناطق تجمع السيولة (BSL & SSL) وحساب احتمالات سحب السيولة
                </p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Bias & Confidence Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isBullish
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isBearish
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    {isBullish ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">الاتجاه المؤسسي</span>
                    <span className="text-sm font-bold">{analysis.bias}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">نسبة ثقة التحليل</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        {analysis.confidenceScore}%
                      </span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                          style={{ width: `${analysis.confidenceScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">السعر اللحظي للذهب</span>
                    <span className="text-sm font-bold text-white font-mono">
                      ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>الملخص التنفيذي لسلوك صناع السوق</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {analysis.summary}
                </p>
              </div>

              {/* Liquidity Analysis */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>خارطة السيولة المستهدفة (BSL / SSL Sweep Targets)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {analysis.liquidityAnalysis}
                </p>
              </div>

              {/* Order Flow & Footprint Delta */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>قراءة تدفق الأوامر ودلتا الفوت برنت (Order Flow & Delta)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {analysis.orderFlowInsight}
                </p>
              </div>

              {/* Proposed Trade Setup */}
              {analysis.setup && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>خطة التداول المؤسسية المقترحة (Institutional Setup)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[11px]">
                      {analysis.setup.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-['JetBrains_Mono']">
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-['Cairo'] block">نطاق الدخول</span>
                      <span className="text-xs font-bold text-white">{analysis.setup.entryZone}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-rose-400 font-['Cairo'] block">وقف الخسارة (SL)</span>
                      <span className="text-xs font-bold text-rose-300">{analysis.setup.stopLoss}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف الأول (TP1)</span>
                      <span className="text-xs font-bold text-emerald-300">{analysis.setup.takeProfit1}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-['Cairo'] block">نسبة العائد/المخاطرة</span>
                      <span className="text-xs font-bold text-amber-300">{analysis.setup.riskRewardRatio}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Management Advice */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-amber-200 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 mb-0.5">توجيه حاسم لإدارة المخاطر في الذهب:</strong>
                  {analysis.keyAdvice}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">
              لم يتم تحميل أي تحليل بعد. اضغط على تحديث لبدء التحليل الفوري.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
