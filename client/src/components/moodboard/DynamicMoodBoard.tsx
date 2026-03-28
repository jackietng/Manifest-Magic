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
      try {
        resolve(canvas.toDataURL("image/jpeg"));
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = proxyUrl;
  });
};

const btnBase = "px-3 py-2 text-white rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50 text-sm";

export default function DynamicMoodBoard({
  setSidebarOpen,
}: {
  setSidebarOpen?: (open: boolean) => void;
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
  const [boardError, setBoardError] = useState("");
  const [boardScale, setBoardScale] = useState(1);
  const [boardOriginalWidth, setBoardOriginalWidth] = useState<number | null>(null);
  const [boardOriginalHeight, setBoardOriginalHeight] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const calculateAndSetScale = useCallback((
    originalWidth: number | null,
    originalHeight: number | null
  ) => {
    if (!boardContainerRef.current) return;
    const containerWidth = boardContainerRef.current.offsetWidth;
    const viewportHeight = window.innerHeight < 640
      ? window.innerHeight * 0.92
      : window.innerHeight * 0.8;
    const referenceWidth = originalWidth || BOARD_MIN_WIDTH;
    const referenceHeight = originalHeight || viewportHeight;

    const widthScale = containerWidth < referenceWidth
      ? containerWidth / referenceWidth
      : 1;
    const heightScale = viewportHeight < referenceHeight
      ? viewportHeight / referenceHeight
      : 1;

    const scale = Math.min(widthScale, heightScale);
    setBoardScale(scale);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      calculateAndSetScale(boardOriginalWidth, boardOriginalHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [boardOriginalWidth, boardOriginalHeight, calculateAndSetScale]);

  useEffect(() => {
    if (boardId) return;
    const rafId = requestAnimationFrame(() => {
      calculateAndSetScale(null, null);
    });
    return () => cancelAnimationFrame(rafId);
  }, [boardId, calculateAndSetScale]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (items.length > 0 && !saved) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [items, saved]);

  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      setBoardLoading(true);
      setBoardError("");

      const { data: board, error: boardError } = await supabase
        .from("moodboards")
        .select("name, mood, board_width, board_height")
        .eq("id", boardId)
        .single();

      if (boardError || !board) {
        setBoardError("Failed to load board. Please try again.");
        setBoardLoading(false);
        return;
      }

      setBoardName(board.name);
      setBoardMood(board.mood || "");
      setBoardOriginalWidth(board.board_width || null);
      setBoardOriginalHeight(board.board_height || null);

      const { data: boardItems, error: itemsError } = await supabase
        .from("moodboard_items")
        .select("*")
        .eq("board_id", boardId);

      if (itemsError) {
        setBoardError("Failed to load board items. Please try again.");
        setBoardLoading(false);
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

      setItems((prev) => prev.length > 0 ? prev : loadedItems);
      setBoardLoading(false);

      setTimeout(() => {
        calculateAndSetScale(board.board_width || null, board.board_height || null);
      }, 0);
    };

    loadBoard();
  }, [boardId, calculateAndSetScale]);

  const addItem = useCallback((type: "image" | "text", content: string) => {
    if (!content.trim()) return;

    if (type === "image") {
      const isSupabaseImage = content.includes("supabase.co");
      const proxyUrl = isSupabaseImage
        ? content
        : `${PROXY_URL}/proxy-image?url=${encodeURIComponent(content)}`;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = proxyUrl;

      img.onload = async () => {
        try {
          await img.decode();
        } catch {
          // decode not supported, continue anyway
        }

        const maxDimension = 300;
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;
        const ratio = naturalWidth / naturalHeight;

        let width = naturalWidth;
        let height = naturalHeight;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            width = maxDimension;
            height = Math.round(maxDimension / ratio);
          } else {
            height = maxDimension;
            width = Math.round(maxDimension * ratio);
          }
        }

        const newItem: MoodItemType = {
          id: uuid(),
          type: "image",
          content: proxyUrl,
          x: 100,
          y: 100,
          width,
          height,
          zIndex: items.length + 1,
        };

        setItems((prev) => [...prev, newItem]);
        setImageUrl("");
      };

      img.onerror = () => {
        alert("Failed to load image. Please check the URL.");
      };
    } else {
      const newItem: MoodItemType = {
        id: uuid(),
        type: "text",
        content,
        x: 100,
        y: 100,
        width: 200,
        height: 60,
        zIndex: items.length + 1,
      };
      setItems((prev) => [...prev, newItem]);
      setTextInput("");
    }
  }, [items.length]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuid()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("moodboard-images")
      .upload(fileName, file);

    if (uploadError) {
      alert("Failed to upload image. Please try again.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("moodboard-images")
      .getPublicUrl(fileName);

    addItem("image", publicUrl);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateItem = (id: string, changes: Partial<MoodItemType>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...changes } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const bringToFront = (id: string) => {
    const maxZ = Math.max(...items.map((item) => item.zIndex));
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, zIndex: maxZ + 1 } : item
      )
    );
  };

  const sendToBack = (id: string) => {
    setItems((prev) => {
      const minZ = Math.min(...prev.map((item) => item.zIndex));
      const updated = prev.map((item) =>
        item.id === id ? { ...item, zIndex: minZ - 1 } : item
      );
      const newMin = Math.min(...updated.map((item) => item.zIndex));
      if (newMin < 1) {
        const offset = 1 - newMin;
        return updated.map((item) => ({ ...item, zIndex: item.zIndex + offset }));
      }
      return updated;
    });
  };

  const clearBoard = () => {
    if (confirm("Clear the entire board?")) {
      setItems([]);
    }
  };

  const handleDownload = async () => {
    if (!boardRef.current) return;
    if (items.length === 0) {
      alert("Add some items to your board before downloading!");
      return;
    }

    setDownloading(true);

    try {
      if (setSidebarOpen) {
        setSidebarOpen(false);
        await new Promise((res) => setTimeout(res, 350));
      }

      const referenceWidth = boardOriginalWidth || BOARD_MIN_WIDTH;
      const boardHeight = boardOriginalHeight || boardRef.current.offsetHeight;
      const boardWidth = boardScale < 1
        ? referenceWidth
        : boardRef.current.offsetWidth;

      const itemsWithBase64 = await Promise.all(
        items.map(async (item) => {
          if (item.type === "image") {
            const base64 = await toBase64ViaProxy(item.content);
            return { ...item, content: base64 };
          }
          return item;
        })
      );

      const sortedItems = [...itemsWithBase64].sort((a, b) => a.zIndex - b.zIndex);

      const canvas = document.createElement("canvas");
      canvas.width = boardWidth;
      canvas.height = boardHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      ctx.fillStyle = isDark ? "#2a223a" : "#ffffff";
      ctx.fillRect(0, 0, boardWidth, boardHeight);

      for (const item of sortedItems) {
        if (item.type === "image") {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, item.x, item.y, item.width, item.height);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = item.content;
          });
        } else {
          const fontSize = Math.max(12, Math.min(item.width, item.height) * 0.14);
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = isDark ? "#f4f1f0" : "#544683";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const words = item.content.split(" ");
          const lineHeight = fontSize * 1.3;
          const maxWidth = item.width - 16;
          const lines: string[] = [];
          let currentLine = "";

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          const totalHeight = lines.length * lineHeight;
          const startY = item.y + (item.height - totalHeight) / 2 + lineHeight / 2;

          lines.forEach((line, i) => {
            ctx.fillText(
              line,
              item.x + item.width / 2,
              startY + i * lineHeight
            );
          });
        }
      }

      const link = document.createElement("a");
      link.download = `${boardName}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();

    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }

    setDownloading(false);
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      alert("Add some items to your board before saving!");
      return;
    }

    setSaving(true);

    const boardEl = boardRef.current;
    const { data: board, error: boardError } = await supabase
      .from("moodboards")
      .insert([{
        user_id: user.id,
        name: boardName,
        mood: mood || "",
        board_width: boardOriginalWidth || boardEl?.offsetWidth || 0,
        board_height: boardOriginalHeight || boardEl?.offsetHeight || 0,
      }])
      .select()
      .single();

    if (boardError) {
      console.error(boardError);
      alert("Failed to save board. Please try again.");
      setSaving(false);
      return;
    }

    const formattedItems = items.map((item) => ({
      board_id: board.id,
      type: item.type,
      content: item.content,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      zIndex: item.zIndex,
    }));

    const { error: itemError } = await supabase
      .from("moodboard_items")
      .insert(formattedItems);

    if (itemError) {
      console.error(itemError);
      alert("Failed to save board items. Please try again.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  };

  return (
    <div className="p-2 sm:p-4 min-h-screen">

      {/* Error banner */}
      {boardError && (
        <div
          className="mb-4 p-3 rounded-xl text-center text-white"
          style={{ backgroundColor: "var(--rose)" }}
        >
          {boardError}
        </div>
      )}

      {boardLoading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <p style={{ color: "var(--primary)" }}>Loading board...</p>
        </div>
      ) : (
        <>
          {/* Board name — always visible */}
          <div className="mb-3 flex flex-col gap-2">
            <input
              placeholder="Board name"
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="p-2 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[var(--violet)] text-sm sm:text-base"
              style={inputStyle}
            />

            {(mood || boardMood) && (
              <p
                className="text-center text-sm sm:text-md italic"
                style={{ color: isDark ? "var(--snow)" : "var(--primary)" }}
              >
                Today you were feeling{" "}
                <span className="font-semibold italic">
                  {mood || boardMood}
                </span>
              </p>
            )}

            {saved && (
              <p
                className="text-center text-sm"
                style={{ color: isDark ? "var(--lavender)" : "var(--primary)" }}
              >
                Board saved! ✨
              </p>
            )}
          </div>

          {/* Board */}
          <div ref={boardContainerRef} className="w-full flex justify-center">
            <div
              ref={boardWrapperRef}
              className="rounded-xl shadow"
              style={{
                width: boardScale < 1
                  ? `${(boardOriginalWidth || BOARD_MIN_WIDTH) * boardScale}px`
                  : "100%",
                height: boardOriginalHeight
                  ? `${boardOriginalHeight * boardScale}px`
                  : `calc(${window.innerWidth < 640 ? "92vh" : "80vh"} * ${boardScale})`,
                overflow: "hidden",
                borderRadius: "0.75rem",
              }}
            >
              <div
                ref={boardRef}
                className="relative"
                style={{
                  backgroundColor: isDark ? "#2a223a" : "var(--snow)",
                  width: boardScale < 1
                    ? `${boardOriginalWidth || BOARD_MIN_WIDTH}px`
                    : "100%",
                  height: boardOriginalHeight
                    ? `${boardOriginalHeight}px`
                    : window.innerWidth < 640 ? "92vh" : "80vh",
                  transformOrigin: "top left",
                  transform: `scale(${boardScale})`,
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                }}
              >
                {items.length === 0 && (
                  <p
                    className="absolute inset-0 flex items-center justify-center text-center px-4"
                    style={{ color: "var(--orchid)" }}
                  >
                    Add images or text below to get started!
                  </p>
                )}
                {items.map((item) => (
                  <MoodItem
                    key={item.id}
                    item={item}
                    onChange={updateItem}
                    onRemove={removeItem}
                    onBringToFront={bringToFront}
                    onSendToBack={sendToBack}
                    scale={boardScale}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Add content controls — below board on all screen sizes ── */}
          <div className="mt-3">

            {/* Mobile — collapsible */}
            <div className="sm:hidden">
              <button
                onClick={() => setControlsOpen((prev) => !prev)}
                className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: isDark ? "#2a223a" : "var(--petal)",
                  color: isDark ? "var(--snow)" : "var(--primary)",
                }}
              >
                {controlsOpen ? "▲ Hide Controls" : "▼ Add Content"}
              </button>

              {controlsOpen && (
                <div
                  className="mt-2 p-3 rounded-xl flex flex-col gap-2"
                  style={{
                    backgroundColor: isDark ? "#1a1428" : "#f9f6ff",
                  }}
                >
                  <div className="flex gap-2">
                    <input
                      placeholder="Enter text..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="p-2 border rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => {
                        addItem("text", textInput);
                        setControlsOpen(false);
                      }}
                      className={btnBase}
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      placeholder="Image URL..."
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="p-2 border rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
                      style={inputStyle}
                    />
                    <button
                      onClick={() => {
                        addItem("image", imageUrl);
                        setControlsOpen(false);
                      }}
                      className={btnBase}
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Add
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileUpload(e);
                      setControlsOpen(false);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-2 rounded-xl text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "var(--lilac)" }}
                  >
                    {uploading ? "Uploading..." : "📷 Upload from Device"}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop — always visible */}
            <div className="hidden sm:flex flex-col gap-3">
              <div className="flex gap-2 flex-wrap">
                <input
                  placeholder="Enter Text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="p-2 border rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
                  style={inputStyle}
                />
                <button
                  onClick={() => addItem("text", textInput)}
                  className={btnBase}
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Add Text
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <input
                  placeholder="Enter Image URL"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="p-2 border rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
                  style={inputStyle}
                />
                <button
                  onClick={() => addItem("image", imageUrl)}
                  className={btnBase}
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Add Image
                </button>
              </div>

              <div className="flex gap-2 flex-wrap items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={btnBase}
                  style={{ backgroundColor: "var(--lilac)" }}
                >
                  {uploading ? "Uploading..." : "Upload Image from Device"}
                </button>
                <span className="text-sm" style={{ color: hintColor }}>
                  Uploaded images work best for downloading
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap mt-3 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className={btnBase}
              style={{ backgroundColor: "var(--plum)" }}
            >
              {saving ? "Saving..." : "Save Board"}
            </button>
            <button
              onClick={clearBoard}
              className={btnBase}
              style={{ backgroundColor: "var(--orchid)" }}
            >
              Clear Board
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={btnBase}
              style={{ backgroundColor: "var(--rose)" }}
            >
              {downloading ? "Downloading..." : "Download Board"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}