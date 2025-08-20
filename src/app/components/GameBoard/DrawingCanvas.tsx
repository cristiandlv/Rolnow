"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/utils/firebaseConfig";
import { doc, updateDoc, onSnapshot, arrayUnion } from "firebase/firestore";

export interface Stroke {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
  erase: boolean;
}

interface DrawingCanvasProps {
  roomId: string;
  strokeColor: string;
  strokeWidth: number;
  clearTrigger: boolean;
  onClearDone?: () => void;
  isDrawingMode: boolean;
  isEraserMode: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
  disableDrawing?: boolean;
  onRequestExitDrawing?: () => void;
}

export default function DrawingCanvas({
  roomId,
  strokeColor,
  strokeWidth,
  clearTrigger,
  onClearDone,
  isDrawingMode,
  isEraserMode,
  parentRef,
  disableDrawing,
  onRequestExitDrawing,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const pendingStrokesRef = useRef<Stroke[]>([]);
  const batchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const roomRef = doc(db, "rooms", roomId);

  // ------------------------- Resize canvas -------------------------
  const resizeCanvas = useCallback(() => {
    const parent = parentRef.current;
    const canvas = canvasRef.current;
    if (!parent || !canvas) return;
    const { scrollWidth, scrollHeight } = parent;
    const width = scrollWidth || 1200;
    const height = scrollHeight || 1200;

    const snapshot = document.createElement("canvas");
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext("2d")?.drawImage(canvas, 0, 0);

    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(snapshot, 0, 0);
  }, [parentRef]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // ------------------------- Helpers -------------------------
  const getPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] ?? e.changedTouches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    ctx.beginPath();
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = s.width;
    ctx.strokeStyle = s.color;
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.stroke();
  };

  // ------------------------- Batching -------------------------
  const flushStrokes = useCallback(() => {
    if (pendingStrokesRef.current.length === 0) return;
    updateDoc(roomRef, { strokes: arrayUnion(...pendingStrokesRef.current) }).catch(console.error);
    pendingStrokesRef.current = [];
  }, [roomRef]);

  useEffect(() => {
    if (!batchIntervalRef.current) {
      batchIntervalRef.current = setInterval(flushStrokes, 100);
    }
    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
        batchIntervalRef.current = null;
      }
      flushStrokes();
    };
  }, [flushStrokes]);

  // ------------------------- Event handlers -------------------------
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || disableDrawing || !canvasRef.current) return;
    if ("touches" in e) e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getPoint(e);
    lastPointRef.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    if ("touches" in e) e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    const last = lastPointRef.current ?? { x, y };

    const stroke: Stroke = {
      x0: last.x,
      y0: last.y,
      x1: x,
      y1: y,
      color: strokeColor,
      width: strokeWidth,
      erase: isEraserMode,
    };

    drawStroke(ctx, stroke);
    strokesRef.current.push(stroke);
    pendingStrokesRef.current.push(stroke);

    lastPointRef.current = { x, y };
  };

  const endDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // ------------------------- Clear canvas -------------------------
  useEffect(() => {
    if (!clearTrigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // limpiar local
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    pendingStrokesRef.current = [];

    // limpiar Firestore para todos
    updateDoc(roomRef, { strokes: [] }).catch(console.error);

    onClearDone?.();
  }, [clearTrigger, onClearDone, roomRef]);

  // ------------------------- Firestore listener -------------------------
  useEffect(() => {
    const unsub = onSnapshot(roomRef, (snap) => {
      const data = snap.data() as any;
      const canvas = canvasRef.current;
      if (!data || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const remoteStrokes: Stroke[] = data.strokes ?? [];

      // si borraron todo => limpiar canvas
      if (remoteStrokes.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokesRef.current = [];
        pendingStrokesRef.current = [];
        return;
      }

      // dibujar solo los trazos nuevos
      const newStrokes = remoteStrokes.slice(strokesRef.current.length);
      newStrokes.forEach((s) => drawStroke(ctx, s));
      strokesRef.current = remoteStrokes;
    });
    return () => unsub();
  }, [roomRef]);

  // ------------------------- Render -------------------------
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: isDrawingMode ? "auto" : "none",
        cursor: isEraserMode ? "cell" : "crosshair",
        touchAction: "none",
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
    />
  );
}
