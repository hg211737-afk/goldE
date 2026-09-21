import React, { useState } from 'react';
import { Sparkles, Send, Cpu, Plus, Wrench, Shield, Container, Zap } from 'lucide-react';

interface RefinementBarProps {
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

const QUICK_REFINEMENTS = [
  { label: '+ أضف لغة Rust للعمليات الحسابية', text: 'أضف مكتبة Rust مساعدة للقيام بالعمليات الحسابية والتشفير بأعلى سرعة ودمجها مع الكود الحالي.' },
  { label: '+ أضف Dockerfile و docker-compose', text: 'أضف ملفات Dockerfile و docker-compose.yml لتشغيل المشروع المتعدد اللغات بضغطة زر داخل حاوية معزولة.' },
  { label: '+ تعزيز الأمان ومعالجة الاستثناءات', text: 'قم بتعزيز الكود البرمجي بمصائد أخطاء متينة (Try/Catch/Exception handling) وتسجيل تفصيلي (Logging) وإغلاق آمن للعمليات.' },
  { label: '+ تحسين استهلاك الذاكرة وسرعة الـ IPC', text: 'قم بتحسين بروتوكول نقل البيانات بين اللغات لتقليل زمن الاستجابة إلى الصفر واستهلاك ذاكرة أقل.' },
  { label: '+ إضافة اختبارات تلقائية (Unit Tests)', text: 'أضف ملف اختبارات تلقائية يتحقق من عمل الربط بين اللغات بشكل صحيح وكامل.' },
];

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isRefining }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining) return;
    const text = instruction;
    setInstruction('');
    await onRefine(text);
  };

  const handleApplyChip = async (text: string) => {
    if (isRefining) return;
    await onRefine(text);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>تطوير وتعديل هذا السكربت بالذكاء الاصطناعي (Refine Script)</span>
        </div>
        <span className="text-[11px] text-slate-400">
          يمكنك إضافة لغات أخرى، تحسين السرعة، أو طلب أي تعديل تريده
        </span>
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REFINEMENTS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isRefining}
            onClick={() => handleApplyChip(chip.text)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 transition-all disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="اكتب التعديل الذي تريده على السكربت الحالي (مثال: حول أنبوب الـ IPC إلى gRPC، أو أضف نظام تشفير، أو غير المنفذ إلى 9090)..."
          disabled={isRefining}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={isRefining || !instruction.trim()}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
        >
          {isRefining ? (
            <>
              <Cpu className="w-4 h-4 animate-spin" />
              <span>جاري التعديل...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 text-cyan-200 rotate-180" />
              <span>تطبيق التعديل</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
