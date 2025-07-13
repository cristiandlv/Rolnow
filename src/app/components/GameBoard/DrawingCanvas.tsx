"use client";

import { useEffect, useRef, useCallback } from "react";

export interface DrawingCanvasProps {
  id?: string;
  strokeColor: string;
  strokeWidth: number;
  clearTrigger: boolean;
  onClearDone: () => void;
  isDrawingMode: boolean;
  isEraserMode: boolean;
  parentRef: React.RefObject<HTMLDivElement>; // contenedor scrollable del grid
}

export default function DrawingCanvas({
  id,
  strokeColor,
  strokeWidth,
  clearTrigger,
  onClearDone,
  isDrawingMode,
  isEraserMode,
  parentRef,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  // 🔁 Resizing dinámico con scroll y tamaño visible
  const resizeCanvasToMatchContainer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = parentRef.current;
    if (!canvas || !container) return;

    // Solo cubrimos el área visible (viewport interno)
    const { clientWidth, clientHeight, scrollLeft, scrollTop } = container;

    canvas.width = clientWidth;
    canvas.height = clientHeight;

    // Alineamos el canvas con el scroll actual del contenedor
    canvas.style.top = `${container.offsetTop}px`;
    canvas.style.left = `${container.offsetLeft}px`;

    canvas.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;
  }, [parentRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = parentRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.8;
    ctxRef.current = ctx;

    resizeCanvasToMatchContainer();

    // Escuchar cambios de tamaño y scroll
    window.addEventListener("resize", resizeCanvasToMatchContainer);
    container.addEventListener("scroll", resizeCanvasToMatchContainer);

    return () => {
      window.removeEventListener("resize", resizeCanvasToMatchContainer);
      container.removeEventListener("scroll", resizeCanvasToMatchContainer);
    };
  }, [resizeCanvasToMatchContainer]);

  useEffect(() => {
    if (clearTrigger && ctxRef.current && canvasRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onClearDone();
    }
  }, [clearTrigger, onClearDone]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || e.button !== 0 || !ctxRef.current) return;
    isDrawing.current = true;
    const { x, y } = getCoords(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    e.preventDefault();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing.current || !ctxRef.current) return;
    const { x, y } = getCoords(e);
    ctxRef.current.strokeStyle = strokeColor;
    ctxRef.current.lineWidth = strokeWidth;
    ctxRef.current.globalCompositeOperation = isEraserMode ? "destination-out" : "source-over";
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    e.preventDefault();
  };

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !ctxRef.current) return;
    isDrawing.current = false;
    ctxRef.current.closePath();
    e.preventDefault();
  };

  return (
    <canvas
      id={id}
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: isDrawingMode ? "auto" : "none",
        cursor: isDrawingMode ? "crosshair" : "default",
        zIndex: 20,
      }}
    />
  );
}
