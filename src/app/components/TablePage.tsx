"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaTools,
  FaComments,
  FaTimes,
  FaLink,
  FaUser,
  FaRegCopy,
} from "react-icons/fa";
import { RiPencilLine, RiEraserLine, RiDeleteBinLine } from "react-icons/ri"; // ⬅️ Íconos minimalistas
import DicePanel from "../components/DicePanel";
import GameBoard from "../components/GameBoard/GBoardComponent";
import GridBoard from "../components/GameBoard/GridBoard";
import TokenPalette from "../components/toolsrpg/TokenPalette";
import ChatBox from "../components/ChatBox";
import DrawingCanvas from "../components/GameBoard/DrawingCanvas";
import UsernameModal from "../components/UserModal";
import { DiceType } from "@/utils/types";
import { db } from "@/utils/firebaseConfig";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { CellToken } from "../table/page";
import { useRouter } from "next/navigation"; // ⬅️ para redirigir

// ---------------------------
// TYPES
// ---------------------------
type RollPayload = {
  type: DiceType;
  value: number;
  nonce: string;
  at: number;
  by?: string;
};

interface TablePageProps {
  roomId?: string; // opcional, puede generar nuevo
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
  }, [roomRef]);

  const saveRoomName = async () => {
    await updateDoc(roomRef, { name: roomName });
    setEditing(false);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/table/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles!", {
      position: "top-center",
      autoClose: 2000,
    });
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
export default function TablePage({ roomId: propRoomId }: TablePageProps) {
  const [roomId, setRoomId] = useState<string | null>(propRoomId || null);

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

  const [showUserModal, setShowUserModal] = useState(false);

  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const roomRef = roomId ? doc(db, "rooms", roomId) : null;

  const tokensRef = useRef<CellToken[]>([]);
  const lastRollNonceRef = useRef<string | null>(null);
  const drawingRef = useRef<string | null>(null);
  const toolsOpenRef = useRef(toolsOpen);

  const [toastPending, setToastPending] = useState<RollPayload | null>(null);

  const router = useRouter(); // ⬅️

  useEffect(() => {
    toolsOpenRef.current = toolsOpen;
  }, [toolsOpen]);

  // username
  const [username, setUsername] = useState("Anon");
  useEffect(() => {
    const saved = localStorage.getItem("rpg-username");
    if (saved) {
      setUsername(saved);
    } else {
      setShowUserModal(true);
    }
  }, []);

  const handleSaveName = (name: string) => {
    setUsername(name);
    localStorage.setItem("rpg-username", name);
    setShowUserModal(false);
  };

  // ---------------------------
  // VALIDAR ROOM SI LLEGA POR URL
  // ---------------------------
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRoom = async () => {
      // Si NO viene roomId por props, esto es flujo de "crear nueva"
      if (!propRoomId) {
        setRoomExists(true);
        return;
      }

      try {
        const ref = doc(db, "rooms", propRoomId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRoomExists(true);
          // aseguramos state
          setRoomId(propRoomId);
        } else {
          setRoomExists(false);
          toast.error("La sala no existe o fue eliminada. Creá una nueva.", {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
          router.replace("/"); // ⬅️ Redirección al home
        }
      } catch (e) {
        console.error("Error validando sala:", e);
        setRoomExists(false);
        toast.error("No se pudo validar la sala. Intenta desde la página principal.", {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
        router.replace("/");
      }
    };

    checkRoom();
  }, [propRoomId, router]);

  // ---------------------------
  // ROOM GENERATOR (si NO hay roomId en props)
  // ---------------------------
  useEffect(() => {
    const generateRoomIfNeeded = async () => {
      // Si ya hay roomId (prop o state) no generamos
      if (roomId || propRoomId) return;

      const newRoomId = crypto.randomUUID();
      const secretKey = crypto.randomUUID();

      try {
        // Intentamos crear la sala
        await setDoc(doc(db, "rooms", newRoomId), {
          tokens: [],
          rolledDice: null,
          drawing: null,
          createdAt: serverTimestamp(),
          secretKey,
        });

        setRoomId(newRoomId);
        setRoomExists(true);

        toast.success("Sala creada con éxito!", {
          position: "top-center",
          autoClose: 2500,
          pauseOnHover: true,
          theme: "dark",
          style: {
            background: "#065f46",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } catch (error: any) {
        console.error("Error creando la sala:", error);

        // Si el error es de permisos, mostrar mensaje claro
        if (error.code === "permission-denied") {
          toast.error(
            "No tenés permisos para crear salas. Revisá las reglas de Firestore.",
            {
              position: "top-center",
              autoClose: 4000,
              pauseOnHover: true,
              theme: "dark",
              style: {
                background: "#b91c1c",
                color: "#fff",
                fontWeight: "bold",
              },
            }
          );
        } else {
          toast.error("No se pudo crear la sala. Intenta de nuevo.", {
            position: "top-center",
            autoClose: 3500,
            pauseOnHover: true,
            theme: "dark",
            style: {
              background: "#b91c1c",
              color: "#fff",
              fontWeight: "bold",
            },
          });
        }
      }
    };

    generateRoomIfNeeded();
  }, [roomId, propRoomId]);

  // ---------------------------
  // FIRESTORE SYNC
  // ---------------------------
  useEffect(() => {
    if (!roomRef) return;
    let unsub: (() => void) | undefined;

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

    return () => {
      if (unsub) unsub();
    };
  }, [roomId, roomRef]);

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
    if (roomRef)
      updateDoc(roomRef, { tokens: resolved, updatedAt: Date.now() });
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
      by: username,
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
  // TOKEN EVENTS (UX mejorado)
  // ---------------------------
  const handleTokenPointerDown = () => {
    setDisableDrawing(true);
    if (isDrawingMode) {
      setIsDrawingMode(false);
      setIsErasing(false);
    }
  };

  const handleTokenDragEnd = () => {
    setDisableDrawing(false);
  };

  // ---------------------------
  // RENDER (guardias de validación primero)
  // ---------------------------
  if (roomExists === null) {
    return <div className="text-white">Cargando sala...</div>;
  }
  if (roomExists === false) {
    // Evitamos render mientras redirige
    return null;
  }
  if (!roomId) return <div>Cargando sala...</div>;

  return (
    <main className="relative w-screen h-screen bg-gray-900 text-white select-none">
      <RoomLinkFloating roomId={roomId} />

      <div ref={gridWrapperRef} className="absolute inset-0 overflow-auto relative">
        <GridBoard
          tokens={tokens}
          setTokens={setTokensLocal}
          onTokenPointerDown={handleTokenPointerDown}
          onTokenDragEnd={handleTokenDragEnd}
          style={{ minWidth: 1200, minHeight: 1200 }}
        />

        <DrawingCanvas
  roomId={roomId} // ⬅️ obligatorio para Firestore
  drawing={drawing}
  strokeColor={strokeColor}
  strokeWidth={strokeWidth}
  clearTrigger={clearTrigger}
  onClearDone={() => setClearTrigger(false)}
  isDrawingMode={isDrawingMode}
  isEraserMode={isErasing}
  parentRef={gridWrapperRef}
  disableDrawing={disableDrawing}
  onRequestExitDrawing={() => {
    setIsDrawingMode(false);
    setIsErasing(false);
  }}
/>

        {/* Indicador de modo activo (sin emojis) */}
        {isDrawingMode && (
  <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-600 text-white shadow-xl z-40 animate-pulse">
    {isErasing ? "Modo Borrador" : "Modo Dibujo"}  
  </div>
)}

      </div>



      {showGameBoard && rolledDice && (
        <div className="fixed top-24 sm:top-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gray-800 rounded-xl shadow-lg transition-all duration-500 ease-out">
          <GameBoard
            rolledDice={{ type: rolledDice.type, value: rolledDice.value }}
            isShaking={isShaking}
            tokens={tokens.map((t) => t.tokenId)}
          />
        </div>
      )}

      {/* Menú dibujo — íconos minimalistas */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-800/90 px-4 py-2 rounded-2xl shadow-xl border border-emerald-500">
        {/* Lápiz */}
        <button
          onClick={() => {
            setIsDrawingMode(!isDrawingMode || isErasing);
            setIsErasing(false);
          }}
          className={`p-3 rounded-full transition-all ${
            isDrawingMode && !isErasing
              ? "bg-emerald-500 text-black shadow-lg scale-110"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          title="Dibujar"
          aria-label="Dibujar"
        >
          <RiPencilLine className="w-5 h-5" />
        </button>

        {/* Goma */}
        <button
          onClick={() => {
            setIsDrawingMode(!isDrawingMode || !isErasing);
            setIsErasing(true);
          }}
          className={`p-3 rounded-full transition-all ${
            isDrawingMode && isErasing
              ? "bg-yellow-400 text-black shadow-lg scale-110"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
          title="Borrar"
          aria-label="Borrar"
        >
          <RiEraserLine className="w-5 h-5" />
        </button>

        {/* Color */}
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          disabled={isErasing}
          className="w-10 h-10 rounded cursor-pointer border border-gray-600"
          aria-label="Color del trazo"
        />

        {/* Grosor */}
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="accent-emerald-500"
          aria-label="Grosor del trazo"
        />

        {/* Limpiar */}
        <button
          onClick={() => setClearTrigger(true)}
          className="p-3 rounded-full bg-red-500 hover:bg-red-400 transition-all text-white"
          title="Limpiar todo"
          aria-label="Limpiar todo"
        >
          <RiDeleteBinLine className="w-5 h-5" />
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

      {/* Nombre actual y botón cambiar */}
      <div className="fixed top-1 left-80 flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full shadow-lg z-50">
        <span
          className="font-semibold text-emerald-400 truncate max-w-[100px]"
          title={username}
        >
          {username}
        </span>
        <button
          onClick={() => setShowUserModal(true)}
          className="p-2 bg-gray-700 rounded-full hover:bg-emerald-600 transition-colors"
          title="Cambiar nombre de usuario"
        >
          <FaUser />
        </button>
      </div>

      {/* Chat */}
      <div className="fixed top-6 right-6 z-50">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="p-3 bg-gray-800 rounded-full"
          >
            <FaComments />
          </button>
        ) : (
          <ChatBox roomId={roomId} onClose={() => setChatOpen(false)} />
        )}
      </div>

      {/* Modal usuario */}
      {showUserModal && (
        <UsernameModal
          initialName={username}
          onSave={handleSaveName}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </main>
  );
}
