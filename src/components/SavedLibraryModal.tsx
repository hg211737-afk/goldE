import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  Search, 
  Trash2, 
  Download, 
  Clock, 
  ArrowRight,
  Code2
} from 'lucide-react';
import { ScriptProject } from '../types';
import { downloadProjectAsZip } from '../services/polyglotService';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface SavedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: ScriptProject[];
  onSelectProject: (project: ScriptProject) => void;
  onDeleteProject: (id: string) => void;
}

export const SavedLibraryModal: React.FC<SavedLibraryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onSelectProject,
  onDeleteProject,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = savedProjects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
      p.languages.some((l) => l.toLowerCase().includes(q)) ||
      p.prompt.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                مكتبة السكربتات المحفوظة ({savedProjects.length})
              </h2>
              <p className="text-xs text-slate-400">
                جميع مشاريعك وسكربتاتك السابقة محفوظة بأمان في متصفحك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو لغة البرمجة أو الفكرة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لا توجد سكربتات محفوظة مطابقة لبحثك.
            </div>
          ) : (
            filtered.map((proj) => (
              <div
                key={proj.id}
                className="bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {proj.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {proj.paradigm}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {proj.prompt}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      {(Array.isArray(proj.languages) ? proj.languages : []).map((lang) => {
                        const lObj = SUPPORTED_LANGUAGES.find((l) => l.id === lang);
                        return (
                          <span
                            key={lang}
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: lObj?.color || '#94a3b8' }}
                            title={lang}
                          />
                        );
                      })}
                      <span className="text-slate-400 font-mono">
                        {proj.files?.length || 0} ملفات
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadProjectAsZip(proj)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                    title="تحميل كملف مضغوط ZIP"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    title="حذف من السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
                  >
                    <span>فتح المشروع</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
