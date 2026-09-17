import React, { useRef, useEffect, useState } from 'react';
import { LiquidityZone, MarketDepth } from '../types';
import { Flame, ShieldAlert, Sparkles, AlertCircle, Eye, Maximize2, Minimize2 } from 'lucide-react';

interface LiquidityHeatmapProps {
  currentPrice: number;
  liquidityZones: LiquidityZone[];
  depth: MarketDepth;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const LiquidityHeatmap: React.FC<LiquidityHeatmapProps> = ({
  currentPrice,
  liquidityZones,
  depth,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedZone, setSelectedZone] = useState<LiquidityZone | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const rightPanelWidth = 140; // Depth profile on right
    const heatmapWidth = width - rightPanelWidth;

    ctx.clearRect(0, 0, width, height);

    // Dark background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Price range (+-$25 around current price)
    const minPrice = currentPrice - 20;
    const maxPrice = currentPrice + 20;
    const priceRange = maxPrice - minPrice;

    const priceToY = (p: number) => {
      return height - ((p - minPrice) / priceRange) * height;
    };

    // 1. Draw Heatmap Time Slices (Simulated continuous Bookmap depth evolution)
    const timeCols = 60;
    const colW = heatmapWidth / timeCols;
    const numPriceBands = 50;
    const bandH = height / numPriceBands;

    for (let col = 0; col < timeCols; col++) {
      const colTimeRatio = col / timeCols;

      for (let row = 0; row < numPriceBands; row++) {
        const bandPrice = maxPrice - (row / numPriceBands) * priceRange;
        const distFromCurrent = Math.abs(bandPrice - currentPrice);

        // Check if this price band intersects with any known Liquidity Zone
        let zoneBoost = 0;
        liquidityZones.forEach((z) => {
          if (bandPrice >= z.priceBottom && bandPrice <= z.priceTop) {
            zoneBoost += z.strength === 'critical' ? 0.8 : 0.5;
          }
        });

        // Depth order book resting weight
        let depthBoost = 0;
        if (bandPrice < currentPrice) {
          const matchingBid = depth.bids.find((b) => Math.abs(b.price - bandPrice) < 0.8);
          if (matchingBid) depthBoost = (matchingBid.qty / depth.maxQty) * 0.7;
        } else {
          const matchingAsk = depth.asks.find((a) => Math.abs(a.price - bandPrice) < 0.8);
          if (matchingAsk) depthBoost = (matchingAsk.qty / depth.maxQty) * 0.7;
        }

        // Noise + time wave to create real order flow heatmap drift
        const noise = Math.sin(col * 0.25 + row * 0.4) * 0.15;
        const intensity = Math.min(1, Math.max(0, zoneBoost * 0.7 + depthBoost + noise * 0.2));

        // Color thermal mapping:
        // 0.0 -> #0b0f19 (Navy)
        // 0.3 -> #1e1b4b (Deep Indigo)
        // 0.5 -> #701a75 (Purple/Fuchsia)
        // 0.75 -> #ea580c (Hot Orange)
        // 1.0 -> #facc15 (Intense Yellow Liquidity Wall)
        let fillColor = '#0b0f19';
        if (intensity > 0.75) {
          fillColor = `rgba(250, 204, 21, ${(intensity - 0.7) * 3})`; // bright yellow
        } else if (intensity > 0.5) {
          fillColor = `rgba(234, 88, 12, ${(intensity - 0.4) * 2})`; // hot orange
        } else if (intensity > 0.3) {
          fillColor = `rgba(168, 85, 247, ${intensity * 1.5})`; // purple
        } else if (intensity > 0.15) {
          fillColor = `rgba(30, 27, 75, ${intensity * 1.2})`; // deep indigo
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(col * colW, row * bandH, colW + 0.5, bandH + 0.5);
      }
    }

    // 2. Draw Simulated Past Price Trajectory (White Line Cutting Through Heatmap)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let col = 0; col < timeCols; col++) {
      const x = col * colW;
      const wave = Math.sin(col * 0.2) * 2.8 + Math.cos(col * 0.1) * 1.5;
      const histPrice = currentPrice - (1 - col / timeCols) * 3.5 + wave;
      const y = priceToY(histPrice);
      if (col === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. Highlight Liquidity Pools (BSL & SSL overlay)
    liquidityZones.forEach((z) => {
      const yTop = priceToY(z.priceTop);
      const yBottom = priceToY(z.priceBottom);
      const zoneH = Math.max(6, Math.abs(yBottom - yTop));
      const startY = Math.min(yTop, yBottom);

      const isBsl = z.type === 'BSL';
      ctx.fillStyle = isBsl ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';
      ctx.fillRect(0, startY, heatmapWidth, zoneH);

      // Border
      ctx.strokeStyle = isBsl ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(0, startY, heatmapWidth, zoneH);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = isBsl ? '#fca5a5' : '#86efac';
      ctx.font = 'bold 11px "Cairo", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${z.nameAr} • ${z.volumeCluster} Lot`, 12, startY + 14);
    });

    // 4. Current Live Price Marker
    const yLive = priceToY(currentPrice);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, yLive);
    ctx.lineTo(heatmapWidth, yLive);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Right Depth Profile Panel
    ctx.fillStyle = '#0f1420';
    ctx.fillRect(heatmapWidth, 0, rightPanelWidth, height);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(heatmapWidth, 0);
    ctx.lineTo(heatmapWidth, height);
    ctx.stroke();

    // Panel Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('عمق السيولة (DOM Depth)', heatmapWidth + rightPanelWidth / 2, 20);

    // Render Bids & Asks Volume Bars
    const maxQty = depth.maxQty || 1;

    // Asks (above current price, red/rose)
    depth.asks.slice(0, 12).forEach((ask) => {
      const y = priceToY(ask.price);
      if (y >= 30 && y <= height) {
        const barW = Math.min(rightPanelWidth - 20, (ask.qty / maxQty) * (rightPanelWidth - 40));
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.fillRect(heatmapWidth + 5, y - 6, barW, 12);
        ctx.fillStyle = '#f87171';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`$${ask.price.toFixed(1)} (${ask.qty.toFixed(1)})`, heatmapWidth + 10, y + 3);
      }
    });

    // Bids (below current price, emerald/green)
    depth.bids.slice(0, 12).forEach((bid) => {
      const y = priceToY(bid.price);
      if (y >= 30 && y <= height) {
        const barW = Math.min(rightPanelWidth - 20, (bid.qty / maxQty) * (rightPanelWidth - 40));
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fillRect(heatmapWidth + 5, y - 6, barW, 12);
        ctx.fillStyle = '#34d399';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`$${bid.price.toFixed(1)} (${bid.qty.toFixed(1)})`, heatmapWidth + 10, y + 3);
      }
    });

    // Current Price Tag on right
    ctx.fillStyle = '#eab308';
    ctx.fillRect(heatmapWidth, yLive - 10, rightPanelWidth, 20);
    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`السعر: $${currentPrice.toFixed(2)}`, heatmapWidth + rightPanelWidth / 2, yLive + 4);
  }, [currentPrice, liquidityZones, depth]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0d14] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Top Controls & Legend */}
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
              <span className="w-3 h-2 rounded-xs bg-[#1e1b4b]"></span>
              <span>خفيفة</span>
              <span className="w-3 h-2 rounded-xs bg-[#701a75]"></span>
              <span>متوسطة</span>
              <span className="w-3 h-2 rounded-xs bg-[#ea580c]"></span>
              <span>كثيفة</span>
              <span className="w-3 h-2 rounded-xs bg-[#facc15]"></span>
              <span className="text-amber-300 font-bold">حيتان / تصفية (Whales)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 hidden sm:inline">
            كشف سحب السيولة (Stop Hunts Radar)
          </span>

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                isFullScreen
                  ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
              title={isFullScreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة للهيت ماب'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">إنهاء ملء الشاشة</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">ملء الشاشة</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Heatmap Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
