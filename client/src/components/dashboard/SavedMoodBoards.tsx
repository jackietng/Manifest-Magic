// src/components/dashboard/SavedMoodBoards.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { useTheme } from "../../context/ThemeContext";

type MoodBoard = {
  id: string;
  name: string;
  created_at: string;
};

type MoodBoardItem = {
  type: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PreviewBoard = {
  board: MoodBoard;
  items: MoodBoardItem[];
};

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:5000";

const toBase64 = (url: string): Promise<string> => {
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

export default function SavedMoodBoards() {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PreviewBoard | null>(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";
  const mutedColor = isDark ? "var(--lavender)" : "var(--orchid)";
  const cardStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: textColor,
    borderColor: isDark ? "var(--violet)" : "var(--plum)",
  };
  const modalStyle = {
    backgroundColor: isDark ? "#1a1428" : "#ffffff",
    color: textColor,
  };
  const btnBase = "px-3 py-1 text-white rounded-lg text-sm hover:opacity-80 transition-opacity";

  useEffect(() => {
    const fetchBoards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("moodboards")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setBoards(data);
      setLoading(false);
    };

    fetchBoards();
  }, []);

  const handlePreview = async (board: MoodBoard) => {
    const { data, error } = await supabase
      .from("moodboard_items")
      .select("type, content, x, y, width, height")
      .eq("board_id", board.id);

    if (!error && data) {
      const itemsWithBase64 = await Promise.all(
        data.map(async (item) => {
          if (item.type === "image") {
            const base64 = await toBase64(item.content);
            return { ...item, content: base64 };
          }
          return item;
        })
      );
      setPreview({ board, items: itemsWithBase64 });
    }
  };

  const getBoardDimensions = (items: MoodBoardItem[]) => {
    if (items.length === 0) return { width: 600, height: 400 };
    const maxX = Math.max(...items.map((item) => item.x + item.width));
    const maxY = Math.max(...items.map((item) => item.y + item.height));
    return {
      width: Math.max(maxX + 40, 600),
      height: Math.max(maxY + 40, 400),
    };
  };

  const handleExport = async () => {
    if (!preview) return;
    setExporting(true);

    try {
      const dimensions = getBoardDimensions(preview.items);

      const offscreen = document.createElement("div");
      offscreen.style.position = "fixed";
      offscreen.style.top = "-99999px";
      offscreen.style.left = "-99999px";
      offscreen.style.width = `${dimensions.width}px`;
      offscreen.style.height = `${dimensions.height}px`;
      offscreen.style.backgroundColor = isDark ? "#2a223a" : "#ffffff";
      offscreen.style.overflow = "hidden";

      preview.items.forEach((item) => {
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
        backgroundColor: isDark ? "#2a223a" : "#ffffff",
        width: dimensions.width,
        height: dimensions.height,
        scale: 1,
      });

      document.body.removeChild(offscreen);

      const link = document.createElement("a");
      link.download = `${preview.board.name}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }

    setExporting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this mood board?")) return;

    const { error } = await supabase
      .from("moodboards")
      .delete()
      .eq("id", id);

    if (!error) {
      setBoards((prev) => prev.filter((b) => b.id !== id));
      if (preview?.board.id === id) setPreview(null);
    }
  };

  if (loading) return (
    <p className="text-center" style={{ color: mutedColor }}>
      Loading saved boards...
    </p>
  );

  const boardDimensions = preview ? getBoardDimensions(preview.items) : null;

  return (
    <div className="p-6 rounded-2xl">
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: textColor }}
      >
        Saved Mood Boards
      </h2>

      {boards.length === 0 ? (
        <p className="text-center" style={{ color: mutedColor }}>
          No saved boards yet. Create one on the mood board page!
        </p>
      ) : (
        <ul className="space-y-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex items-center justify-between p-3 border rounded-xl"
              style={cardStyle}
            >
              <div>
                <p className="font-medium" style={{ color: textColor }}>
                  {board.name}
                </p>
                <p className="text-sm" style={{ color: mutedColor }}>
                  {new Date(board.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(board)}
                  className={btnBase}
                  style={{ backgroundColor: "var(--rose)" }}
                >
                  Preview
                </button>
                <button
                  onClick={() => navigate(`/moodboard?board=${board.id}`)}
                  className={btnBase}
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Open
                </button>
                <button
                  onClick={() => handleDelete(board.id)}
                  className={btnBase}
                  style={{ backgroundColor: "var(--orchid)" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {preview && boardDimensions && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setPreview(null)}
        >
          <div
            className="rounded-2xl shadow-xl p-4 w-[90vw] max-w-4xl max-h-[90vh] flex flex-col"
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3
                className="text-lg font-semibold"
                style={{ color: textColor }}
              >
                {preview.board.name}
              </h3>
              <button
                onClick={() => setPreview(null)}
                className="text-xl font-bold hover:opacity-60 transition-opacity"
                style={{ color: textColor }}
              >
                ×
              </button>
            </div>
            <div
              className="overflow-auto flex-1 rounded-xl"
              style={{ backgroundColor: isDark ? "#2a223a" : "#f3f4f6" }}
            >
              <div
                ref={previewRef}
                style={{
                  position: "relative",
                  width: boardDimensions.width,
                  height: boardDimensions.height,
                  backgroundColor: isDark ? "#2a223a" : "#ffffff",
                }}
              >
                {preview.items.length === 0 ? (
                  <p
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: mutedColor,
                    }}
                  >
                    This board has no items.
                  </p>
                ) : (
                  preview.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "absolute",
                        left: item.x,
                        top: item.y,
                        width: item.width,
                        height: item.height,
                        overflow: "hidden",
                      }}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.content}
                          alt="mood item"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: textColor,
                          }}
                        >
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 text-white rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--rose)" }}
              >
                {exporting ? "Exporting..." : "Export as JPEG"}
              </button>
              <button
                onClick={() => navigate(`/moodboard?board=${preview.board.id}`)}
                className="px-4 py-2 text-white rounded-xl hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Open in Editor
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 text-white rounded-xl hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "var(--orchid)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}