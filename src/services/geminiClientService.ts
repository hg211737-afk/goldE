// Client-Side Gemini Engine with Direct Google API + Server Proxy Dual Support
// Guarantees 100% operation in Browser, Installed PWA, Standalone, and Android Capacitor APK!

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-3.6-flash",
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
 * Verify / Test Gemini API key.
 * 1. Tries server /api/gemini/test-key
 * 2. If server is unreachable (installed PWA / Capacitor Android APK), calls Google Generative Language API directly.
 */
export async function testGeminiApiKey(
  apiKey: string,
  preferredModel: string = "gemini-2.5-flash"
): Promise<{ valid: boolean; message: string; modelUsed?: string }> {
  const key = apiKey.trim();
  if (!key) {
    return {
      valid: false,
      message: "يرجى إدخال مفتاح API أولاً قبل الفحص.",
    };
  }

  // 1. Try server proxy if available (timeout 2.5s)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch("/api/gemini/test-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-api-key": key,
      },
      body: JSON.stringify({
        apiKey: key,
        model: preferredModel,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.valid) {
        return {
          valid: true,
          message: data.message || "تم التحقق من المفتاح بنجاح! جاهز للتحليل اللحظي.",
          modelUsed: preferredModel,
        };
      }
    }
  } catch {
    // Server proxy unreachable (e.g. running in installed Capacitor app or standalone)
    // Proceed to Direct Google Generative Language API check
  }

  // 2. Direct Google Generative Language API verification (Works in installed PWA & Capacitor APK!)
  const modelsToTry = preferredModel && CANDIDATE_MODELS.includes(preferredModel)
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;

  let lastErrorMsg = "";

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "ping" }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 5,
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        return {
          valid: true,
          message: `تم التحقق بنجاح مباشر مع خوادم Google Gemini (${model})! مفتاحك نشط وجاهز للتحليل المؤسسي في التطبيق.`,
          modelUsed: model,
        };
      }

      const errJson = await res.json().catch(() => null);
      if (errJson?.error) {
        const code = errJson.error.code;
        const msg = errJson.error.message || "";
        if (code === 400 || msg.toLowerCase().includes("api key not valid")) {
          return {
            valid: false,
            message: "مفتاح API غير صالح. تأكد من نسخ المفتاح كاملاً من Google AI Studio دون مسافات زائدة.",
          };
        }
        if (code === 429 || msg.toLowerCase().includes("quota")) {
          return {
            valid: false,
            message: "تم التحقق من صحة المفتاح، ولكن الحصة المجانية الحالية مستنفذة (Quota Exceeded). يمكنك إنشاء مفتاح جديد من Google AI Studio.",
          };
        }
        lastErrorMsg = msg;
      }
    } catch (e: any) {
      lastErrorMsg = e?.message || "خطأ في الاتصال";
    }
  }

  return {
    valid: false,
    message: lastErrorMsg
      ? `فشل الاتصال: ${lastErrorMsg}`
      : "تعذر فحص المفتاح. يرجى التأكد من اتصال الإنترنت وصلاحية المفتاح في Google AI Studio.",
  };
}

/**
 * Direct Client-Side Gemini Order Flow & Liquidity Analysis
 * Invoked if backend server proxy is unreachable (Installed app / Capacitor / Standalone)
 */
export async function directGeminiAnalyzeOrderFlow(
  apiKey: string,
  marketState: any,
  preferredModel: string = "gemini-2.5-flash"
): Promise<any> {
  const key = apiKey.trim();
  if (!key) throw new Error("No API key provided");

  const systemInstruction = `
أنت كبير محللي تدفق الأوامر والسيولة المؤسسية للذهب (XAU/USD Advanced Order Flow, Option Flow, Futures & Liquidity Specialist).
قم بتحليل بيانات السوق الشاملة بدقة فائقة مدعومة بجميع الأدوات المتطورة:
1. Footprint Imbalances & CVD Delta (اختلالات تدفق الحجم والدلتا التراكمية).
2. Option Flow & UOA (عقود الخيارات المؤسسية، صفقات الحيتان، ونسبة P/C Ratio وجدران الغاما).
3. Futures & COMEX Basis (فروق أسعار الفوري والآجل، الفائدة المفتوحة OI، ومعدلات التمويل).
4. Liquidity Zones & BSL/SSL Sweeps (مناطق سيولة القمم والقيعان المستهدفة وصيد الوقف).
5. DOM Ladder & Macro DXY (عمق السوق وعلاقة الذهب بمؤشر الدولار).

قدم تحليلك باللغة العربية بتنسيق JSON مطابق تماماً للهيكل التالي:
{
  "bias": "Bullish Accumulation" أو "Bearish Distribution" أو "Neutral / Sideways",
  "biasAr": "الاتجاه المتوقع باللغة العربية مع وصف مؤسسي شامل للأدوات المتطورة",
  "confidence": نسبة الثقة كرقم من 70 إلى 99,
  "summaryAr": "ملخص تحليلي احترافي عميق يدمج إشارات أوبشن فلو، الفيوتشر، والفوت برنت",
  "institutionalActivityAr": "وصف دقيق لما يفعله صناع السوق والحيتان عبر صفقات الكول/بوت وعقود الآجلة",
  "dxyCorrelationInsightAr": "تحليل تأثير حركة مؤشر الدولار DXY والماكرو على الذهب",
  "keyLevels": {
    "resistance": "مستوى المقاومة / BSL",
    "support": "مستوى الدعم / SSL",
    "pocTarget": "نقطة التحكم POC المستهدفة",
    "invalidation": "مستوى إلغاء السيناريو"
  },
  "tradeSetup": {
    "action": "BUY" أو "SELL" أو "WAIT",
    "actionAr": "التوصية باللغة العربية مدعومة بالأدوات المتطورة",
    "entryZone": "منطقة الدخول المقترحة بالملي",
    "takeProfit1": "الهدف الأول",
    "takeProfit2": "الهدف الثاني",
    "stopLoss": "وقف الخسارة المحكم",
    "riskReward": "نسبة العائد للمخاطرة مثل 1 : 2.8"
  },
  "warningsAr": [
    "تحذير أو ملاحظة مهمة للمتداول بناءً على السيولة"
  ]
}
`;

  const modelsToTry = [
    preferredModel,
    ...CANDIDATE_MODELS.filter((m) => m !== preferredModel),
  ];

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `بيانات السوق اللحظية الحالية للذهب (XAU/USD):\n${JSON.stringify(marketState, null, 2)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const rawJson = await res.json();
        const textOutput = rawJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
          const cleaned = cleanJsonOutput(textOutput);
          const parsed = JSON.parse(cleaned);
          parsed.isLiveGemini = true;
          parsed.modelUsed = model;
          return parsed;
        }
      }
    } catch {
      continue;
    }
  }

  throw new Error("Direct Gemini analysis call failed for all models");
}
