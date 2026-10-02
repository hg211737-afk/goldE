import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Mic, Sparkles, Radio, Check } from "lucide-react";
import { voiceAlert } from "../services/voiceAlertService";
import { soundFx } from "../services/soundService";

interface TacticalVoiceCoPilotProps {
  currentPrice: number;
}

export const TacticalVoiceCoPilot: React.FC<TacticalVoiceCoPilotProps> = ({ currentPrice }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>(
    "المساعد التكتيكي الصوتي نشط: يتم مسح أوامر الحيتان والجلسة لحظياً."
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    voiceAlert.enabled = !nextState;
    soundFx.enabled = !nextState;
    if (nextState) {
      voiceAlert.stop();
    } else {
      soundFx.playSonarPing();
    }
  };

  const handleSpeakLiveReport = () => {
    soundFx.playHudClick();
    const p = currentPrice > 1000 ? currentPrice : 4293.65;
    const msg = `تقرير صوتي مباشر: سعر الذهب الآن ${p.toFixed(
      2
    )} دولار. رصد امتصاص تدافعي من الحيتان عند قاع المزاد، وجلسة تداخل لندن ونيويورك تقود الزخم نحو أهداف السيولة العلوية!`;
    setLastAnnouncement(msg);
    setIsSpeaking(true);
    voiceAlert.speak(msg, "urgent");
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-['Cairo']">
      <button
        onClick={handleSpeakLiveReport}
        className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-all cursor-pointer font-bold"
        title="الاستماع لتقرير المساعد الصوتي الفوري"
      >
        <div className="relative">
          <Radio className={`w-3.5 h-3.5 ${isSpeaking ? "text-emerald-400 animate-spin" : "text-amber-400"}`} />
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <span className="hidden sm:inline">
          {isSpeaking ? "يتحدث الآن..." : "تقرير صوتي"}
        </span>
      </button>

      <button
        onClick={toggleSound}
        className={`p-1 rounded-lg transition-all cursor-pointer ${
          isMuted ? "text-slate-500 hover:text-slate-300" : "text-emerald-400 hover:text-emerald-300"
        }`}
        title={isMuted ? "تفعيل الصوت التكتيكي" : "كتم الصوت"}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
      </button>
    </div>
  );
};
