import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  Cpu,
  Circle
} from 'lucide-react';
import { SimulatedLog, ScriptProject } from '../types';

interface InteractiveTerminalProps {
  project: ScriptProject;
  isSimulating: boolean;
  onRunSimulation: () => void;
  onStopSimulation: () => void;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  project,
  isSimulating,
  onRunSimulation,
  onStopSimulation,
}) => {
  const [logs, setLogs] = useState<SimulatedLog[]>(project.simulatedLogs || []);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Update logs when project changes
  useEffect(() => {
    setLogs(project.simulatedLogs || []);
  }, [project]);

  // Scroll to bottom on log additions
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulated live execution loop when isSimulating is active
  useEffect(() => {
    if (!isSimulating) return;

    let step = 0;
    const baseLogs = project.simulatedLogs || [];
    setLogs([
      {
        id: 'init-0',
        time: '00:00.00',
        source: 'Supervisor',
        type: 'info',
        message: `[Shell] $ ${project.executionGuide.runCommand}`
      }
    ]);

    const interval = setInterval(() => {
      if (step < baseLogs.length) {
        const nextLog = baseLogs[step];
        setLogs((prev) => [...prev, nextLog]);
        step++;
      } else {
        // Continuous synthetic stream logs
        step++;
        const mockTime = `00:${String(Math.floor(step * 0.5)).padStart(2, '0')}.${String((step * 33) % 99).padStart(2, '0')}`;
        const streamLog: SimulatedLog = {
          id: 'live-' + Date.now(),
          time: mockTime,
          source: project.languages.includes('javascript') ? 'Node Gateway' : 'Python Core',
          type: step % 5 === 0 ? 'success' : 'data',
          message: `[IPC Stream #${step}] نقل بيانات متزامن | زمن الاستجابة: ${(Math.random() * 1.5 + 0.3).toFixed(2)}ms | كفاءة المعالجة: 99.8%`
        };
        setLogs((prev) => [...prev.slice(-40), streamLog]);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isSimulating, project]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setLogs([]);
  };

  const getTypeStyle = (type: SimulatedLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      case 'data':
        return 'text-cyan-300 font-bold';
      case 'info':
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className={`bg-[#060a12] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all ${
      isExpanded ? 'fixed inset-4 z-50' : 'h-[360px]'
    }`}>
      {/* Terminal Title Bar */}
      <div className="bg-[#0b101b] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Mac-style colored dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">Polyglot Simulated Runner</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{project.languages.join(' + ')}</span>
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2">
          {isSimulating ? (
            <button
              onClick={onStopSimulation}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all font-mono"
            >
              <Circle className="w-2.5 h-2.5 fill-rose-400 text-rose-400 animate-ping" />
              <span>إيقاف</span>
            </button>
          ) : (
            <button
              onClick={onRunSimulation}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all font-mono"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>تشغيل المحاكاة</span>
            </button>
          )}

          <button
            onClick={handleClear}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="مسح سجلات الطرفية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="نسخ مخرجات الطرفية"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title={isExpanded ? 'تصغير' : 'تكبير الشاشة'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div 
        className="p-4 overflow-y-auto font-mono text-xs leading-6 flex-1 space-y-1 text-left select-text" 
        dir="ltr"
      >
        <div className="text-slate-500 select-none pb-2 border-b border-slate-900">
          # Polyglot Multi-Process IPC Bridge Initialized.<br />
          # Environment: Linux x86_64 | Standard Streams: Open | Buffer: Active
        </div>

        {logs.map((log, idx) => (
          <div key={log.id || idx} className="flex items-start gap-2 hover:bg-slate-900/30 px-1 py-0.5 rounded">
            <span className="text-slate-600 select-none shrink-0 font-mono text-[11px]">
              [{log.time}]
            </span>
            <span className="text-cyan-400 font-semibold select-none shrink-0 text-[11px] bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/20">
              {log.source}
            </span>
            <span className={`break-all ${getTypeStyle(log.type)}`}>
              {log.message}
            </span>
          </div>
        ))}

        {isSimulating && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs py-1">
            <span className="w-2 h-4 bg-cyan-400 animate-pulse inline-block" />
            <span className="text-slate-500 text-[11px]">Stream active...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
