"use client";

import React, { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  drawing?: string | null;          // base64 remoto para pintar
  strokeColor: string;
  strokeWidth: number;
  clearTrigger: boolean;
  onClearDone: () => void;
  isDrawingMode: boolean;
  isEraserMode: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
  onChange?: (dataUrl: string) => void; // se llama al finalizar el trazo
  disableDrawing?: boolean;             // bloquea mientras se arrastra token u otros drags
  onRequestExitDrawing?: () => void;    // pedir apagar el lápiz (auto-off al terminar trazo)
}

export default function DrawingCanvas({
  drawing,
  strokeColor,
  strokeWidth,
  clearTrigger,
  onClearDone,
  isDrawingMode,
  isEraserMode,
  parentRef,
  onChange,
  disableDrawing = false,
  onRequestExitDrawing,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Ajustar tamaño del canvas al contenedor
  const resizeToParent = () => {
    if (!parentRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    const { scrollWidth, scrollHeight } = parentRef.current;
    // conservar el contenido al redimensionar
    const prev = c.toDataURL();
    c.width = scrollWidth || 1200;
    c.height = scrollHeight || 1200;
    // reimprimir el dibujo previo si existe
    if (prev) {
      const img = new Image();
      img.onload = () => c.getContext("2d")?.drawImage(img, 0, 0);
      img.src = prev;
    }
  };

  useEffect(() => {
    resizeToParent();
    const handler = () => resizeToParent();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRef]);

  // Limpiar canvas cuando se dispara clearTrigger
  useEffect(() => {
    if (!clearTrigger || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onClearDone();
    // Notificar nuevo estado
    onChange?.(canvasRef.current.toDataURL());
  }, [clearTrigger, onClearDone, onChange]);

  // Pintar la imagen base64 remota en el canvas cuando cambie `drawing`
  useEffect(() => {
    if (!drawing || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = drawing;
  }, [drawing]);

  // Si se deshabilita el dibujo (por drag de tokens, etc.), pedir salir del modo
  useEffect(() => {
    if (disableDrawing && isDrawingMode) {
      onRequestExitDrawing?.();
    }
  }, [disableDrawing, isDrawingMode, onRequestExitDrawing]);

  // Helpers de puntero (mouse/touch)
  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ("touches" in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("nativeEvent" in e && "offsetX" in (e.nativeEvent as any)) {
      // mouse
      const me = e as React.MouseEvent<HTMLCanvasElement>;
      return { x: me.nativeEvent.offsetX, y: me.nativeEvent.offsetY };
    } else {
      // fallback
      const me = e as any;
      clientX = me.clientX ?? 0;
      clientY = me.clientY ?? 0;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode || disableDrawing || !canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disableDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = isEraserMode ? "#000000" : strokeColor;
    ctx.globalCompositeOperation = isEraserMode ? "destination-out" : "source-over";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!canvasRef.current) return;
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.beginPath();
      // avisar a TablePage que hay nueva imagen
      onChange?.(canvasRef.current.toDataURL());
    }
    // 🔑 Auto-off: al terminar el trazo apagamos el modo dibujo
    if (isDrawingMode) {
      onRequestExitDrawing?.();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        // Solo intercepta eventos si el modo está activo y no está bloqueado por drags
        pointerEvents: isDrawingMode && !disableDrawing ? "auto" : "none",
        // opcional: feedback visual
        cursor: isDrawingMode && !disableDrawing ? (isEraserMode ? "cell" : "crosshair") : "default",
      }}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
    />
  );
}
