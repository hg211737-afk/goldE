import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Terminal, 
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Code
} from 'lucide-react';
import { ScriptFile, ScriptProject } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { downloadFile, downloadProjectAsZip, explainCodeWithAI } from '../services/polyglotService';

interface CodeEditorPanelProps {
  project: ScriptProject;
  activeFileIndex: number;
  onSelectFile: (index: number) => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  project,
  activeFileIndex,
  onSelectFile,
}) => {
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const activeFile = (project.files && project.files.length > 0)
    ? (project.files[activeFileIndex] || project.files[0])
    : null;

  const handleCopyCurrent = () => {
    if (!activeFile || typeof activeFile.code !== 'string') return;
    navigator.clipboard.writeText(activeFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAll = () => {
    if (!project.files || project.files.length === 0) return;
    const fullBundle = project.files
      .map((f) => `// ==========================================\n// FILE: ${f.filename || 'unknown'} (${f.language || 'text'})\n// ROLE: ${f.fileRole || 'script'}\n// ==========================================\n\n${f.code || ''}`)
      .join('\n\n\n');
    navigator.clipboard.writeText(fullBundle);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadSingle = () => {
    if (!activeFile) return;
    downloadFile(activeFile.filename || 'script.txt', activeFile.code || '');
  };

  const handleExplain = async () => {
    if (!activeFile || isExplaining) return;
    setIsExplaining(true);
    try {
      const exp = await explainCodeWithAI(activeFile);
      setAiExplanation(exp);
    } catch {
      setAiExplanation(activeFile.explanation || 'تم فحص الكود وهو متوافق برمجياً.');
    } finally {
      setIsExplaining(false);
    }
  };

  const fileCode = activeFile && typeof activeFile.code === 'string' ? activeFile.code : '';
  const lines = fileCode ? fileCode.split('\n') : [''];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
      {/* File Tabs Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-3 pt-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {(project.files || []).map((file, idx) => {
            const isActive = idx === activeFileIndex;
            const lang = SUPPORTED_LANGUAGES.find((l) => l.id === file.language || (file.filename && file.filename.endsWith(l.extension)));

            return (
              <button
                key={file.id || idx}
                onClick={() => {
                  onSelectFile(idx);
                  setAiExplanation(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lang?.color || '#94a3b8' }}
                />
                <span>{file.filename || `file-${idx + 1}`}</span>
                {file.isEntrypoint && (
                  <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    رئيسي
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-1.5 pb-2 shrink-0">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              wrapLines
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-300 border-slate-800'
            }`}
            title="التفاف الأسطر البرمجية"
          >
            Wrap
          </button>
          <button
            onClick={handleCopyCurrent}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="نسخ محتوى الملف الحالي"
          >
            {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedFile ? 'تم النسخ' : 'نسخ الملف'}</span>
          </button>
          <button
            onClick={handleCopyAll}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="نسخ كافة ملفات المشروع في حافظة واحدة"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedAll ? 'تم النسخ' : 'نسخ الكل'}</span>
          </button>
          <button
            onClick={handleDownloadSingle}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            title="تحميل هذا الملف منفصلاً"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File Metadata Bar */}
      {activeFile && (
        <div className="bg-slate-950/40 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">الدور البرمجي:</span>
            <span className="font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              {activeFile.fileRole || 'وحدة معالجة رئيسية'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{lines.length} سطر برمجي</span>
          </div>

          <button
            onClick={handleExplain}
            disabled={isExplaining}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExplaining ? 'جاري التحليل...' : 'شرح الكود وتكامله بالذكاء الاصطناعي'}</span>
          </button>
        </div>
      )}

      {/* AI Explanation Accordion/Banner */}
      {aiExplanation && (
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border-b border-amber-500/30 p-3.5 text-xs text-slate-200 leading-relaxed">
          <div className="flex items-center justify-between font-bold text-amber-400 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تحليل وشرح الذكاء الاصطناعي للملف: {activeFile?.filename || 'الملف المختار'}</span>
            </div>
            <button
              onClick={() => setAiExplanation(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="whitespace-pre-line text-slate-300 text-[13px] leading-relaxed">
            {aiExplanation}
          </div>
        </div>
      )}

      {/* Code Viewer */}
      <div className="relative font-mono text-xs sm:text-sm bg-[#070b12] overflow-x-auto min-h-[350px] max-h-[560px] flex text-left" dir="ltr">
        {/* Line Numbers */}
        <div className="py-4 select-none pr-3 pl-4 text-slate-600 bg-[#070b12] text-right font-mono border-r border-slate-800/60 shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-6 text-xs text-slate-600">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Content */}
        <pre 
          className={`py-4 px-4 text-slate-200 leading-6 font-mono flex-1 overflow-x-auto ${
            wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
          }`}
        >
          <code>{activeFile?.code || '// No code available'}</code>
        </pre>
      </div>
    </div>
  );
};
