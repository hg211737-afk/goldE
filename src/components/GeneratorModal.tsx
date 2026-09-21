import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  Layers, 
  Check, 
  Flame, 
  Workflow, 
  FileCode,
  ShieldCheck,
  Container,
  Terminal
} from 'lucide-react';
import { ProgrammingLanguage, FusionParadigm, ScriptGenerationConfig } from '../types';
import { SUPPORTED_LANGUAGES, FUSION_PARADIGMS } from '../data/languages';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ScriptGenerationConfig) => Promise<void>;
  isGenerating: boolean;
}

const INSPIRATION_PROMPTS = [
  {
    label: '🤖 بوت أتمتة وتحميل وتوزيع محتوى',
    prompt: 'اصنع كود متكامل لأتمتة مهام الإنترنت وتنزيل وتحليل المحتوى تلقائياً، مع تنبيهات فورية وتخزين البيانات، مع اختيار أفضل وأنسب اللغات لتنفيذه.',
    languages: ['python', 'bash'] as ProgrammingLanguage[],
    paradigm: 'subprocess_pipes' as FusionParadigm,
  },
  {
    label: '⚡ محرك حسابات وتداول فائق السرعة',
    prompt: 'اصنع كود محرك مالي فائق السرعة لحساب المؤشرات وتوقع الأسعار وبث البيانات اللحظية إلى واجهة مراقبة تفاعلية مع أعلى أداء ممكن.',
    languages: ['rust', 'python', 'javascript'] as ProgrammingLanguage[],
    paradigm: 'ffi_bindings' as FusionParadigm,
  },
  {
    label: '🛡️ أداة فحص أمني ومراقبة خوادم وشبكات',
    prompt: 'اصنع أداة فحص أمني متقدمة لفحص المنافذ المفتوحة والثغرات ومراقبة موارد الخوادم، وتقديم تقرير مفصل وتنبيهات أمنية فورية.',
    languages: ['go', 'bash'] as ProgrammingLanguage[],
    paradigm: 'pipeline_orchestration' as FusionParadigm,
  },
  {
    label: '🌐 خادم ويب API متزامن مع قاعدة بيانات',
    prompt: 'اصنع نظام خدمة API سريع جداً لمعالجة آلاف الطلبات المتزامنة مع قاعدة بيانات وتوثيق للعمليات وتخزين مؤقت عالي الأداء.',
    languages: ['typescript', 'sql', 'python'] as ProgrammingLanguage[],
    paradigm: 'microservice_ipc' as FusionParadigm,
  },
  {
    label: '🎮 تطبيق أو لعبة كلاسيكية تفاعلية',
    prompt: 'اصنع لعبة تفاعلية مصغرة وممتعة تعمل إما في الطرفية أو المتصفح مع مؤثرات ورسوميات أنيقة وقواعد لعب متكاملة وحفظ النقاط.',
    languages: ['python', 'javascript'] as ProgrammingLanguage[],
    paradigm: 'polyglot_single_file' as FusionParadigm,
  },
  {
    label: '📊 منظومة خط أنابيب بيانات ضخمة (ETL)',
    prompt: 'اصنع سكربت لجلب وتنظيف وتلخيص كميات ضخمة من البيانات واستخراج الإحصائيات ورسم المخططات البيانية بدقة عالية.',
    languages: ['python', 'bash', 'sql'] as ProgrammingLanguage[],
    paradigm: 'pipeline_orchestration' as FusionParadigm,
  },
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('');
  const [autoSelectLanguages, setAutoSelectLanguages] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<ProgrammingLanguage[]>(['python', 'javascript', 'bash']);
  const [autoSelectParadigm, setAutoSelectParadigm] = useState(true);
  const [paradigm, setParadigm] = useState<FusionParadigm>('subprocess_pipes');
  const [architectureTier, setArchitectureTier] = useState<'standard' | 'advanced' | 'extreme_high_performance'>('advanced');
  const [includeDockerfile, setIncludeDockerfile] = useState(true);
  const [includeMakefile, setIncludeMakefile] = useState(true);
  const [includeErrorHandling, setIncludeErrorHandling] = useState(true);
  const [includeLogging, setIncludeLogging] = useState(true);
  const [bilingualComments, setBilingualComments] = useState(true);

  if (!isOpen) return null;

  const toggleLanguage = (lang: ProgrammingLanguage) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleApplyPreset = (p: typeof INSPIRATION_PROMPTS[0]) => {
    setPrompt(p.prompt);
    setSelectedLanguages(p.languages);
    setParadigm(p.paradigm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await onGenerate({
      userPrompt: prompt,
      selectedLanguages,
      fusionParadigm: paradigm,
      autoSelectLanguages,
      autoSelectParadigm,
      architectureTier,
      includeDockerfile,
      includeMakefile,
      includeErrorHandling,
      includeLogging,
      bilingualComments,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>منشئ الأكواد والسكربتات الذكي الشامل</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Universal AI Generator
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اطلب أي كود أو برنامج تريده، وسيتولى الذكاء الاصطناعي اختيار اللغات والهندسة الأنسب لإنشائه
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>ما هو الكود أو السكربت الذي ترغب في إنشائه؟</span>
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">يدعم أي فكرة أو مهمة برمجية</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب هنا أي فكرة أو برنامج أو كود تحتاجه (مثال: اصنع لي كود أداة لمراقبة أسعار الذهب، أو بوت تيليجرام لتحميل المقاطع، أو خادم دردشة سريع، أو أداة تحليل بيانات، أو نظام فحص أمان، أو أي كود آخر)... وسيختار الذكاء الاصطناعي اللغات الأنسب تلقائياً وينشئ المشروع بالكامل!"
              rows={3}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none leading-relaxed"
              required
            />
          </div>

          {/* Inspiration Prompts Chips */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium block">أفكار ومقترحات سريعة جاهزة:</span>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 border border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/40 transition-all text-right"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Autonomous Language Selection vs Manual Override */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">
                  تحديد لغات البرمجة:
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAutoSelectLanguages(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    autoSelectLanguages
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ اختيار ذكي تلقائي (موصى به)
                </button>
                <button
                  type="button"
                  onClick={() => setAutoSelectLanguages(false)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    !autoSelectLanguages
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تحديد يدوي للغات
                </button>
              </div>
            </div>

            {autoSelectLanguages ? (
              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5 leading-relaxed">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>نظام الاستقلالية الذكية:</strong> سيقوم الذكاء الاصطناعي بدراسة ما تطلبه بدقة واختيار أفضل وأقوى لغات البرمجة (مثل Python, Rust, Go, TypeScript, C++, Bash, SQL...) والأدوات التي تضمن بناء ما تريده بأعلى جودة وسرعة وأمان بدون أي قيود مصطنعة.
                </span>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    اختر اللغات التي ترغب في فرض استخدامها:
                  </span>
                  <span className="text-xs text-cyan-400">
                    محدد: {selectedLanguages.length} لغات
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => toggleLanguage(lang.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span>{lang.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fusion Paradigm */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <span>نمط المعمارية والربط الهندسي:</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={autoSelectParadigm}
                  onChange={(e) => setAutoSelectParadigm(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>تحديد النمط تلقائياً</span>
              </label>
            </div>
            {!autoSelectParadigm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FUSION_PARADIGMS.map((fp) => {
                  const isSelected = paradigm === fp.id;
                  return (
                    <div
                      key={fp.id}
                      onClick={() => setParadigm(fp.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-500/15'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{fp.nameAr}</span>
                        </h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {fp.descriptionAr}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>السرعة: {'⚡'.repeat(fp.speedRating)}</span>
                        <span>التعقيد: {'★'.repeat(fp.complexityRating)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Advanced Architecture Tier & Toggles */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                المستوى الهندسي للسكربت:
              </span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                {(['standard', 'advanced', 'extreme_high_performance'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setArchitectureTier(tier)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                      architectureTier === tier
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tier === 'standard' && 'قياسي'}
                    {tier === 'advanced' && 'متقدم مؤسسي'}
                    {tier === 'extreme_high_performance' && 'أداء فائق قصوى'}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist of inclusions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeErrorHandling}
                  onChange={(e) => setIncludeErrorHandling(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>معالجة أخطاء شاملة</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeMakefile}
                  onChange={(e) => setIncludeMakefile(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>تضمين Makefile</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={includeDockerfile}
                  onChange={(e) => setIncludeDockerfile(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>تضمين Dockerfile</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={bilingualComments}
                  onChange={(e) => setBilingualComments(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>شرح وتعليقات بالعربية</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-amber-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  <span>جاري تحليل الطلب واختيار اللغات وبناء الكود بالكامل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>صناعة الكود فورياً باللغات الأنسب</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
