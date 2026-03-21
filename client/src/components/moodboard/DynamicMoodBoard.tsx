// src/components/moodboard/DynamicMoodBoard.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { supabase } from "../../lib/supabaseClient";
import MoodItem from "../../components/moodboard/MoodItem";
import html2canvas from "html2canvas";
import { useTheme } from "../../context/ThemeContext";

export type MoodItemType = {
  id: string;
  type: "image" | "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:5000";

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

const btnBase = "px-4 py-2 text-white rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50";

export default function DynamicMoodBoard() {
  const [items, setItems] = useState<MoodItemType[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [textInput, setTextInput] = useState("");
  const [boardName, setBoardName] = useState("My Mood Board");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false); // #8
  const [boardError, setBoardError] = useState(""); // #2
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("board");
  const { theme } = useTheme();
  const hintColor = theme === "dark" ? "var(--snow)" : "var(--primary)";
  const inputStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
  };

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
        .select("name")
        .eq("id", boardId)
        .single();

      if (boardError || !board) {
        setBoardError("Failed to load board. Please try again.");
        setBoardLoading(false);
        return;
      }

      setBoardName(board.name);

      const { data: boardItems, error: itemsError } = await supabase
        .from("moodboard_items")
        .select("*")
        .eq("board_id", boardId);

      if (itemsError) {
        setBoardError("Failed to load board items. Please try again.");
        setBoardLoading(false);
        return;
      }

      const loadedItems: MoodItemType[] = (boardItems || []).map((item) => ({
        id: uuid(),
        type: item.type,
        content: item.content,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
      }));

      setItems((prev) => prev.length > 0 ? prev : loadedItems);
      setBoardLoading(false);
    };

    loadBoard();
  }, [boardId]);

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
      };
      setItems((prev) => [...prev, newItem]);
      setTextInput("");
    }
  }, []);

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

  const clearBoard = () => {
    if (confirm("Clear the entire board?")) {
      setItems([]);
    }
  };

  const handleExport = async () => {
    if (!boardRef.current) return;
    if (items.length === 0) {
      alert("Add some items to your board before exporting!");
      return;
    }

    setExporting(true);

    try {
      const itemsWithBase64 = await Promise.all(
        items.map(async (item) => {
          if (item.type === "image") {
            const base64 = await toBase64ViaProxy(item.content);
            return { ...item, content: base64 };
          }
          return item;
        })
      );

      const boardEl = boardRef.current;
      const boardWidth = boardEl.offsetWidth;
      const boardHeight = boardEl.offsetHeight;

      const offscreen = document.createElement("div");
      offscreen.style.position = "fixed";
      offscreen.style.top = "-99999px";
      offscreen.style.left = "-99999px";
      offscreen.style.width = `${boardWidth}px`;
      offscreen.style.height = `${boardHeight}px`;
      offscreen.style.backgroundColor = theme === "dark" ? "#2a223a" : "#ffffff";
      offscreen.style.overflow = "hidden";

      itemsWithBase64.forEach((item) => {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.left = `${item.x}px`;
        el.style.top = `${item.y}px`;
        el.style.width = `${item.width}px`;
        el.style.height = `${item.height}px`;
        el.style.overflow = "hidden";

        if (item.type === "image") {
          const img = document.createElement("img");
          img.src = item.content;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";
          img.style.objectPosition = "center";
          el.appendChild(img);
        } else {
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.fontWeight = "bold";
          el.style.fontSize = "1rem";
          el.textContent = item.content;
        }

        offscreen.appendChild(el);
      });

      document.body.appendChild(offscreen);

      const canvas = await html2canvas(offscreen, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: theme === "dark" ? "#2a223a" : "#ffffff",
        width: boardWidth,
        height: boardHeight,
        scale: 1,
      });

      document.body.removeChild(offscreen);

      const link = document.createElement("a");
      link.download = `${boardName}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }

    setExporting(false);
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

    const { data: board, error: boardError } = await supabase
      .from("moodboards")
      .insert([{ user_id: user.id, name: boardName }])
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
    <div className="p-4 min-h-screen">

      {/* error banner */}
      {boardError && (
        <div
          className="mb-4 p-3 rounded-xl text-center text-white"
          style={{ backgroundColor: "var(--rose)" }}
        >
          {boardError}
        </div>
      )}

      {/* loading state */}
      {boardLoading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <p style={{ color: "var(--primary)" }}>Loading board...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3">
            <input
              placeholder="Board name"
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="p-2 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
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
                Uploaded images work best for JPEG export
              </span>
            </div>
            {saved && (
              <p className="text-center" style={{ color: "var(--primary)" }}>
                Board saved successfully!
              </p>
            )}
          </div>

          <div
            ref={boardRef}
            className="relative w-full h-[80vh] rounded-xl shadow overflow-hidden"
            style={{
              backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
            }}
          >
            {items.length === 0 && (
              <p
                className="absolute inset-0 flex items-center justify-center"
                style={{ color: "var(--orchid)" }}
              >
                Add images or text to get started!
              </p>
            )}
            {items.map((item) => (
              <MoodItem
                key={item.id}
                item={item}
                onChange={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="flex gap-2 flex-wrap mt-4 justify-center">
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
              onClick={handleExport}
              disabled={exporting}
              className={btnBase}
              style={{ backgroundColor: "var(--rose)" }}
            >
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}