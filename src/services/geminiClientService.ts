// Server-Proxied Gemini Engine for Gold OrderFlow Pro
// All Gemini API calls, streaming, and Live API run securely on the server.
// Works seamlessly for every user who opens the app.

export const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

export function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

/**
 * Verify / Test Gemini API key via server-side endpoint.
 * Works automatically for everyone using server's built-in key if apiKey is empty,
 * or verifies user's custom key if provided.
 */
export async function testGeminiApiKey(
  apiKey?: string,
  preferredModel: string = "gemini-3.8-flash"
): Promise<{ valid: boolean; message: string; modelUsed?: string }> {
  const key = (apiKey || "").trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/gemini/test-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "x-gemini-api-key": key } : {}),
      },
      body: JSON.stringify({
        apiKey: key || undefined,
        model: preferredModel,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);
    if (res.ok && data?.valid) {
      return {
        valid: true,
        message: data.message || `تم التحقق بنجاح من خادم الذكاء الاصطناعي (${data.model || preferredModel})! التطبيق جاهز للجميع.`,
        modelUsed: data.model || preferredModel,
      };
    } else {
      return {
        valid: false,
        message: data?.message || "فشل التحقق من المفتاح عبر الخادم. يرجى مراجعة الصلاحيات.",
      };
    }
  } catch (err: any) {
    return {
      valid: false,
      message: `خطأ في الاتصال بالخادم: ${err?.message || "يرجى التأكد من اتصال الإنترنت"}`,
    };
  }
}

/**
 * Server-Side Gemini Order Flow & Liquidity Analysis
 * Calls server endpoint /api/gemini/analyze-orderflow
 */
export async function directGeminiAnalyzeOrderFlow(
  apiKey: string | undefined,
  marketState: any,
  preferredModel: string = "gemini-3.8-flash"
): Promise<any> {
  const key = (apiKey || "").trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("/api/gemini/analyze-orderflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "x-gemini-api-key": key } : {}),
      },
      body: JSON.stringify({
        ...marketState,
        customApiKey: key || undefined,
        preferredModel,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      data.isLiveGemini = true;
      data.modelUsed = preferredModel;
      return data;
    }

    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error || `Server responded with ${res.status}`);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Server-Sent Events (SSE) Streaming Analysis
 * Streams real-time tokens from server via /api/gemini/stream
 */
export async function streamGeminiOrderFlowAnalysis(params: {
  prompt?: string;
  marketState?: any;
  customApiKey?: string;
  preferredModel?: string;
  onChunk: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const key = (params.customApiKey || "").trim();

  try {
    const res = await fetch("/api/gemini/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "x-gemini-api-key": key } : {}),
      },
      body: JSON.stringify({
        prompt: params.prompt,
        marketState: params.marketState,
        preferredModel: params.preferredModel || "gemini-3.8-flash",
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Failed to initialize stream: HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") {
          params.onComplete?.(fullText);
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text) {
            fullText += parsed.text;
            params.onChunk(parsed.text);
          } else if (parsed.error) {
            throw new Error(parsed.error);
          }
        } catch {
          // Ignore partial or unparseable SSE line
        }
      }
    }

    params.onComplete?.(fullText);
  } catch (err) {
    if (params.onError) {
      params.onError(err);
    } else {
      console.warn("Stream error:", err);
    }
  }
}

/**
 * Gemini Live API WebSocket Session Bridge
 * Connects browser audio/text to server-side Gemini Live API (/api/gemini/live)
 */
export interface GeminiLiveSessionOptions {
  onAudioChunk?: (base64Pcm: string) => void;
  onTextChunk?: (text: string) => void;
  onInterrupted?: () => void;
  onError?: (error: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function connectGeminiLiveSession(options: GeminiLiveSessionOptions) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/gemini/live`;

  let ws: WebSocket | null = null;
  let isClosed = false;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (options.onOpen) options.onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.audio && options.onAudioChunk) {
          options.onAudioChunk(payload.audio);
        }
        if (payload.text && options.onTextChunk) {
          options.onTextChunk(payload.text);
        }
        if (payload.interrupted && options.onInterrupted) {
          options.onInterrupted();
        }
        if (payload.error && options.onError) {
          options.onError(payload.error);
        }
      } catch (e) {
        console.warn("Failed to parse Live API frame:", e);
      }
    };

    ws.onerror = (e) => {
      if (!isClosed && options.onError) {
        options.onError("Live API WebSocket error");
      }
    };

    ws.onclose = () => {
      if (options.onClose) options.onClose();
    };
  } catch (err: any) {
    if (options.onError) options.onError(err?.message || "Failed to initiate WebSocket");
  }

  return {
    sendAudio: (base64Pcm: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ audio: base64Pcm }));
      }
    },
    sendText: (text: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ text }));
      }
    },
    close: () => {
      isClosed = true;
      if (ws) {
        try {
          ws.close();
        } catch {}
      }
    },
  };
}
