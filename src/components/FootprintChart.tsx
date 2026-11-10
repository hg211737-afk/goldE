import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  Crosshair,
  Maximize2,
  Minimize2,
  TrendingUp,
  Minus,
  Sparkles,
  Trash2,
  Undo2,
  Eye,
  EyeOff,
  Brain,
  List,
  X,
  Check,
  MousePointer,
  HelpCircle,
} from "lucide-react";
import {
  AppSettings,
  FootprintBar,
  LiquidityZone,
  DualSmartLevel,
  ChartDrawing,
  DrawingToolType,
  ChartDrawingPoint,
} from "../types";
import {
  loadDrawingsFromStorage,
  saveDrawingsToStorage,
  createSupportDrawing,
  createResistanceDrawing,
  createTrendlineDrawing,
  generateAiAnalysisDrawings,
  DEFAULT_COLORS,
} from "../services/chartDrawingService";
import { soundFx } from "../services/soundService";

interface FootprintChartProps {
  bars: FootprintBar[];
  currentPrice: number;
  liquidityZones: LiquidityZone[];
  settings: AppSettings;
  dualLevels?: {
    upperLevel: DualSmartLevel;
    lowerLevel: DualSmartLevel;
  };
}

export const FootprintChart: React.FC<FootprintChartProps> = ({
  bars,
  currentPrice,
  liquidityZones,
  settings,
  dualLevels,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredBar, setHoveredBar] = useState<FootprintBar | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [verticalZoom, setVerticalZoom] = useState<number>(1);
  const [verticalPan, setVerticalPan] = useState<number>(0);
  const [isHeightExpanded, setIsHeightExpanded] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);

  // -------------------------------------------------------------
  // TECHNICAL DRAWINGS & AI LEVELS STATE
  // -------------------------------------------------------------
  const [drawings, setDrawings] = useState<ChartDrawing[]>(() => loadDrawingsFromStorage());
  const [activeTool, setActiveTool] = useState<DrawingToolType>("cursor");
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLORS.support);
  const [showDrawings, setShowDrawings] = useState<boolean>(true);
  const [trendlineStart, setTrendlineStart] = useState<ChartDrawingPoint | null>(null);
  const [showDrawingsManager, setShowDrawingsManager] = useState<boolean>(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Temporary helper to show auto-dismissing banner
  const triggerNotification = useCallback((msg: string) => {
    setActionNotification(msg);
    setTimeout(() => {
      setActionNotification((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Sync to local storage whenever drawings change
  const updateDrawings = useCallback((newDrawings: ChartDrawing[], note?: string) => {
    setDrawings(newDrawings);
    saveDrawingsToStorage(newDrawings);
    if (note) triggerNotification(note);
  }, [triggerNotification]);

  // Auto-center on current price
  const handleCenterOnPrice = () => {
    setVerticalPan(0);
    setPanOffset(0);
    setVerticalZoom(1);
    setZoomScale(1);
  };

  // Keyboard shortcut: Escape cancels drawing in progress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveTool("cursor");
        setTrendlineStart(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // AI ANALYSIS AUTO-PLOT ACTION
  // -------------------------------------------------------------
  const handlePlotAiLevels = () => {
    soundFx.playSonarPing(980);
    const aiDrawings = generateAiAnalysisDrawings(
      currentPrice,
      bars,
      dualLevels,
      liquidityZones
    );

    // Merge without duplicates (replace existing AI drawings with updated ones)
    const existingManual = drawings.filter((d) => d.source !== "ai");
    const merged = [...existingManual, ...aiDrawings];
    updateDrawings(merged, "تم تطبيق وحفظ مستويات وخطوط الذكاء الاصطناعي على الشارت 🧠");
  };

  // -------------------------------------------------------------
  // DRAWING ACTIONS (Undo, Clear, Delete item)
  // -------------------------------------------------------------
  const handleUndoDrawing = () => {
    if (drawings.length === 0) return;
    const updated = drawings.slice(0, -1);
    updateDrawings(updated, "تم التراجع عن آخر رسم ↩️");
    soundFx.playHudClick();
  };

  const handleClearAllDrawings = () => {
    if (drawings.length === 0) return;
    updateDrawings([], "تم مسح كافة الرسومات من الذاكرة المحلية 🗑️");
    soundFx.playHudClick();
  };

  const handleDeleteDrawing = (id: string) => {
    const updated = drawings.filter((d) => d.id !== id);
    updateDrawings(updated, "تم حذف المستوى المحدد");
    soundFx.playHudClick();
  };

  // -------------------------------------------------------------
  // MAIN CANVAS RENDERING ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const chartHeight = height - 80;
    const chartWidth = width - 70;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0e121a";
    ctx.fillRect(0, 0, width, height);

    const barWidth = Math.max(65, 85 * zoomScale);
    const colStep = barWidth + 12;
    const visibleCount = Math.floor(chartWidth / colStep);
    const visibleBars = bars.slice(Math.max(0, bars.length - visibleCount - Math.floor(panOffset / colStep)));

    if (visibleBars.length === 0) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleBars.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
    });

    const pad = (maxPrice - minPrice) * 0.08 || 1.5;
    minPrice -= pad;
    maxPrice += pad;
    const priceDiff = Math.max(0.5, maxPrice - minPrice);

    // Enhanced Price Y scaling with vertical pan and zoom
    const effectiveHeight = Math.max(100, (chartHeight - 40) * verticalZoom);
    const getY = (p: number) =>
      chartHeight - 20 - ((p - minPrice) / priceDiff) * effectiveHeight + verticalPan;
    const getPriceFromY = (y: number) =>
      minPrice + ((chartHeight - 20 + verticalPan - y) / effectiveHeight) * priceDiff;

    // Time to X and X to Time converters for precise trendline anchoring
    const getXFromTime = (time: number): number | null => {
      if (visibleBars.length === 0) return null;
      if (visibleBars.length === 1) return 20 + barWidth / 2;

      // Find exact or closest matching bar
      for (let i = 0; i < visibleBars.length; i++) {
        if (Math.abs(visibleBars[i].time - time) < 60000 * 5) {
          return 20 + i * colStep + barWidth / 2;
        }
      }

      // Linear interpolation based on first & last visible bar times
      const tStart = visibleBars[0].time;
      const tEnd = visibleBars[visibleBars.length - 1].time;
      if (tEnd !== tStart) {
        const ratio = (time - tStart) / (tEnd - tStart);
        return 20 + ratio * ((visibleBars.length - 1) * colStep) + barWidth / 2;
      }

      return 20 + barWidth / 2;
    };

    // Grid lines
    ctx.strokeStyle = "#18202f";
    ctx.lineWidth = 1;
    const step = priceDiff > 20 ? 5 : priceDiff > 8 ? 2 : 1;
    const startGrid = Math.ceil(minPrice / step) * step;

    for (let p = startGrid; p <= maxPrice; p += step) {
      const y = getY(p);
      if (y < -30 || y > chartHeight + 30) continue;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${p.toFixed(2)}`, chartWidth + 6, y + 3.5);
    }

    // Liquidity Zones
    liquidityZones.forEach((zone) => {
      const yTop = getY(zone.priceTop);
      const yBottom = getY(zone.priceBottom);
      const h = Math.max(4, Math.abs(yBottom - yTop));
      const yStart = Math.min(yTop, yBottom);

      if (zone.type === "BSL") {
        ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      } else if (zone.type === "SSL") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      } else {
        ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      }

      ctx.fillRect(0, yStart, chartWidth, h);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, yStart, chartWidth, h);
      ctx.setLineDash([]);

      ctx.fillStyle =
        zone.type === "BSL" ? "#f87171" : zone.type === "SSL" ? "#34d399" : "#fbbf24";
      ctx.font = '10px "Cairo", sans-serif';
      ctx.textAlign = "right";
      ctx.fillText(
        `${zone.nameAr} ($${zone.priceBottom.toFixed(1)} - $${zone.priceTop.toFixed(1)})`,
        chartWidth - 8,
        yStart + 12
      );
    });

    // Volume Profile (VP)
    const volumeProfileMap: { [priceKey: string]: { total: number; buy: number; sell: number } } = {};
    let maxProfileVol = 1;

    visibleBars.forEach((bar) => {
      bar.levels.forEach((lvl) => {
        const pKey = Math.round(lvl.price * 2) / 2;
        if (!volumeProfileMap[pKey]) {
          volumeProfileMap[pKey] = { total: 0, buy: 0, sell: 0 };
        }
        volumeProfileMap[pKey].total += lvl.totalQty;
        volumeProfileMap[pKey].buy += lvl.askQty;
        volumeProfileMap[pKey].sell += lvl.bidQty;
        if (volumeProfileMap[pKey].total > maxProfileVol) {
          maxProfileVol = volumeProfileMap[pKey].total;
        }
      });
    });

    const vpMaxWidth = 110;
    const vpStartX = chartWidth - vpMaxWidth - 15;

    Object.entries(volumeProfileMap).forEach(([pStr, data]) => {
      const p = parseFloat(pStr);
      if (p < minPrice || p > maxPrice) return;
      const y = getY(p);
      if (y < -20 || y > chartHeight + 20) return;

      const barH = Math.max(3, (effectiveHeight / priceDiff) * 0.45);
      const wRatio = Math.min(1, data.total / maxProfileVol);
      const currentVpW = wRatio * vpMaxWidth;

      ctx.fillStyle = "rgba(30, 41, 59, 0.45)";
      ctx.fillRect(vpStartX, y - barH / 2, vpMaxWidth, barH);

      const buyWidth = currentVpW * (data.buy / (data.total || 1));
      ctx.fillStyle = "rgba(16, 185, 129, 0.55)";
      ctx.fillRect(vpStartX, y - barH / 2, buyWidth, barH);

      ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
      ctx.fillRect(vpStartX + buyWidth, y - barH / 2, currentVpW - buyWidth, barH);

      ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(vpStartX, y - barH / 2, currentVpW, barH);
    });

    // Footprint Candles
    visibleBars.forEach((bar, idx) => {
      const x = 20 + idx * colStep;
      const isBull = bar.close >= bar.open;
      const yHigh = getY(bar.high);
      const yLow = getY(bar.low);

      // Wick
      ctx.strokeStyle = isBull ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, yHigh);
      ctx.lineTo(x + barWidth / 2, yLow);
      ctx.stroke();

      const numLevels = bar.levels.length;
      if (numLevels > 0) {
        const rowH = Math.max(14, (Math.abs(yLow - yHigh) / numLevels) * verticalZoom || 16);
        const halfW = (barWidth - 4) / 2;

        bar.levels.forEach((lvl) => {
          const yLvl = getY(lvl.price) - rowH / 2;
          if (yLvl < -30 || yLvl > chartHeight + 30) return;

          // Bid side (left)
          if (lvl.isBidImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(225, 29, 72, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          }
          ctx.fillRect(x + 2, yLvl, halfW, rowH - 1);

          // Ask side (right)
          if (lvl.isAskImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          }
          ctx.fillRect(x + 2 + halfW, yLvl, halfW, rowH - 1);

          // POC border highlight
          if (lvl.isPOC && settings.showPOC) {
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, yLvl - 0.5, barWidth - 2, rowH);
          }

          // Bid volume text
          ctx.fillStyle = lvl.isBidImbalance ? "#fecdd3" : "#94a3b8";
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = "right";
          ctx.fillText(lvl.bidQty.toFixed(1), x + halfW - 2, yLvl + rowH / 2 + 3);

          // Ask volume text
          ctx.fillStyle = lvl.isAskImbalance ? "#a7f3d0" : "#94a3b8";
          ctx.textAlign = "left";
          ctx.fillText(lvl.askQty.toFixed(1), x + halfW + 4, yLvl + rowH / 2 + 3);
        });
      }

      // Candle Delta & Volume Footer
      const footerY = chartHeight + 16;
      ctx.fillStyle = bar.delta >= 0 ? "#34d399" : "#f87171";
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText(
        `${bar.delta >= 0 ? "+" : ""}${bar.delta.toFixed(0)}`,
        x + barWidth / 2,
        footerY
      );

      ctx.fillStyle = "#64748b";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${bar.volume.toFixed(0)}`, x + barWidth / 2, footerY + 14);

      // Time
      const date = new Date(bar.time);
      const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      ctx.fillText(timeStr, x + barWidth / 2, footerY + 28);
    });

    // -------------------------------------------------------------
    // RENDER SAVED TECHNICAL DRAWINGS (Support, Resistance, Trendlines)
    // -------------------------------------------------------------
    if (showDrawings && drawings.length > 0) {
      drawings.forEach((drawing) => {
        ctx.save();
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = drawing.lineWidth || 1.5;

        if (drawing.lineStyle === "dashed") {
          ctx.setLineDash([6, 4]);
        } else if (drawing.lineStyle === "dotted") {
          ctx.setLineDash([2, 3]);
        } else {
          ctx.setLineDash([]);
        }

        if (drawing.type === "support" || drawing.type === "resistance") {
          const p = drawing.points[0]?.price || drawing.price || 0;
          const y = getY(p);

          if (y >= -40 && y <= chartHeight + 40) {
            // Horizontal Ray across chart
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartWidth, y);
            ctx.stroke();

            // Label pill on the chart line
            const distFromCur = (p - currentPrice).toFixed(2);
            const distSign = p >= currentPrice ? "+" : "";
            const isSupport = drawing.type === "support";
            const badgeText = `${drawing.source === "ai" ? "🤖 " : isSupport ? "🟢 " : "🔴 "}${drawing.label || (isSupport ? "دعم" : "مقاومة")} (${distSign}${distFromCur}$)`;

            ctx.font = 'bold 10px "Cairo", sans-serif';
            const textMetrics = ctx.measureText(badgeText);
            const pillW = textMetrics.width + 14;

            // Background box for label
            ctx.fillStyle = "rgba(10, 15, 26, 0.92)";
            ctx.fillRect(12, y - 18, pillW, 16);
            ctx.strokeStyle = drawing.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(12, y - 18, pillW, 16);

            ctx.fillStyle = drawing.color;
            ctx.textAlign = "left";
            ctx.fillText(badgeText, 18, y - 6);

            // Right Price Scale Badge
            ctx.fillStyle = drawing.source === "ai" ? "#581c87" : isSupport ? "#064e3b" : "#881337";
            ctx.fillRect(chartWidth + 2, y - 9, 65, 18);
            ctx.strokeStyle = drawing.color;
            ctx.strokeRect(chartWidth + 2, y - 9, 65, 18);

            ctx.fillStyle = "#ffffff";
            ctx.font = 'bold 10px "JetBrains Mono", monospace';
            ctx.textAlign = "left";
            ctx.fillText(`$${p.toFixed(2)}`, chartWidth + 5, y + 4);
          }
        } else if (drawing.type === "trendline" && drawing.points.length >= 2) {
          const p1 = drawing.points[0];
          const p2 = drawing.points[1];

          const y1 = getY(p1.price);
          const y2 = getY(p2.price);
          const x1 = getXFromTime(p1.time);
          const x2 = getXFromTime(p2.time);

          if (x1 !== null && x2 !== null) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // End point circles
            ctx.fillStyle = drawing.color;
            ctx.beginPath();
            ctx.arc(x1, y1, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x2, y2, 4, 0, Math.PI * 2);
            ctx.fill();

            // Midpoint label
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const labelText = `${drawing.source === "ai" ? "🤖 " : "📈 "}${drawing.label || "خط اتجاه"}`;

            ctx.font = 'bold 9.5px "Cairo", sans-serif';
            const m = ctx.measureText(labelText);
            ctx.fillStyle = "rgba(10, 15, 26, 0.9)";
            ctx.fillRect(midX - m.width / 2 - 4, midY - 18, m.width + 8, 15);
            ctx.strokeStyle = drawing.color;
            ctx.lineWidth = 1;
            ctx.strokeRect(midX - m.width / 2 - 4, midY - 18, m.width + 8, 15);

            ctx.fillStyle = drawing.color;
            ctx.textAlign = "center";
            ctx.fillText(labelText, midX, midY - 7);
          }
        }

        ctx.restore();
      });
    }

    // -------------------------------------------------------------
    // INTERACTIVE DRAWING PREVIEW (Following the mouse cursor)
    // -------------------------------------------------------------
    if (activeTool === "support" || activeTool === "resistance") {
      if (mousePos && mousePos.x < chartWidth && mousePos.y < chartHeight) {
        const hoverPrice = getPriceFromY(mousePos.y);
        const isSup = activeTool === "support";
        const previewColor = isSup ? DEFAULT_COLORS.support : DEFAULT_COLORS.resistance;

        ctx.save();
        ctx.strokeStyle = previewColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(chartWidth, mousePos.y);
        ctx.stroke();

        // Label beside cursor
        ctx.fillStyle = previewColor;
        ctx.font = 'bold 10px "Cairo", sans-serif';
        ctx.textAlign = "left";
        const tag = isSup ? "🟢 انقر لتثبيت مستوى دعم" : "🔴 انقر لتثبيت مستوى مقاومة";
        ctx.fillText(`${tag}: $${hoverPrice.toFixed(2)}`, 14, mousePos.y - 8);

        ctx.restore();
      }
    } else if (activeTool === "trendline" && trendlineStart) {
      if (mousePos && mousePos.x < chartWidth && mousePos.y < chartHeight) {
        const y1 = getY(trendlineStart.price);
        const x1 = getXFromTime(trendlineStart.time) || mousePos.x;
        const hoverPrice = getPriceFromY(mousePos.y);

        ctx.save();
        ctx.strokeStyle = selectedColor || DEFAULT_COLORS.trendline;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();

        // Start anchor pulse
        ctx.fillStyle = selectedColor || DEFAULT_COLORS.trendline;
        ctx.beginPath();
        ctx.arc(x1, y1, 5, 0, Math.PI * 2);
        ctx.fill();

        // End anchor dot
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Helper instruction
        ctx.font = 'bold 10px "Cairo", sans-serif';
        ctx.fillStyle = "#38bdf8";
        ctx.textAlign = "left";
        ctx.fillText(`انقر لإنهاء خط الاتجاه عند: $${hoverPrice.toFixed(2)}`, mousePos.x + 8, mousePos.y - 8);

        ctx.restore();
      }
    }

    // Current Price Line
    const curY = getY(currentPrice);
    if (curY >= 0 && curY <= chartHeight) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on Right
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(chartWidth + 2, curY - 9, 65, 18);
      ctx.fillStyle = "#020617";
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${currentPrice.toFixed(2)}`, chartWidth + 5, curY + 4);
    }

    // Crosshair inspection (when in cursor mode)
    if (activeTool === "cursor" && mousePos && mousePos.x < chartWidth && mousePos.y < chartHeight) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoveredPrice = getPriceFromY(mousePos.y);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(chartWidth + 2, mousePos.y - 9, 65, 18);
      ctx.fillStyle = "#f8fafc";
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${hoveredPrice.toFixed(2)}`, chartWidth + 6, mousePos.y + 4);
    }
  }, [
    bars,
    currentPrice,
    liquidityZones,
    settings,
    zoomScale,
    panOffset,
    verticalZoom,
    verticalPan,
    mousePos,
    drawings,
    showDrawings,
    activeTool,
    selectedColor,
    trendlineStart,
  ]);

  // -------------------------------------------------------------
  // MOUSE & TOUCH EVENT HANDLERS FOR DRAWING & PANNING
  // -------------------------------------------------------------
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;
    const r = canvas.getBoundingClientRect();
    const clientX = e.clientX - r.left;
    const clientY = e.clientY - r.top;
    const chartWidth = r.width - 70;
    const chartHeight = r.height - 80;

    if (clientX >= chartWidth || clientY >= chartHeight) return;

    // Calculate current price & time from click
    const barWidth = Math.max(65, 85 * zoomScale);
    const colStep = barWidth + 12;
    const visibleCount = Math.floor(chartWidth / colStep);
    const visibleBars = bars.slice(Math.max(0, bars.length - visibleCount - Math.floor(panOffset / colStep)));
    if (visibleBars.length === 0) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleBars.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
    });
    const pad = (maxPrice - minPrice) * 0.08 || 1.5;
    minPrice -= pad;
    maxPrice += pad;
    const priceDiff = Math.max(0.5, maxPrice - minPrice);
    const effectiveHeight = Math.max(100, (chartHeight - 40) * verticalZoom);

    const price = minPrice + ((chartHeight - 20 + verticalPan - clientY) / effectiveHeight) * priceDiff;
    const rawIdx = (clientX - 20 - barWidth / 2) / colStep;
    const clampedIdx = Math.max(0, Math.min(visibleBars.length - 1, Math.round(rawIdx)));
    const time = visibleBars[clampedIdx].time;

    // Handle Active Drawing Mode
    if (activeTool === "support") {
      const newD = createSupportDrawing(price, time, selectedColor || DEFAULT_COLORS.support);
      updateDrawings([...drawings, newD], `تم وضع مستوى دعم عند $${price.toFixed(2)} (حُفظ محلياً)`);
      soundFx.playHudClick();
      return;
    }

    if (activeTool === "resistance") {
      const newD = createResistanceDrawing(price, time, selectedColor || DEFAULT_COLORS.resistance);
      updateDrawings([...drawings, newD], `تم وضع مستوى مقاومة عند $${price.toFixed(2)} (حُفظ محلياً)`);
      soundFx.playHudClick();
      return;
    }

    if (activeTool === "trendline") {
      if (!trendlineStart) {
        setTrendlineStart({ price, time });
        soundFx.playHudClick();
        triggerNotification("حدد الآن النقطة الثانية لإنهاء خط الاتجاه");
      } else {
        const newD = createTrendlineDrawing(
          trendlineStart,
          { price, time },
          selectedColor || DEFAULT_COLORS.trendline
        );
        updateDrawings([...drawings, newD], "تم رسم خط الاتجاه وحفظه في الذاكرة المحلية ✓");
        setTrendlineStart(null);
        soundFx.playSonarPing(880);
      }
      return;
    }

    // Default: Cursor mode handles Drag & Pan
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartY(clientY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const clientX = e.clientX - r.left;
    const clientY = e.clientY - r.top;
    setMousePos({ x: clientX, y: clientY });

    if (isDragging && activeTool === "cursor") {
      const diffX = clientX - dragStartX;
      const diffY = clientY - dragStartY;
      setPanOffset((prev) => prev + diffX);
      setVerticalPan((prev) => prev + diffY);
      setDragStartX(clientX);
      setDragStartY(clientY);
      return;
    }

    const step = Math.max(65, 85 * zoomScale) + 12;
    const chartW = r.width - 70;
    const visCount = Math.floor(chartW / step);
    const visBars = bars.slice(Math.max(0, bars.length - visCount - Math.floor(panOffset / step)));
    const barIndex = Math.floor((clientX - 20) / step);

    if (barIndex >= 0 && barIndex < visBars.length) {
      setHoveredBar(visBars[barIndex]);
    } else {
      setHoveredBar(null);
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden select-none transition-all duration-300 ${
        isHeightExpanded ? "h-[660px] sm:h-[740px]" : "h-full min-h-[460px] sm:min-h-[500px]"
      }`}
    >
      {/* ======================================================== */}
      {/* 🛠️ TOP LEVEL TOOLBAR & TECHNICAL DRAWING SUITE           */}
      {/* ======================================================== */}
      <div className="flex flex-col bg-slate-900/95 border-b border-slate-800 text-xs text-slate-300">
        {/* Row 1: Legends, Height/Zoom and Reset */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 border-b border-slate-800/70 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
              <span className="text-[11px]">اختلال شراء</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-400" />
              <span className="text-[11px]">اختلال بيع</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border-2 border-amber-400 bg-transparent" />
              <span className="text-[11px]">POC</span>
            </div>
          </div>

          {/* Zoom, Pan & Height Controls */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-0.5 rounded-lg flex-wrap">
            <button
              onClick={() => setVerticalPan((p) => p - 40)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-0.5 text-[10px]"
              title="تحريك الشارت للأسفل لرؤية المستويات السفلية"
            >
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">للأسفل</span>
            </button>
            <button
              onClick={() => setVerticalPan((p) => p + 40)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-0.5 text-[10px]"
              title="تحريك الشارت للأعلى لرؤية المستويات العلوية"
            >
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">للأعلى</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            <button
              onClick={() => setVerticalZoom((z) => Math.min(3.0, z + 0.25))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
              title="تكبير الارتفاع الرأسي لشمعات الفوت برنت"
            >
              <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
            </button>
            <button
              onClick={() => setVerticalZoom((z) => Math.max(0.6, z - 0.25))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
              title="تصغير الارتفاع الرأسي"
            >
              <ZoomOut className="w-3.5 h-3.5 text-rose-400" />
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            <button
              onClick={handleCenterOnPrice}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px]"
              title="تركيز الشارت فوراً على السعر الحالي"
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">تركيز</span>
            </button>

            <button
              onClick={() => setIsHeightExpanded(!isHeightExpanded)}
              className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] ${
                isHeightExpanded
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title="توسيع ارتفاع الشارت لرؤية الشمعات بوضوح كامل"
            >
              {isHeightExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isHeightExpanded ? "تصغير الحجم" : "توسيع"}
              </span>
            </button>

            <button
              onClick={handleCenterOnPrice}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
              title="إعادة ضبط القياس"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: TECHNICAL DRAWINGS & AI LEVELS PALETTE (The Requested Feature) */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-slate-950/80 flex-wrap gap-2 text-xs">
          {/* Drawing Tools Group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-amber-400/90 hidden sm:inline ml-1 font-['Cairo']">
              أدوات الرسم الفني:
            </span>

            {/* Tool: Cursor (Pan/Inspect) */}
            <button
              onClick={() => {
                setActiveTool("cursor");
                setTrendlineStart(null);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTool === "cursor"
                  ? "bg-slate-700 text-white shadow-xs border border-slate-600"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              title="وضع المؤشر والتحريك العادي (Pan & Inspect)"
            >
              <MousePointer className="w-3.5 h-3.5 text-slate-300" />
              <span>مؤشر</span>
            </button>

            {/* Tool: Trendline */}
            <button
              onClick={() => {
                setActiveTool("trendline");
                setTrendlineStart(null);
                triggerNotification("وضع رسم خط الاتجاه (Trendline): انقر على نقطة البداية ثم نقطة النهاية");
                soundFx.playHudClick();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTool === "trendline"
                  ? "bg-sky-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)] border border-sky-400"
                  : "bg-slate-800/60 text-sky-300 hover:bg-slate-800 hover:text-white"
              }`}
              title="رسم خط اتجاه (Trendline) يحدد مسار القمم والقيعان"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>خط اتجاه</span>
            </button>

            {/* Tool: Support Level */}
            <button
              onClick={() => {
                setActiveTool("support");
                setSelectedColor(DEFAULT_COLORS.support);
                setTrendlineStart(null);
                triggerNotification("وضع رسم مستوى الدعم: انقر عند السعر المطلوب لتثبيت الخط");
                soundFx.playHudClick();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTool === "support"
                  ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] border border-emerald-400"
                  : "bg-slate-800/60 text-emerald-300 hover:bg-slate-800 hover:text-white"
              }`}
              title="رسم مستوى دعم أفقي يدوي (Support Level)"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>مستوى دعم</span>
            </button>

            {/* Tool: Resistance Level */}
            <button
              onClick={() => {
                setActiveTool("resistance");
                setSelectedColor(DEFAULT_COLORS.resistance);
                setTrendlineStart(null);
                triggerNotification("وضع رسم مستوى المقاومة: انقر عند السعر المطلوب لتثبيت الخط");
                soundFx.playHudClick();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTool === "resistance"
                  ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-rose-400"
                  : "bg-slate-800/60 text-rose-300 hover:bg-slate-800 hover:text-white"
              }`}
              title="رسم مستوى مقاومة أفقي يدوي (Resistance Level)"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>مستوى مقاومة</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-0.5 hidden sm:block" />

            {/* 🧠 Auto Plot AI Analysis Button */}
            <button
              onClick={handlePlotAiLevels}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white hover:opacity-95 shadow-[0_0_14px_rgba(168,85,247,0.4)] active:scale-95 border border-purple-400/50"
              title="تطبيق وإسقاط مستويات الدعم والمقاومة وخطوط الاتجاه المحسوبة بالذكاء الاصطناعي مباشرة على الشارت"
            >
              <Brain className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
              <span>رسم تحليلات الذكاء الاصطناعي 🧠</span>
            </button>
          </div>

          {/* Color Palette, Persistence Status & Management Actions */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Color Selector Pills */}
            <div className="flex items-center bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800 gap-1">
              {[
                { c: DEFAULT_COLORS.support, label: "أخضر" },
                { c: DEFAULT_COLORS.resistance, label: "أحمر" },
                { c: DEFAULT_COLORS.trendline, label: "أزرق" },
                { c: DEFAULT_COLORS.poc, label: "ذهبي" },
                { c: DEFAULT_COLORS.aiTrendline, label: "بنفسجي" },
              ].map(({ c, label }) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                    selectedColor === c ? "ring-2 ring-white scale-110 shadow-xs" : "opacity-70 hover:opacity-100"
                  }`}
                  title={`لون: ${label}`}
                />
              ))}
            </div>

            {/* Visibility Toggle */}
            <button
              onClick={() => {
                setShowDrawings(!showDrawings);
                triggerNotification(showDrawings ? "تم إخفاء الرسومات مؤقتاً" : "تم إظهار الرسومات");
              }}
              className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                showDrawings
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:text-white"
                  : "bg-rose-950/40 text-rose-300 border-rose-800/60"
              }`}
              title={showDrawings ? "إخفاء الرسومات عن الشارت" : "إظهار الرسومات"}
            >
              {showDrawings ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Undo */}
            <button
              onClick={handleUndoDrawing}
              disabled={drawings.length === 0}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="تراجع عن آخر رسم (Undo)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Clear All */}
            <button
              onClick={handleClearAllDrawings}
              disabled={drawings.length === 0}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="مسح كافة الرسومات المحفوظة محلياً (Clear All)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Open Drawings List Manager */}
            <button
              onClick={() => setShowDrawingsManager(!showDrawingsManager)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="عرض وتعديل قائمة الرسومات والمستويات المحفوظة"
            >
              <List className="w-3.5 h-3.5" />
              <span>الرسومات ({drawings.length})</span>
            </button>

            {/* LocalStorage persistence badge */}
            <span
              className="hidden lg:flex items-center gap-1 text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono"
              title="يتم حفظ جميع خطوط الاتجاه ومستويات الدعم والمقاومة تلقائياً في ذاكرة المتصفح (localStorage)"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>حفظ محلي</span>
            </span>
          </div>
        </div>

        {/* Action / Tip Notification Banner (Animated) */}
        {actionNotification && (
          <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-purple-900/90 px-3 py-1 text-[11px] text-cyan-200 border-b border-indigo-500/40 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{actionNotification}</span>
            </span>
            <button
              onClick={() => setActionNotification(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Drawing In-Progress Status Indicator */}
        {activeTool !== "cursor" && (
          <div className="bg-slate-900/90 px-3 py-1 text-[11px] flex items-center justify-between text-amber-300 border-b border-amber-500/30 font-['Cairo']">
            <span>
              {activeTool === "trendline" && !trendlineStart && "📈 وضع رسم خط الاتجاه: انقر على الشارت لتحديد نقطة البداية"}
              {activeTool === "trendline" && trendlineStart && "📈 انقر على الشارت لتحديد نقطة النهاية وتثبيت خط الاتجاه"}
              {activeTool === "support" && "🟢 وضع رسم مستوى الدعم: انقر عند السعر المناسب لتثبيت خط الدعم"}
              {activeTool === "resistance" && "🔴 وضع رسم مستوى المقاومة: انقر عند السعر المناسب لتثبيت خط المقاومة"}
            </span>
            <button
              onClick={() => {
                setActiveTool("cursor");
                setTrendlineStart(null);
              }}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] cursor-pointer"
            >
              إلغاء وضع الرسم (Esc)
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📊 MAIN CANVAS AREA (MOUSE & TOUCH DRAWING ENGINE)       */}
      {/* ======================================================== */}
      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ touchAction: "none" }}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredBar(null);
            setIsDragging(false);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              const t = e.touches[0];
              const r = canvasRef.current?.getBoundingClientRect();
              if (r) {
                // If in drawing mode, handle click
                if (activeTool !== "cursor") {
                  handleCanvasMouseDown({
                    clientX: t.clientX,
                    clientY: t.clientY,
                  } as any);
                  return;
                }
                // Default pan drag
                setIsDragging(true);
                setDragStartX(t.clientX - r.left);
                setDragStartY(t.clientY - r.top);
              }
            }
          }}
          onTouchMove={(e) => {
            if (isDragging && e.touches.length === 1 && activeTool === "cursor") {
              const t = e.touches[0];
              const r = canvasRef.current?.getBoundingClientRect();
              if (r) {
                const clientX = t.clientX - r.left;
                const clientY = t.clientY - r.top;
                const diffX = clientX - dragStartX;
                const diffY = clientY - dragStartY;
                setPanOffset((prev) => prev + diffX);
                setVerticalPan((prev) => prev + diffY);
                setDragStartX(clientX);
                setDragStartY(clientY);
              }
            }
          }}
          onTouchEnd={() => setIsDragging(false)}
          className={`w-full h-full block ${
            activeTool === "cursor" ? "cursor-crosshair" : "cursor-cell"
          }`}
        />

        {/* Hovered Candle Details Card */}
        {hoveredBar && activeTool === "cursor" && (
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md z-20 font-['JetBrains_Mono']">
            <div className="text-amber-400 font-bold mb-1 border-b border-slate-800 pb-1 flex justify-between gap-4 font-['Cairo']">
              <span>تفاصيل شمعة الفوت برنت</span>
              <span className="font-mono text-slate-300">
                {new Date(hoveredBar.time).toLocaleTimeString("ar-EG")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
              <div>
                افتتاح: <span className="text-white">${hoveredBar.open.toFixed(2)}</span>
              </div>
              <div>
                إغلاق: <span className="text-white">${hoveredBar.close.toFixed(2)}</span>
              </div>
              <div>
                أعلى: <span className="text-emerald-400">${hoveredBar.high.toFixed(2)}</span>
              </div>
              <div>
                أدنى: <span className="text-rose-400">${hoveredBar.low.toFixed(2)}</span>
              </div>
              <div>
                حجم الشمعة: <span className="text-amber-300">{hoveredBar.volume.toFixed(1)} Oz</span>
              </div>
              <div>
                دلتا الشمعة:{" "}
                <span
                  className={
                    hoveredBar.delta >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"
                  }
                >
                  {hoveredBar.delta >= 0 ? "+" : ""}
                  {hoveredBar.delta.toFixed(1)}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800/80 text-[11px] text-sky-400">
                POC (أعلى حجم): ${hoveredBar.pocPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 📋 SAVED DRAWINGS MANAGEMENT MODAL/DRAWER                */}
        {/* ======================================================== */}
        {showDrawingsManager && (
          <div className="absolute top-2 right-2 sm:right-4 w-72 sm:w-80 max-h-[85%] bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-3 z-30 flex flex-col font-['Cairo'] text-xs backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="font-black text-amber-300 flex items-center gap-1.5">
                <List className="w-4 h-4 text-amber-400" />
                <span>إدارة الرسومات والمستويات ({drawings.length})</span>
              </span>
              <button
                onClick={() => setShowDrawingsManager(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {drawings.length === 0 ? (
              <div className="p-4 text-center text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <p>لا توجد رسومات أو مستويات محفوظة حالياً.</p>
                <p className="text-[11px] text-slate-500">
                  استخدم شريط الأدوات بالأعلى لرسم خط اتجاه أو دعم أو اضغط «رسم تحليلات الذكاء الاصطناعي».
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {drawings.map((d, idx) => {
                  const isSup = d.type === "support";
                  const isRes = d.type === "resistance";
                  const isTl = d.type === "trendline";

                  return (
                    <div
                      key={d.id}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: d.color }}
                        />
                        <div className="overflow-hidden">
                          <span className="font-bold text-white block truncate">
                            {d.label || (isSup ? "مستوى دعم" : isRes ? "مستوى مقاومة" : "خط اتجاه")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {d.price
                              ? `$${d.price.toFixed(2)}`
                              : isTl && d.points.length >= 2
                              ? `$${d.points[0].price} ➔ $${d.points[1].price}`
                              : ""}
                            {d.source === "ai" && " • 🤖 ذكاء اصطناعي"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteDrawing(d.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        title="حذف هذا الرسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {drawings.length > 0 && (
              <div className="pt-2 border-t border-slate-800 mt-2 flex justify-between items-center text-[11px]">
                <button
                  onClick={handleClearAllDrawings}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>مسح الكل</span>
                </button>
                <span className="text-slate-400 text-[10px]">
                  مخزنة في الـ LocalStorage ✓
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
