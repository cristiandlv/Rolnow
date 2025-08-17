"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaTools,
  FaComments,
  FaTimes,
  FaPen,
  FaTrash,
  FaEraser,
  FaRegCopy,
  FaLink,
} from "react-icons/fa";
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import GridBoard from "../components/GameBoard/GridBoard";
import TokenPalette from "../components/toolsrpg/TokenPalette";
import ChatBox from "../components/ChatBox";
import DrawingCanvas from "../components/GameBoard/DrawingCanvas";
import { DiceType } from "@/utils/types";
import { db } from "@/utils/firebaseConfig";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  // 👉 añadidos:
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { CellToken } from "../table/page";

// ---------------------------
// TYPES
// ---------------------------
type RollPayload = {
  type: DiceType;
  value: number;
  nonce: string;
  at: number;
  by?: string; // 👉 quién tiró
};

interface TablePageProps {
  roomId: string;
}

// ---------------------------
// ROOM LINK FLOTANTE
// ---------------------------
function RoomLinkFloating({ roomId }: { roomId: string }) {
  const [roomName, setRoomName] = useState("");
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  const roomRef = doc(db, "rooms", roomId);

  useEffect(() => {
    const fetchRoom = async () => {
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        setRoomName(data.name || "");
      }
    };
    fetchRoom();
  }, [roomId]);

  const saveRoomName = async () => {
    await updateDoc(roomRef, { name: roomName });
    setEditing(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/table/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles!", { position: "top-center", autoClose: 2000 });
  };

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 flex flex-col items-end">
      <button
        onClick={() => setOpen(!open)}
        className="p-3 bg-gray-800 rounded-full shadow-lg hover:bg-emerald-600 transition-transform transform hover:scale-110"
        title="Abrir panel de la sala"
      >
        <FaLink className="text-white" />
      </button>

      <div
        className={`mt-2 w-52 sm:w-48 bg-gray-800/95 backdrop-blur-sm p-3 rounded-xl border border-emerald-500 shadow-lg flex flex-col gap-1 transition-all duration-300 overflow-hidden ${
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          {editing ? (
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onBlur={saveRoomName}
              onKeyDown={(e) => e.key === "Enter" && saveRoomName()}
              className="bg-gray-700 text-white px-2 py-1 rounded w-full"
              autoFocus
            />
          ) : (
            <h4
              className="text-white font-semibold cursor-pointer truncate"
              onClick={() => setEditing(true)}
              title="Click para editar"
            >
              {roomName || "Nombre de la sala"}
            </h4>
          )}
          <button
            onClick={copyLink}
            className="ml-2 p-1 bg-gray-700 rounded hover:bg-emerald-600 transition-colors"
            title="Copiar link"
          >
            <FaRegCopy className="text-white" />
          </button>
        </div>
        <p className="text-gray-400 text-xs truncate">Link listo para compartir</p>
      </div>
    </div>
  );
}

// ---------------------------
// MAIN TABLE PAGE
// ---------------------------
export default function TablePage({ roomId }: TablePageProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [tokens, _setTokens] = useState<CellToken[]>([]);
  const [rolledDice, setRolledDice] = useState<RollPayload | null>(null);
  const [drawing, setDrawing] = useState<string | null>(null);

  const [isShaking, setIsShaking] = useState(false);
  const [showGameBoard, setShowGameBoard] = useState(false);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#10b981");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [clearTrigger, setClearTrigger] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [disableDrawing, setDisableDrawing] = useState(false);

  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const roomRef = roomId ? doc(db, "rooms", roomId) : null;

  const tokensRef = useRef<CellToken[]>([]);
  const lastRollNonceRef = useRef<string | null>(null);
  const drawingRef = useRef<string | null>(null);
  const toolsOpenRef = useRef(toolsOpen);

  const [toastPending, setToastPending] = useState<RollPayload | null>(null);

  useEffect(() => {
    toolsOpenRef.current = toolsOpen;
  }, [toolsOpen]);

  // 👉 username desde localStorage (como usa tu ChatBox)
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("rpg-username") || "Anon"
      : "Anon";

  // ---------------------------
  // FIRESTORE SYNC
  // ---------------------------
  const ensureRoomDoc = async () => {
    if (!roomRef) return;
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      await setDoc(roomRef, {
        tokens: [],
        rolledDice: null,
        drawing: null,
        updatedAt: Date.now(),
      });
    }
  };

  useEffect(() => {
    if (!roomRef) return;
    let unsub: (() => void) | undefined;

    (async () => {
      await ensureRoomDoc();
      unsub = onSnapshot(roomRef, (snap) => {
        const data = snap.data() as any;
        if (!data) return;

        // Tokens
        if (Array.isArray(data.tokens)) {
          const incoming = data.tokens as CellToken[];
          if (JSON.stringify(incoming) !== JSON.stringify(tokensRef.current)) {
            tokensRef.current = incoming;
            _setTokens(incoming);
          }
        }

        // Dice
        if (data.rolledDice && data.rolledDice.nonce) {
          const incoming: RollPayload = data.rolledDice;
          if (incoming.nonce !== lastRollNonceRef.current) {
            lastRollNonceRef.current = incoming.nonce;
            setRolledDice(incoming);
            setIsShaking(true);
            setShowGameBoard(true);

            if (window.innerWidth <= 640 && toolsOpenRef.current) {
              setToolsOpen(false);
            }

            setToastPending(incoming);
          }
        }

        // Drawing
        if (data.drawing !== undefined && data.drawing !== drawingRef.current) {
          drawingRef.current = data.drawing ?? null;
          setDrawing(drawingRef.current);
        }
      });
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [roomId]);

  // ---------------------------
  // TOKENS LOCAL SETTER
  // ---------------------------
  const setTokensLocal = (
    next: CellToken[] | ((prev: CellToken[]) => CellToken[])
  ) => {
    const resolved =
      typeof next === "function"
        ? (next as (p: CellToken[]) => CellToken[])(tokensRef.current)
        : next;
    tokensRef.current = resolved;
    _setTokens(resolved);
    if (roomRef) updateDoc(roomRef, { tokens: resolved, updatedAt: Date.now() });
  };

  // ---------------------------
  // DICE ROLL HANDLER
  // ---------------------------
  const handleRollFinish = async (type: DiceType, value: number) => {
    setIsShaking(true);
    setShowGameBoard(true);
    if (!roomRef) return;
    const nonce = crypto.randomUUID();
    const payload: RollPayload = {
      type,
      value,
      nonce,
      at: Date.now(),
      by: username, // 👉 guardo quién tiró
    };
    await updateDoc(roomRef, { rolledDice: payload, updatedAt: Date.now() });
  };

  // ---------------------------
  // DRAWING HANDLER
  // ---------------------------
  const handleDrawingChange = async (dataUrl: string) => {
    if (!roomRef) return;
    drawingRef.current = dataUrl;
    setDrawing(dataUrl);
    await updateDoc(roomRef, { drawing: dataUrl, updatedAt: Date.now() });
  };

  // ---------------------------
  // DICE TOAST + MENSAJE EN CHAT
  // ---------------------------
  useEffect(() => {
    if (!toastPending || !roomId) return;

    const SHAKE_MS = 1800;
    const RESULT_MS = 1500;

    const shakeTimer = setTimeout(() => {
      setIsShaking(false);

      const resultTimer = setTimeout(async () => {
        setShowGameBoard(false);
        toast.success(`Resultado: ${toastPending.value}`, {
          position: "top-center",
          autoClose: 2000,
        });

        // 👉 Solo el que tiró manda el mensaje al chat
        if (toastPending.by === username) {
          const texto = `🎲 ${toastPending.by} ha tirado un ${String(
            toastPending.type
          )} y el resultado fue ${toastPending.value}`;
          await addDoc(collection(db, "rooms", roomId, "messages"), {
            user: toastPending.by || "Sistema",
            text: texto,
            createdAt: serverTimestamp(),
          });
        }

        setToastPending(null);
      }, RESULT_MS);

      return () => clearTimeout(resultTimer);
    }, SHAKE_MS);

    return () => clearTimeout(shakeTimer);
  }, [toastPending, roomId, username]);

  // ---------------------------
  // TOKEN EVENTS
  // ---------------------------
  const handleTokenPointerDown = () => {
    setDisableDrawing(true);
    setIsDrawingMode(false);
    setIsErasing(false);
  };

  const handleTokenDragEnd = () => {
    setDisableDrawing(false);
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <main className="relative w-screen h-screen bg-gray-900 text-white select-none">
      {/* Room Link Flotante */}
      <RoomLinkFloating roomId={roomId} />

      {/* Tablero */}
      <div ref={gridWrapperRef} className="absolute inset-0 overflow-auto relative">
        <GridBoard
          tokens={tokens}
          setTokens={setTokensLocal}
          onTokenPointerDown={handleTokenPointerDown}
          onTokenDragEnd={handleTokenDragEnd}
          disableDrawing={disableDrawing}
          style={{ minWidth: 1200, minHeight: 1200 }}
        />

        <DrawingCanvas
          drawing={drawing}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          clearTrigger={clearTrigger}
          onClearDone={() => setClearTrigger(false)}
          isDrawingMode={isDrawingMode}
          isEraserMode={isErasing}
          parentRef={gridWrapperRef}
          onChange={handleDrawingChange}
          disableDrawing={disableDrawing}
        />
      </div>

      {/* Resultado dados */}
      {showGameBoard && rolledDice && (
        <div className="fixed top-24 sm:top-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 rounded-xl shadow-lg transition-all duration-500 ease-out">
          <GameBoard
            rolledDice={{ type: rolledDice.type, value: rolledDice.value }}
            isShaking={isShaking}
            tokens={tokens.map((t) => t.tokenId)}
          />
        </div>
      )}

      {/* Menú dibujo */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap justify-center gap-2 sm:gap-3">
        <button
          onClick={() => {
            setIsDrawingMode(true);
            setIsErasing(false);
          }}
          className={`p-3 rounded-full ${
            isDrawingMode && !isErasing ? "bg-emerald-600" : "bg-gray-700"
          }`}
          title="Dibujar"
        >
          <FaPen />
        </button>
        <button
          onClick={() => {
            setIsDrawingMode(true);
            setIsErasing(true);
          }}
          className={`p-3 rounded-full ${
            isErasing ? "bg-yellow-500 text-gray-900" : "bg-gray-700"
          }`}
          title="Borrar"
        >
          <FaEraser />
        </button>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          disabled={isErasing}
          title="Color"
        />
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          title="Grosor"
        />
        <button
          onClick={() => setClearTrigger(true)}
          className="p-3 bg-red-500 rounded-full"
          title="Limpiar"
        >
          <FaTrash />
        </button>
      </div>

      {/* Panel lateral */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 sm:w-72 bg-gray-900 border-r border-emerald-600 shadow-xl z-50 transition-transform ${
          toolsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-emerald-600">
          <h3 className="text-xl font-semibold text-emerald-400">🧰 Herramientas</h3>
          <button onClick={() => setToolsOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          <DicePanel onRollFinish={handleRollFinish} onRollStart={() => {}} />
          <TokenPalette />
        </div>
      </aside>
      {!toolsOpen && (
        <button
          onClick={() => setToolsOpen(true)}
          className="fixed top-6 left-6 p-3 bg-gray-800 rounded-full z-50"
        >
          <FaTools />
        </button>
      )}

      {/* Chat */}
      <div className="fixed top-6 right-6 z-50">
        {!chatOpen ? (
          <button onClick={() => setChatOpen(true)} className="p-3 bg-gray-800 rounded-full">
            <FaComments />
          </button>
        ) : (
          <ChatBox roomId={roomId} onClose={() => setChatOpen(false)} />
        )}
      </div>
    </main>
  );
}
