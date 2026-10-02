// Spoken Arabic Tactical Voice Co-Pilot Engine

import { soundFx } from "./soundService";

class VoiceAlertService {
  public enabled: boolean = true;
  private lastSpokenTime = 0;
  private throttleMs = 6000; // minimum 6 seconds between speech announcements
  private isSpeaking = false;

  /**
   * Speaks a tactical Arabic announcement with high-tech acoustic intro
   */
  public speak(message: string, priority: "normal" | "urgent" = "normal") {
    if (!this.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const now = Date.now();
    if (priority !== "urgent" && now - this.lastSpokenTime < this.throttleMs) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      // Play introductory sonar ping
      soundFx.playSonarPing(priority === "urgent" ? 1200 : 900);

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "ar-SA";
        utterance.rate = 1.05;
        utterance.pitch = 0.95;

        // Try to pick an Arabic voice if available
        const voices = window.speechSynthesis.getVoices();
        const arVoice = voices.find((v) => v.lang.includes("ar"));
        if (arVoice) {
          utterance.voice = arVoice;
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
        };
        utterance.onend = () => {
          this.isSpeaking = false;
        };
        utterance.onerror = () => {
          this.isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
        this.lastSpokenTime = Date.now();
      }, 200);
    } catch {
      // ignore
    }
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsSpeaking() {
    return this.isSpeaking;
  }
}

export const voiceAlert = new VoiceAlertService();
