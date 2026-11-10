import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Radio, Sparkles, Mic, MicOff, Loader2 } from "lucide-react";
import { voiceAlert } from "../services/voiceAlertService";
import { soundFx } from "../services/soundService";
import { connectGeminiLiveSession } from "../services/geminiClientService";

interface TacticalVoiceCoPilotProps {
  currentPrice: number;
}

export const TacticalVoiceCoPilot: React.FC<TacticalVoiceCoPilotProps> = ({ currentPrice }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [liveConnecting, setLiveConnecting] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);

  const playPcm24k = (base64Audio: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), (float32.length / 24000) * 1000 + 300);
    } catch (e) {
      console.warn("Failed to play PCM audio chunk:", e);
    }
  };

  const toggleLiveVoiceAssistant = () => {
    if (isLiveActive) {
      if (liveSessionRef.current) {
        liveSessionRef.current.close();
        liveSessionRef.current = null;
      }
      setIsLiveActive(false);
      setLiveConnecting(false);
      return;
    }

    setLiveConnecting(true);
    soundFx.playHudClick();

    const session = connectGeminiLiveSession({
      onOpen: () => {
        setLiveConnecting(false);
        setIsLiveActive(true);
        soundFx.playSonarPing();
        // Ask for live status over Live API
        const p = currentPrice > 1000 ? currentPrice : 4293.65;
        session.sendText(`قدم تقريراً صوتياً مباشراً للذهب الآن بسعر $${p.toFixed(2)}.`);
      },
      onAudioChunk: (base64) => {
        playPcm24k(base64);
      },
      onInterrupted: () => {
        setIsSpeaking(false);
      },
      onError: (err) => {
        console.warn("Gemini Live API bridge notification:", err);
        setLiveConnecting(false);
        setIsLiveActive(false);
        // Graceful fallback to client TTS
        handleSpeakLiveReport();
      },
      onClose: () => {
        setIsLiveActive(false);
        setLiveConnecting(false);
      },
    });

    liveSessionRef.current = session;
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    voiceAlert.enabled = !nextState;
    soundFx.enabled = !nextState;
    if (nextState) {
      voiceAlert.stop();
      if (liveSessionRef.current) {
        liveSessionRef.current.close();
        liveSessionRef.current = null;
      }
      setIsLiveActive(false);
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
    setIsSpeaking(true);
    voiceAlert.speak(msg, "urgent");
    setTimeout(() => setIsSpeaking(false), 4500);
  };

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-['Cairo']">
      {/* Live Voice API / Report Button */}
      <button
        onClick={toggleLiveVoiceAssistant}
        className={`flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
          isLiveActive ? "text-emerald-400" : "text-amber-400 hover:text-amber-300"
        }`}
        title={isLiveActive ? "قطع جلسة Gemini Live API" : "بدء جلسة Gemini Live API التفاعلية الصوتية عبر الخادم"}
      >
        <div className="relative">
          {liveConnecting ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : (
            <Radio className={`w-3.5 h-3.5 ${isLiveActive || isSpeaking ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
          )}
          {(isLiveActive || isSpeaking) && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </div>
        <span className="hidden sm:inline">
          {liveConnecting ? "جاري الاتصال..." : isLiveActive ? "Gemini Live نشط" : isSpeaking ? "يتحدث الآن..." : "تقرير صوتي"}
        </span>
      </button>

      {/* Fallback Quick TTS Button */}
      {!isLiveActive && (
        <button
          onClick={handleSpeakLiveReport}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title="تقرير سريع فوري"
        >
          <Sparkles className="w-3 h-3 text-amber-400/80" />
        </button>
      )}

      {/* Mute / Unmute */}
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
