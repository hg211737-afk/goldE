import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineNotice: React.FC = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="bg-amber-600/90 text-amber-50 px-3 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-amber-500/50 shadow-md">
        <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
        <span>أنت غير متصل بالإنترنت حالياً. جاري إعادة الاتصال التلقائي ببث الذهب فور عودة الشبكة...</span>
      </div>
    );
  }

  if (justReconnected) {
    return (
      <div className="bg-emerald-600/90 text-emerald-50 px-3 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 border-b border-emerald-500/50 shadow-md animate-fade-in">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>تم استعادة الاتصال بالإنترنت بنجاح وتحديث أسعار الذهب الفورية!</span>
      </div>
    );
  }

  return null;
};
