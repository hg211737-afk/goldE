import React, { useState } from 'react';
import { 
  Terminal, 
  Check, 
  Copy, 
  HelpCircle, 
  Play, 
  Wrench, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ExecutionGuide } from '../types';

interface ExecutionGuidePanelProps {
  guide: ExecutionGuide;
  title: string;
}

export const ExecutionGuidePanel: React.FC<ExecutionGuidePanelProps> = ({ guide, title }) => {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(guide.installCommands.join('\n'));
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const handleCopyRun = () => {
    navigator.clipboard.writeText(guide.runCommand);
    setCopiedRun(true);
    setTimeout(() => setCopiedRun(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5" dir="rtl">
      {/* Title */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">دليل التشغيل والتنفيذ المباشر (Execution Guide)</h3>
          <p className="text-xs text-slate-400">خطوات واضحة لتشغيل هذا السكربت الهجين في جهازك المحلي أو خادمك</p>
        </div>
      </div>

      {/* Step 1: Prerequisites */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-mono">1</span>
          <span>المتطلبات الأساسية (Prerequisites):</span>
        </h4>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pr-7">
          {guide.prerequisites.map((req, idx) => (
            <li key={idx} className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Step 2: Install / Setup Commands */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-mono">2</span>
            <span>أوامر التجهيز والتثبيت (Setup / Permissions):</span>
          </h4>
          <button
            onClick={handleCopyInstall}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copiedInstall ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{copiedInstall ? 'تم النسخ' : 'نسخ الأوامر'}</span>
          </button>
        </div>
        <div className="bg-[#05080e] p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 text-left overflow-x-auto" dir="ltr">
          <pre>{guide.installCommands.join('\n')}</pre>
        </div>
      </div>

      {/* Step 3: Run Command */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-mono">3</span>
            <span>أمر التشغيل الرئيسي (Launch Command):</span>
          </h4>
          <button
            onClick={handleCopyRun}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {copiedRun ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{copiedRun ? 'تم النسخ' : 'نسخ أمر التشغيل'}</span>
          </button>
        </div>
        <div className="bg-[#05080e] p-3.5 rounded-xl border border-cyan-900/50 font-mono text-xs text-cyan-300 text-left flex items-center justify-between gap-2" dir="ltr">
          <code>$ {guide.runCommand}</code>
          <Play className="w-4 h-4 text-emerald-400 fill-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Step 4: Expected Output */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-xs font-mono">4</span>
          <span>المخرجات المتوقعة في شاشة الطرفية:</span>
        </h4>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed pr-7">
          {guide.expectedOutput}
        </div>
      </div>

      {/* Step 5: Troubleshooting */}
      {guide.troubleshooting && guide.troubleshooting.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>نصائح وحلول المشاكل المحتملة (Troubleshooting):</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400 pr-5 list-disc">
            {guide.troubleshooting.map((tip, idx) => (
              <li key={idx} className="leading-relaxed">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
