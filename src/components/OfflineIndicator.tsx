import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-2xl backdrop-blur-md border border-amber-300 animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-slate-950 animate-pulse" />
      <span>وضع عدم الاتصال — يتم عرض البيانات المخزنة محلياً بكفاءة عالية</span>
    </div>
  );
};
