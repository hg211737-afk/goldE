import React, { useState } from 'react';
import { 
  Workflow, 
  Cpu, 
  Activity, 
  Share2, 
  Copy, 
  Check, 
  Zap, 
  HardDrive,
  Network,
  ShieldAlert
} from 'lucide-react';
import { ScriptProject } from '../types';

interface ArchitectureViewProps {
  project: ScriptProject;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ project }) => {
  const [copiedDiagram, setCopiedDiagram] = useState(false);

  const handleCopyDiagram = () => {
    navigator.clipboard.writeText(project.dataFlowDiagram);
    setCopiedDiagram(true);
    setTimeout(() => setCopiedDiagram(false), 2000);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Benchmark Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Speed Gain */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">مكاسب السرعة والكفاءة</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs font-bold text-amber-300 leading-snug">
            {project.benchmarkStats.speedGainVsPureScript || 'أداء فائق بفضل دمج اللغات'}
          </p>
        </div>

        {/* Metric 2: Memory Footprint */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">استهلاك الذاكرة التقديري</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-cyan-300 leading-snug">
            {project.benchmarkStats.memoryFootprintEstimate || '~20 MB'}
          </p>
        </div>

        {/* Metric 3: Concurrency Model */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">نموذج التزامن والتوازي</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs font-bold text-emerald-300 leading-snug truncate">
            {project.benchmarkStats.concurrencyModel || 'Multi-core Subprocesses'}
          </p>
        </div>

        {/* Metric 4: Complexity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">تصنيف التعقيد والصلابة</span>
            <Workflow className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xs font-bold text-indigo-300 leading-snug">
            {project.benchmarkStats.complexityRating || 'متقدم إنتاجي (Production)'}
          </p>
        </div>
      </div>

      {/* Architecture & Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                مخطط تدفق البيانات ومعمارية الربط (Data Flow & Architecture)
              </h3>
              <p className="text-xs text-slate-400">
                كيف تتكامل لغات البرمجة وتتبادل الإشارات والبيانات بين العمليات والذاكرة
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyDiagram}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {copiedDiagram ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedDiagram ? 'تم النسخ' : 'نسخ المخطط'}</span>
          </button>
        </div>

        {/* Architecture Summary Description */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {project.architectureSummary}
        </div>

        {/* ASCII Flowchart Box */}
        <div className="bg-[#05080e] p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-cyan-300 leading-relaxed" dir="ltr">
          <pre className="whitespace-pre">{project.dataFlowDiagram}</pre>
        </div>

        {/* Communication Mechanism Explanation */}
        <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
          <Network className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-200 mb-1">
              بروتوكول التواصل (Inter-Process Communication Protocol):
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {project.communicationMechanism}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
