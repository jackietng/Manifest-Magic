// src/components/moodboard/DynamicMoodBoard.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { supabase } from "../../lib/supabaseClient";
import MoodItem from "../../components/moodboard/MoodItem";
import { useTheme } from "../../context/ThemeContext";
import { useMood } from "../../context/MoodContext";

export type MoodItemType = {
  id: string;
  type: "image" | "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:5000";
const BOARD_MIN_WIDTH = 600;
const BOARD_MIN_HEIGHT = 800;

const toBase64ViaProxy = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const isSupabaseImage = url.includes("supabase.co");
    const proxyUrl = isSupabaseImage
      ? url
      : `${PROXY_URL}/proxy-image?url=${encodeURIComponent(url)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      try { resolve(canvas.toDataURL("image/jpeg")); }
      catch { resolve(url); }
    };
    img.onerror = () => resolve(url);
    img.src = proxyUrl;
  });
};

const btnBase = "px-3 py-2 text-white rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50 text-sm";

export default function DynamicMoodBoard({
  setSidebarOpen,
  sidebarOpen = false,
}: {
  setSidebarOpen?: (open: boolean) => void;
  sidebarOpen?: boolean;
}) {
  const [items, setItems] = useState<MoodItemType[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [boardName, setBoardName] = useState("");
  const [boardMood, setBoardMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardReady, setBoardReady] = useState(false);
  const [boardError, setBoardError] = useState("");
  const [boardScale, setBoardScale] = useState(1);
  const [initialScale, setInitialScale] = useState<number | null>(null);
  const [boardOriginalWidth, setBoardOriginalWidth] = useState<number | null>(null);
  const [boardOriginalHeight, setBoardOriginalHeight] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const boardScaleRef = useRef(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("board");
  const { theme } = useTheme();
  const { mood } = useMood();
  const isDark = theme === "dark";
  const hintColor = isDark ? "var(--snow)" : "var(--primary)";
  const inputStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: isDark ? "var(--snow)" : "var(--primary)",
  };

  useEffect(() => {
    boardScaleRef.current = boardScale;
    setInitialScale((prev) =>
      prev !== null && Math.abs(prev - boardScale) < 0.001 ? null : prev
    );
  }, [boardScale]);

  const calculateAndSetScale = useCallback(
    (originalWidth: number | null, originalHeight: number | null): number => {
      if (!boardContainerRef.current) return 1;
      const containerWidth = boardContainerRef.current.offsetWidth;
      const viewportHeight = window.innerWidth < 640
        ? window.innerHeight * 0.92
        : window.innerHeight * 0.8;
      const referenceWidth = originalWidth || BOARD_MIN_WIDTH;
      const referenceHeight = originalHeight || viewportHeight;
      const widthScale = containerWidth < referenceWidth ? containerWidth / referenceWidth : 1;
      const heightScale = viewportHeight < referenceHeight ? viewportHeight / referenceHeight : 1;
      const scale = Math.min(widthScale, heightScale);
      setBoardScale(scale);
      boardScaleRef.current = scale;
      return scale;
    },
    []
  );

  useEffect(() => {
    const handleResize = () => calculateAndSetScale(boardOriginalWidth, boardOriginalHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [boardOriginalWidth, boardOriginalHeight, calculateAndSetScale]);

  useEffect(() => {
    if (boardId) return;
    setItems([]);
    setBoardName("");
    setBoardMood("");
    setSaved(false);
    setBoardOriginalWidth(BOARD_MIN_WIDTH);
    setBoardOriginalHeight(BOARD_MIN_HEIGHT);
    setBoardReady(true);
    const rafId = requestAnimationFrame(() => {
      calculateAndSetScale(BOARD_MIN_WIDTH, BOARD_MIN_HEIGHT);
    });
    return () => cancelAnimationFrame(rafId);
  }, [boardId, calculateAndSetScale]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length > 0 && !saved) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [items, saved]);

  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      setBoardLoading(true);
      setBoardReady(false);
      setBoardError("");

      const { data: board, error: boardError } = await supabase
        .from("moodboards")
        .select("name, mood, board_width, board_height")
        .eq("id", boardId)
        .single();

      if (boardError || !board) {
        setBoardError("Failed to load board. Please try again.");
        setBoardLoading(false);
        setBoardReady(true);
        return;
      }

      setBoardName(board.name);
      setBoardMood(board.mood || "");

      const savedWidth = board.board_width || null;
      const savedHeight = board.board_height || null;

      setBoardOriginalWidth(savedWidth);
      setBoardOriginalHeight(savedHeight);

      const { data: boardItems, error: itemsError } = await supabase
        .from("moodboard_items")
        .select("*")
        .eq("board_id", boardId);

      if (itemsError) {
        setBoardError("Failed to load board items. Please try again.");
        setBoardLoading(false);
        setBoardReady(true);
        return;
      }

      const loadedItems: MoodItemType[] = (boardItems || []).map((item, index) => ({
        id: uuid(),
        type: item.type,
        content: item.content,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        zIndex: item.zIndex || index + 1,
      }));

      const tryMount = (attemptsLeft: number) => {
        if (boardContainerRef.current) {
          const computedScale = calculateAndSetScale(savedWidth, savedHeight);
          boardScaleRef.current = computedScale;
          setInitialScale(computedScale);
          setItems(loadedItems);
          setBoardReady(true);
          setBoardLoading(false);
        } else if (attemptsLeft > 0) {
          requestAnimationFrame(() => tryMount(attemptsLeft - 1));
        } else {
          setItems(loadedItems);
          setBoardReady(true);
          setBoardLoading(false);
        }
      };

      requestAnimationFrame(() => tryMount(30));
    };

    loadBoard();
  }, [boardId, calculateAndSetScale]);

  const addItem = useCallback(
    (type: "image" | "text", content: string) => {
      if (!content.trim()) return;
      const currentScale = boardScaleRef.current;

      if (type === "image") {
        const isSupabaseImage = content.includes("supabase.co");
        const proxyUrl = isSupabaseImage
          ? content
          : `${PROXY_URL}/proxy-image?url=${encodeURIComponent(content)}`;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = proxyUrl;

        img.onload = async () => {
          try { await img.decode(); } catch { /* continue */ }

          const naturalWidth = img.naturalWidth || img.width;
          const naturalHeight = img.naturalHeight || img.height;
          const ratio = naturalWidth / naturalHeight;
          const maxDimension = 500;
          let width = naturalWidth;
          let height = naturalHeight;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) { width = maxDimension; height = Math.round(maxDimension / ratio); }
            else { height = maxDimension; width = Math.round(maxDimension * ratio); }
          }

          setItems((prev) => [...prev, {
            id: uuid(), type: "image", content: proxyUrl,
            x: Math.round(50 / currentScale), y: Math.round(50 / currentScale),
            width, height, zIndex: prev.length + 1,
          }]);
          setImageUrl("");
        };
        img.onerror = () => alert("Failed to load image. Please check the URL.");
      } else {
        setItems((prev) => [...prev, {
          id: uuid(), type: "text", content,
          x: Math.round(100 / currentScale), y: Math.round(100 / currentScale),
          width: Math.round(200 / currentScale), height: Math.round(60 / currentScale),
          zIndex: prev.length + 1,
        }]);
        setTextInput("");
      }
    },
    []
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuid()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("moodboard-images").upload(fileName, file);
    if (uploadError) { alert("Failed to upload image. Please try again."); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("moodboard-images").getPublicUrl(fileName);
    addItem("image", publicUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateItem = (id: string, changes: Partial<MoodItemType>) =>
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, ...changes } : item));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...items.map((item) => item.zIndex));
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, zIndex: maxZ + 1 } : item));
  };

  const sendToBack = (id: string) => {
    setItems((prev) => {
      const minZ = Math.min(...prev.map((item) => item.zIndex));
      const updated = prev.map((item) => item.id === id ? { ...item, zIndex: minZ - 1 } : item);
      const newMin = Math.min(...updated.map((item) => item.zIndex));
      if (newMin < 1) {
        const offset = 1 - newMin;
        return updated.map((item) => ({ ...item, zIndex: item.zIndex + offset }));
      }
      return updated;
    });
  };

  const clearBoard = () => { if (confirm("Clear the entire board?")) setItems([]); };

  const handleDownload = async () => {
    if (!boardRef.current) return;
    if (items.length === 0) { alert("Add some items to your board before downloading!"); return; }
    setDownloading(true);
    try {
      if (setSidebarOpen) { setSidebarOpen(false); await new Promise((res) => setTimeout(res, 350)); }
      const boardWidth = boardOriginalWidth || BOARD_MIN_WIDTH;
      const boardHeight = boardOriginalHeight || BOARD_MIN_HEIGHT;
      const itemsWithBase64 = await Promise.all(items.map(async (item) => {
        if (item.type === "image") return { ...item, content: await toBase64ViaProxy(item.content) };
        return item;
      }));
      const sortedItems = [...itemsWithBase64].sort((a, b) => a.zIndex - b.zIndex);
      const canvas = document.createElement("canvas");
      canvas.width = boardWidth; canvas.height = boardHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");
      ctx.fillStyle = isDark ? "#2a223a" : "#ffffff";
      ctx.fillRect(0, 0, boardWidth, boardHeight);
      for (const item of sortedItems) {
        if (item.type === "image") {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => { ctx.drawImage(img, item.x, item.y, item.width, item.height); resolve(); };
            img.onerror = () => resolve();
            img.src = item.content;
          });
        } else {
          const fontSize = Math.max(12, Math.min(item.width, item.height) * 0.14);
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = isDark ? "#f4f1f0" : "#544683";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          const words = item.content.split(" ");
          const lineHeight = fontSize * 1.3;
          const maxWidth = item.width - 16;
          const lines: string[] = [];
          let currentLine = "";
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) { lines.push(currentLine); currentLine = word; }
            else currentLine = testLine;
          }
          if (currentLine) lines.push(currentLine);
          const totalHeight = lines.length * lineHeight;
          const startY = item.y + (item.height - totalHeight) / 2 + lineHeight / 2;
          lines.forEach((line, i) => ctx.fillText(line, item.x + item.width / 2, startY + i * lineHeight));
        }
      }
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>${boardName}</title><style>body{margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh}img{max-width:100%;height:auto}p{color:white;font-family:sans-serif;font-size:14px;margin-top:16px;opacity:.7;text-align:center;padding:0 16px}</style></head><body><img src="${dataUrl}" alt="${boardName}" /><p>Long press the image and tap "Add to Photos" to save it ✨</p></body></html>`);
          newTab.document.close();
        }
      } else {
        const link = document.createElement("a");
        link.download = `${boardName}.jpg`; link.href = dataUrl; link.click();
      }
    } catch (err) { console.error("Download failed:", err); alert("Download failed. Please try again."); }
    setDownloading(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.setItem(
        "manifest_magic_pending_board",
        JSON.stringify({ items, boardName, boardMood })
      );
      navigate("/login");
      return;
    }
    if (items.length === 0) { alert("Add some items to your board before saving!"); return; }
    setSaving(true);
    const savedWidth = boardOriginalWidth || BOARD_MIN_WIDTH;
    const savedHeight = boardOriginalHeight || BOARD_MIN_HEIGHT;
    const { data: board, error: boardError } = await supabase
      .from("moodboards")
      .insert([{ user_id: user.id, name: boardName, mood: mood || "", board_width: savedWidth, board_height: savedHeight }])
      .select().single();
    if (boardError) { console.error(boardError); alert("Failed to save board. Please try again."); setSaving(false); return; }
    const { error: itemError } = await supabase.from("moodboard_items").insert(
      items.map((item) => ({ board_id: board.id, type: item.type, content: item.content, x: item.x, y: item.y, width: item.width, height: item.height, zIndex: item.zIndex }))
    );
    if (itemError) { console.error(itemError); alert("Failed to save board items. Please try again."); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    setSaving(false);
  };

  return (
    <div className="pb-20 sm:pb-4 min-h-screen">
      {boardError && (
        <div className="mb-4 p-3 rounded-xl text-center text-white mx-2" style={{ backgroundColor: "var(--rose)" }}>
          {boardError}
        </div>
      )}

      {boardLoading ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            zIndex: 9999,
          }}
        >
          {[
            { top: "12%", left: "8%",  size: 5, delay: "0s",    dur: "1.8s" },
            { top: "20%", left: "85%", size: 7, delay: "0.3s",  dur: "2.1s" },
            { top: "35%", left: "15%", size: 4, delay: "0.7s",  dur: "1.5s" },
            { top: "15%", left: "50%", size: 6, delay: "1.1s",  dur: "2.3s" },
            { top: "60%", left: "90%", size: 5, delay: "0.5s",  dur: "1.9s" },
            { top: "70%", left: "20%", size: 8, delay: "1.4s",  dur: "2.0s" },
            { top: "80%", left: "60%", size: 4, delay: "0.2s",  dur: "1.6s" },
            { top: "45%", left: "75%", size: 6, delay: "0.9s",  dur: "2.2s" },
            { top: "88%", left: "35%", size: 5, delay: "1.6s",  dur: "1.7s" },
            { top: "50%", left: "5%",  size: 7, delay: "0.4s",  dur: "2.4s" },
            { top: "25%", left: "40%", size: 4, delay: "1.2s",  dur: "1.5s" },
            { top: "75%", left: "78%", size: 6, delay: "0.8s",  dur: "2.0s" },
          ].map((sp, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top: sp.top,
                left: sp.left,
                width: `${sp.size}px`,
                height: `${sp.size}px`,
                borderRadius: "50%",
                background: "radial-gradient(circle, #ffe066 0%, #b8860b 60%, transparent 100%)",
                boxShadow: "0 0 8px rgba(184,134,11,0.95), 0 0 18px rgba(184,134,11,0.6)",
                animation: `mm-twinkle ${sp.dur} ${sp.delay} ease-in-out infinite alternate`,
                opacity: 0,
              }}
            />
          ))}

          {/* Animated text */}
          <p style={{
            color: isDark ? "#f4f1f0" : "#544683",
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            animation: "mm-fade 1.5s ease-in-out infinite alternate",
          }}>
            Manifesting your vision...
          </p>
          <p style={{
            color: isDark ? "#c4b5d4" : "#a485b4",
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            marginTop: 8,
            animation: "mm-fade 1.5s 0.75s ease-in-out infinite alternate",
          }}>
          </p>

          <style>{`
            @keyframes mm-twinkle {
              0%   { opacity: 1; transform: scale(1); }
              100% { opacity: 1; transform: scale(1); }
            }
            }
            @keyframes mm-fade {
              0%   { opacity: 0.4; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      ) : (
        <>
          <div className="px-2 sm:px-4 pt-2 sm:pt-4 mb-2 sm:mb-3 flex flex-col gap-2">
            <input
              placeholder="Board name" type="text" value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="p-2 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[var(--violet)] text-sm sm:text-base"
              style={inputStyle}
            />
            {(mood || boardMood) && (
              <p className="text-center text-sm sm:text-md italic" style={{ color: isDark ? "var(--snow)" : "var(--primary)" }}>
                Today you were feeling <span className="font-semibold italic">{mood || boardMood}</span>
              </p>
            )}
            {saved && (
              <p className="text-center text-sm" style={{ color: isDark ? "var(--lavender)" : "var(--primary)" }}>
                Board saved! ✨
              </p>
            )}
          </div>

          <div ref={boardContainerRef} className="w-full flex justify-center px-2 sm:px-4">
            <div
              ref={boardWrapperRef}
              className="rounded-xl shadow"
              style={{
                width: `${(boardOriginalWidth || BOARD_MIN_WIDTH) * boardScale}px`,
                height: `${(boardOriginalHeight || BOARD_MIN_HEIGHT) * boardScale}px`,
                overflow: "hidden",
                borderRadius: "0.75rem",
                opacity: boardReady ? 1 : 0,
              }}
            >
              <div
                ref={boardRef}
                className="relative"
                style={{
                  backgroundColor: isDark ? "#2a223a" : "var(--snow)",
                  width: `${boardOriginalWidth || BOARD_MIN_WIDTH}px`,
                  height: `${boardOriginalHeight || BOARD_MIN_HEIGHT}px`,
                  transformOrigin: "top left",
                  transform: `scale(${boardScale})`,
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                }}
              >
                {items.length === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-center px-4" style={{ color: "var(--orchid)" }}>
                    Add images or text to get started!
                  </p>
                )}
                {items.map((item) => (
                  <MoodItem
                    key={item.id} item={item}
                    onChange={updateItem} onRemove={removeItem}
                    onBringToFront={bringToFront} onSendToBack={sendToBack}
                    scale={initialScale ?? boardScale}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-3 px-4 mt-3">
            <div className="flex gap-2 flex-wrap">
              <input placeholder="Enter Text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
                className="p-2 border rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--violet)]" style={inputStyle} />
              <button onClick={() => addItem("text", textInput)} className={btnBase} style={{ backgroundColor: "var(--primary)" }}>Add Text</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input placeholder="Enter Image URL" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                className="p-2 border rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--violet)]" style={inputStyle} />
              <button onClick={() => addItem("image", imageUrl)} className={btnBase} style={{ backgroundColor: "var(--primary)" }}>Add Image</button>
            </div>
            <div className="flex gap-2 flex-wrap items-center justify-center">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className={btnBase} style={{ backgroundColor: "var(--lilac)" }}>
                {uploading ? "Uploading..." : "Upload Image from Device"}
              </button>
              <span className="text-sm" style={{ color: hintColor }}>Uploaded images work best for downloading</span>
            </div>
          </div>

          <div
            className={`fixed sm:relative bottom-0 left-0 right-0 sm:mt-3 sm:z-auto px-3 py-3 sm:px-4 sm:py-0 flex items-center gap-2 sm:justify-center sm:flex-wrap transition-all duration-300 ${sidebarOpen ? "z-30" : "z-50"}`}
            style={{
              backgroundColor: window.innerWidth < 640 ? isDark ? "rgba(26, 20, 40, 0.97)" : "rgba(255, 255, 255, 0.97)" : "transparent",
              borderTop: window.innerWidth < 640 ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(84,70,131,0.15)"}` : "none",
              backdropFilter: window.innerWidth < 640 ? "blur(8px)" : "none",
              WebkitBackdropFilter: window.innerWidth < 640 ? "blur(8px)" : "none",
            }}
          >
            <button onClick={() => setControlsOpen((prev) => !prev)}
              className="sm:hidden flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-opacity hover:opacity-80"
              style={{ color: isDark ? "var(--snow)" : "var(--primary)", minWidth: "60px" }}>
              <span style={{ fontSize: "1.3rem" }}>＋</span>
              <span style={{ fontSize: "10px", fontWeight: 600 }}>Add</span>
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50 flex-1 sm:flex-none sm:px-4 sm:py-2"
              style={{ backgroundColor: window.innerWidth < 640 ? "transparent" : "var(--plum)", color: window.innerWidth < 640 ? isDark ? "var(--snow)" : "var(--primary)" : "white", minWidth: "60px" }}>
              <span className="sm:hidden" style={{ fontSize: "1.3rem" }}>💾</span>
              <span style={{ fontSize: "10px", fontWeight: 600 }} className="sm:hidden">{saving ? "Saving..." : "Save"}</span>
              <span className="hidden sm:inline text-sm">{saving ? "Saving..." : "Save Board"}</span>
            </button>
            <button onClick={clearBoard}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-opacity hover:opacity-80 flex-1 sm:flex-none sm:px-4 sm:py-2"
              style={{ backgroundColor: window.innerWidth < 640 ? "transparent" : "var(--rose)", color: window.innerWidth < 640 ? isDark ? "var(--snow)" : "var(--primary)" : "white", minWidth: "60px" }}>
              <span className="sm:hidden" style={{ fontSize: "1.3rem" }}>🗑️</span>
              <span style={{ fontSize: "10px", fontWeight: 600 }} className="sm:hidden">Clear</span>
              <span className="hidden sm:inline text-sm">Clear Board</span>
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50 flex-1 sm:flex-none sm:px-4 sm:py-2"
              style={{ backgroundColor: window.innerWidth < 640 ? "transparent" : "var(--lavender)", color: window.innerWidth < 640 ? isDark ? "var(--snow)" : "var(--primary)" : "white", minWidth: "60px" }}>
              <span className="sm:hidden" style={{ fontSize: "1.3rem" }}>⬇️</span>
              <span style={{ fontSize: "10px", fontWeight: 600 }} className="sm:hidden">{downloading ? "..." : "Download"}</span>
              <span className="hidden sm:inline text-sm">{downloading ? "Downloading..." : "Download Board"}</span>
            </button>
          </div>

          {controlsOpen && (
            <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 p-4 rounded-t-2xl shadow-2xl flex flex-col gap-3"
              style={{ backgroundColor: isDark ? "#1a1428" : "#f9f6ff", borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(84,70,131,0.15)"}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm" style={{ color: isDark ? "var(--snow)" : "var(--primary)" }}>Add Content</span>
                <button onClick={() => setControlsOpen(false)} className="text-lg font-bold hover:opacity-60"
                  style={{ color: isDark ? "var(--snow)" : "var(--primary)" }}>×</button>
              </div>
              <div className="flex gap-2">
                <input placeholder="Enter text..." value={textInput} onChange={(e) => setTextInput(e.target.value)}
                  className="p-2 border rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)]" style={inputStyle} />
                <button onClick={() => { addItem("text", textInput); setControlsOpen(false); }} className={btnBase} style={{ backgroundColor: "var(--primary)" }}>Add</button>
              </div>
              <div className="flex gap-2">
                <input placeholder="Image URL..." type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="p-2 border rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)]" style={inputStyle} />
                <button onClick={() => { addItem("image", imageUrl); setControlsOpen(false); }} className={btnBase} style={{ backgroundColor: "var(--primary)" }}>Add</button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { handleFileUpload(e); setControlsOpen(false); }} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="w-full py-3 rounded-xl text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--lilac)" }}>
                {uploading ? "Uploading..." : "📷 Upload from Device"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}