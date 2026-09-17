import { AIAnalysisResult } from '../types';

export async function fetchOrderFlowAnalysis(params: {
  currentPrice: number;
  delta: string;
  cvdTrend: string;
  footprintImbalance: string;
  bslLevels: string[];
  sslLevels: string[];
  pocPrice: string;
  fvgZones: string[];
  timeframe: string;
}): Promise<AIAnalysisResult> {
  const response = await fetch('/api/gemini/analyze-orderflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch AI order flow analysis');
  }

  const result = await response.json();
  return result.data;
}
