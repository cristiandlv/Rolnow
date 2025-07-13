"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaTools,
  FaComments,
  FaTimes,
  FaPen,
  FaTrash,
  FaDownload,
  FaEraser,
  FaQuestionCircle,
} from "react-icons/fa";
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import GridBoard from "../components/GameBoard/GridBoard";
import TokenPalette from "../components/toolsrpg/TokenPalette";
import ChatBox from "../components/ChatBox";
import DrawingCanvas from "../components/GameBoard/DrawingCanvas";
import { DiceType } from "@/utils/types";

export interface CellToken {
  id: number;
  tokenId: string;
}

export default function TablePage() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [rolledDice, setRolledDice] = useState<{ type: DiceType; value: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [tokens, setTokens] = useState<CellToken[]>([]);
  const [showGameBoard, setShowGameBoard] = useState(false);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#10b981");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [showDrawingMenu, setShowDrawingMenu] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [showTooltip, setShowTooltip] = useState<"tools" | "drawing" | "dice" | "tokens" | null>(null);

  const gridWrapperRef = useRef<HTMLDivElement>(null);

  // Desactivar dibujo automáticamente cuando se inicia drag o pointer down en un token
  const handleTokenPointerDown = () => {
    setIsDrawingMode(false);
    setShowDrawingMenu(false);
    setIsErasing(false);
  };

  const handleTokenDragStart = () => {
    setIsDrawingMode(false);
    setShowDrawingMenu(false);
    setIsErasing(false);
  };

  // Desactivar dibujo automáticamente cuando se hace scroll en el grid completo
  useEffect(() => {
    const container = gridWrapperRef.current;
    if (!container) return;

    const onScroll = () => {
      if (isDrawingMode || isErasing) {
        setIsDrawingMode(false);
        setShowDrawingMenu(false);
        setIsErasing(false);
      }
    };

    container.addEventListener("scroll", onScroll);

    return () => container.removeEventListener("scroll", onScroll);
  }, [isDrawingMode, isErasing]);

  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      const draggedFromTokenPalette = (e.target as HTMLElement)?.closest(".draggable-token");
      const draggedFromBoard = (e.target as HTMLElement)?.closest(".token-on-board");
      if (draggedFromTokenPalette || draggedFromBoard) {
        setIsDrawingMode(false);
        setShowDrawingMenu(false);
        setIsErasing(false);
      }
    };
    window.addEventListener("dragstart", handleGlobalDragStart);
    return () => window.removeEventListener("dragstart", handleGlobalDragStart);
  }, []);

  useEffect(() => {
    if (rolledDice) {
      setShowGameBoard(true);
      const timeout = setTimeout(() => setShowGameBoard(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [rolledDice]);

  const handleClearCanvas = () => setClearTrigger(true);

  const handleDownload = async () => {
    const gridWrapper = document.getElementById("grid-board-inner");
    const drawingCanvas = document.querySelector("#drawing-layer") as HTMLCanvasElement;

    if (!gridWrapper || !drawingCanvas) return;

    const html2canvas = (await import("html2canvas-pro")).default;

    const width = gridWrapper.clientWidth;
    const height = gridWrapper.clientHeight;

    const domCanvas = await html2canvas(gridWrapper, {
      backgroundColor: null,
      useCORS: true,
      width,
      height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: width,
      windowHeight: height,
    });

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = height;

    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(domCanvas, 0, 0, width, height);
    ctx.drawImage(drawingCanvas, 0, 0, width, height);

    finalCanvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = "rolnow-tablero.png";
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  return (
    <main className="relative w-screen h-screen bg-gray-900 text-white select-none">
      {/* Wrapper con scroll */}
      <div
        id="grid-board-wrapper"
        ref={gridWrapperRef}
        className="absolute top-0 left-0 right-0 bottom-0"
        style={{
          position: "relative",
          overflow: "auto",
        }}
      >
        {/* GridBoard debe tener tamaño grande para activar scroll */}
        <GridBoard
          tokens={tokens}
          setTokens={setTokens}
          rolledDice={rolledDice}
          onTokenPointerDown={handleTokenPointerDown}
          onTokenDragStart={handleTokenDragStart}
          style={{ minWidth: 1200, minHeight: 1200 }} // ejemplo: grid grande para scroll
        />
        <DrawingCanvas
          id="drawing-layer"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          clearTrigger={clearTrigger}
          onClearDone={() => setClearTrigger(false)}
          isDrawingMode={isDrawingMode}
          isEraserMode={isErasing}
          parentRef={gridWrapperRef as React.RefObject<HTMLDivElement>}
        />
      </div>
{showGameBoard && rolledDice && (
  <div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 bg-opacity-90 text-white rounded-xl shadow-lg pointer-events-none animate-fade-in">
    <GameBoard
      rolledDice={rolledDice}
      isShaking={isShaking}
      tokens={tokens.map((t) => t.tokenId)}
    />
  </div>
)}



      {/* Botón y menú dibujo */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-3 pointer-events-auto">
        <div className="relative flex items-center">
          <button
            onClick={() => setShowDrawingMenu((prev) => !prev)}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition
              ${
                showDrawingMenu
                  ? "border-emerald-400 bg-emerald-700 text-gray-900 shadow-lg"
                  : "border-gray-600 bg-gray-800 text-emerald-400 hover:bg-emerald-700 hover:text-gray-900"
              }`}
            aria-label="Herramientas de dibujo"
            type="button"
            title="Herramientas de dibujo"
          >
            <FaPen size={24} />
          </button>
          <button
            onClick={() => setShowTooltip(showTooltip === "drawing" ? null : "drawing")}
            className="ml-1 text-emerald-300 opacity-70 hover:opacity-100"
            title="¿Cómo usar?"
            aria-label="Mostrar ayuda de dibujo"
            type="button"
          >
            <FaQuestionCircle size={18} />
          </button>
        </div>

        {showDrawingMenu && (
          <div className="flex items-center bg-gray-800 p-3 rounded-xl border border-emerald-500 shadow-xl space-x-4 select-auto">
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setIsErasing(false);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center
                ${isDrawingMode && !isErasing ? "bg-emerald-600 text-white" : "bg-gray-700 text-emerald-300"}`}
              title="Lápiz"
              aria-pressed={isDrawingMode && !isErasing}
              type="button"
            >
              <FaPen size={20} />
            </button>
            <button
              onClick={() => {
                setIsDrawingMode(true);
                setIsErasing(true);
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center
                ${isErasing ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-yellow-300"}`}
              title="Goma"
              aria-pressed={isErasing}
              type="button"
            >
              <FaEraser size={20} />
            </button>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              disabled={isErasing}
              className="w-10 h-10 rounded-full border-none cursor-pointer"
              title="Color"
              aria-label="Seleccionar color"
            />
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24 cursor-pointer"
              title="Grosor"
              aria-label="Ajustar grosor del trazo"
            />
            <button
              onClick={handleClearCanvas}
              title="Limpiar dibujo"
              className="text-red-400 hover:text-red-600"
              type="button"
              aria-label="Limpiar dibujo"
            >
              <FaTrash size={20} />
            </button>
            <button
              onClick={handleDownload}
              title="Capturar pantalla"
              className="text-blue-400 hover:text-blue-600"
              type="button"
              aria-label="Capturar pantalla"
            >
              <FaDownload size={20} />
            </button>
          </div>
        )}

        {/* Tooltip dibujo */}
        {showTooltip === "drawing" && (
          <div
            onClick={() => setShowTooltip(null)}
            className="absolute -top-36 left-1/2 -translate-x-1/2 w-[260px] bg-gray-950 bg-opacity-90 text-white text-xs p-3 rounded-lg shadow-lg cursor-pointer z-50 select-none"
            role="tooltip"
            aria-live="polite"
            aria-label="Ayuda de herramientas de dibujo"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 mb-1 font-semibold">
              <FaQuestionCircle /> Herramientas de dibujo
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Activa lápiz o goma para marcar solo sobre el tablero.</li>
              <li>El color y grosor ajustan el trazo.</li>
              <li>
                Presiona el botón <FaDownload className="inline" /> para descargar el tablero completo
                con dibujo.
              </li>
              <li>Haz clic aquí para cerrar esta ayuda.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Botón abrir herramientas + tooltip */}
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-3 select-none">
        {!toolsOpen && (
          <div className="relative flex items-center space-x-1">
            <button
              onClick={() => setToolsOpen(true)}
              className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-gray-800 text-emerald-400 flex items-center justify-center hover:bg-emerald-700 transition"
              aria-label="Abrir herramientas"
              type="button"
            >
              <FaTools size={24} />
            </button>
            <button
              onClick={() => setShowTooltip(showTooltip === "tools" ? null : "tools")}
              className="text-emerald-300 opacity-70 hover:opacity-100"
              aria-label="Mostrar ayuda de herramientas"
              title="¿Cómo usar?"
              type="button"
            >
              <FaQuestionCircle size={20} />
            </button>
          </div>
        )}

        {showTooltip === "tools" && (
          <div
            onClick={() => setShowTooltip(null)}
            className="absolute top-16 left-16 w-72 bg-gray-950 bg-opacity-90 text-white text-xs p-3 rounded-lg shadow-lg cursor-pointer z-50 select-none"
            role="tooltip"
            aria-live="polite"
            aria-label="Ayuda de herramientas"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 mb-1 font-semibold">
              <FaQuestionCircle /> Herramientas
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Usa la barra para lanzar dados y arrastrar tokens al tablero.</li>
              <li>Usa Ctrl + arrastrar para duplicar un token.</li>
              <li>Haz clic derecho sobre un token para borrarlo.</li>
              <li>Haz clic aquí para cerrar esta ayuda.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Botón abrir chat */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 select-none">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full border-2 border-emerald-400 bg-gray-800 text-emerald-400 flex items-center justify-center hover:bg-emerald-700 transition"
            aria-label="Abrir chat"
            type="button"
          >
            <FaComments size={24} />
          </button>
        ) : (
          <ChatBox onClose={() => setChatOpen(false)} />
        )}
      </div>

      {/* Panel herramientas (dados y tokens) */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-emerald-600 shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${toolsOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col select-none`}
      >
        <div className="flex justify-between items-center p-4 border-b border-emerald-600">
          <h3 className="text-xl font-semibold text-emerald-400 select-none flex items-center gap-2">
            🧰 Herramientas
            <button
              onClick={() => setShowTooltip(showTooltip === "dice" ? null : "dice")}
              title="¿Cómo usar dados?"
              aria-label="Mostrar ayuda de dados"
              className="text-emerald-300 hover:text-white transition cursor-pointer"
              type="button"
            >
              <FaQuestionCircle />
            </button>
            <button
              onClick={() => setShowTooltip(showTooltip === "tokens" ? null : "tokens")}
              title="¿Cómo usar tokens?"
              aria-label="Mostrar ayuda de tokens"
              className="text-emerald-300 hover:text-white transition cursor-pointer"
              type="button"
            >
              <FaQuestionCircle />
            </button>
          </h3>
          <button
            onClick={() => setToolsOpen(false)}
            aria-label="Cerrar herramientas"
            className="w-9 h-9 flex items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-700 transition"
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <DicePanel
            onRoll={setRolledDice}
            onStartShake={() => setIsShaking(true)}
            onStopShake={() => setIsShaking(false)}
          />
          <TokenPalette />
        </div>
      </aside>

      {/* Tooltips dados y tokens */}
      {showTooltip === "dice" && (
        <div
          onClick={() => setShowTooltip(null)}
          className="fixed top-20 left-80 w-64 bg-gray-950 bg-opacity-90 text-white text-xs p-3 rounded-lg shadow-lg cursor-pointer z-50 select-none"
          role="tooltip"
          aria-live="polite"
          aria-label="Ayuda de dados"
          tabIndex={0}
        >
          <div className="flex items-center gap-2 mb-1 font-semibold">
            <FaQuestionCircle /> Dados
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>Haz clic en un dado para lanzarlo.</li>
            <li>Los resultados se muestran con animación.</li>
            <li>Haz clic aquí para cerrar esta ayuda.</li>
          </ul>
        </div>
      )}

      {showTooltip === "tokens" && (
        <div
          onClick={() => setShowTooltip(null)}
          className="fixed top-[calc(20rem)] left-80 w-64 bg-gray-950 bg-opacity-90 text-white text-xs p-3 rounded-lg shadow-lg cursor-pointer z-50 select-none"
          role="tooltip"
          aria-live="polite"
          aria-label="Ayuda de tokens"
          tabIndex={0}
        >
          <div className="flex items-center gap-2 mb-1 font-semibold">
            <FaQuestionCircle /> Tokens
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>Arrastra tokens al tablero para usarlos.</li>
            <li>Ctrl + arrastrar duplica el token.</li>
            <li>Click derecho sobre un token para borrarlo.</li>
            <li>Haz clic aquí para cerrar esta ayuda.</li>
          </ul>
        </div>
      )}
    </main>
  );
}
