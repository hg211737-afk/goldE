import React, { useEffect, useRef } from "react";
import { Flame } from "lucide-react";
import { DOMDepthData, LiquidityZone } from "../types";

interface LiquidityHeatmapProps {
  currentPrice: number;
  liquidityZones: LiquidityZone[];
  depth: DOMDepthData;
}

export const LiquidityHeatmap: React.FC<LiquidityHeatmapProps> = ({
  currentPrice,
  liquidityZones,
  depth,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const chartWidth = width - 140;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0a0d14";
    ctx.fillRect(0, 0, width, height);

    const minPrice = currentPrice - 20;
    const maxPrice = currentPrice + 20;
    const priceRange = maxPrice - minPrice;
    const getY = (p: number) => height - ((p - minPrice) / priceRange) * height;

    const xCols = 60;
    const yRows = 50;
    const cellW = chartWidth / xCols;
    const cellH = height / yRows;

    for (let c = 0; c < xCols; c++) {
      for (let r = 0; r < yRows; r++) {
        const priceAtRow = maxPrice - (r / yRows) * priceRange;
        let zoneIntensity = 0;

        liquidityZones.forEach((z) => {
          if (priceAtRow >= z.priceBottom && priceAtRow <= z.priceTop) {
            zoneIntensity += z.strength === "critical" ? 0.8 : 0.5;
          }
        });

        let domIntensity = 0;
        if (priceAtRow < currentPrice) {
          const matchBid = depth.bids.find((b) => Math.abs(b.price - priceAtRow) < 0.8);
          if (matchBid) domIntensity = (matchBid.qty / depth.maxQty) * 0.7;
        } else {
          const matchAsk = depth.asks.find((a) => Math.abs(a.price - priceAtRow) < 0.8);
          if (matchAsk) domIntensity = (matchAsk.qty / depth.maxQty) * 0.7;
        }

        const wave = Math.sin(c * 0.25 + r * 0.4) * 0.15;
        const score = Math.min(1, Math.max(0, zoneIntensity * 0.7 + domIntensity + wave * 0.2));

        let color = "#0b0f19";
        if (score > 0.75) {
          color = `rgba(250, 204, 21, ${(score - 0.7) * 3})`;
        } else if (score > 0.5) {
          color = `rgba(234, 88, 12, ${(score - 0.4) * 2})`;
        } else if (score > 0.3) {
          color = `rgba(168, 85, 247, ${score * 1.5})`;
        } else if (score > 0.15) {
          color = `rgba(30, 27, 75, ${score * 1.2})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Historical price line trace
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < xCols; i++) {
      const px = i * cellW;
      const wave = Math.sin(i * 0.2) * 2.8 + Math.cos(i * 0.1) * 1.5;
      const py = getY(currentPrice - (1 - i / xCols) * 3.5 + wave);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Render Liquidity Zones
    liquidityZones.forEach((z) => {
      const yTop = getY(z.priceTop);
      const yBottom = getY(z.priceBottom);
      const h = Math.max(6, Math.abs(yBottom - yTop));
      const yStart = Math.min(yTop, yBottom);
      const isBSL = z.type === "BSL";

      ctx.fillStyle = isBSL ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)";
      ctx.fillRect(0, yStart, chartWidth, h);

      ctx.strokeStyle = isBSL ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(0, yStart, chartWidth, h);
      ctx.setLineDash([]);

      ctx.fillStyle = isBSL ? "#fca5a5" : "#86efac";
      ctx.font = 'bold 11px "Cairo", sans-serif';
      ctx.textAlign = "left";
      ctx.fillText(`${z.nameAr} • ${z.volumeCluster} Lot`, 12, yStart + 14);
    });

    // Current Price Line
    const curY = getY(currentPrice);
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(chartWidth, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right DOM Sidebar
    ctx.fillStyle = "#0f1420";
    ctx.fillRect(chartWidth, 0, 140, height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = 'bold 11px "Cairo", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("عمق السيولة (DOM Depth)", chartWidth + 70, 20);

    const maxQ = depth.maxQty || 1;
    depth.asks.slice(0, 12).forEach((ask) => {
      const y = getY(ask.price);
      if (y >= 30 && y <= height) {
        const barW = Math.min(120, (ask.qty / maxQ) * 100);
        ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
        ctx.fillRect(chartWidth + 5, y - 6, barW, 12);
        ctx.fillStyle = "#f87171";
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.fillText(`$${ask.price.toFixed(1)} (${ask.qty.toFixed(1)})`, chartWidth + 10, y + 3);
      }
    });

    depth.bids.slice(0, 12).forEach((bid) => {
      const y = getY(bid.price);
      if (y >= 30 && y <= height) {
        const barW = Math.min(120, (bid.qty / maxQ) * 100);
        ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
        ctx.fillRect(chartWidth + 5, y - 6, barW, 12);
        ctx.fillStyle = "#34d399";
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = "left";
        ctx.fillText(`$${bid.price.toFixed(1)} (${bid.qty.toFixed(1)})`, chartWidth + 10, y + 3);
      }
    });

    // Current price tag in DOM column
    ctx.fillStyle = "#eab308";
    ctx.fillRect(chartWidth, curY - 10, 140, 20);
    ctx.fillStyle = "#0b0f19";
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText(`السعر: $${currentPrice.toFixed(2)}`, chartWidth + 70, curY + 4);
  }, [currentPrice, liquidityZones, depth]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0d14] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>خريطة السيولة الحرارية (Liquidity Heatmap)</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>التدرج الحراري:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-xs bg-[#1e1b4b]" />
              <span>خفيفة</span>
              <span className="w-3 h-2 rounded-xs bg-[#701a75]" />
              <span>متوسطة</span>
              <span className="w-3 h-2 rounded-xs bg-[#ea580c]" />
              <span>كثيفة</span>
              <span className="w-3 h-2 rounded-xs bg-[#facc15]" />
              <span className="text-amber-300 font-bold">حيتان / تصفية (Whales)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            كشف سحب السيولة (Stop Hunts Radar)
          </span>
        </div>
      </div>

      <div className="relative flex-1 w-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
