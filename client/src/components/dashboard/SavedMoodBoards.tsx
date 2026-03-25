// src/components/dashboard/SavedMoodBoards.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

type MoodBoard = {
  id: string;
  name: string;
  created_at: string;
  board_width: number;
  board_height: number;
};

type MoodBoardItem = {
  type: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
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
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
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
        .select("id, name, created_at, board_width, board_height")
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
      .select("type, content, x, y, width, height, zIndex")
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

  const getBoardDimensions = (board: MoodBoard, items: MoodBoardItem[]) => {
    if (board.board_width && board.board_height) {
      return { width: board.board_width, height: board.board_height };
    }
    if (items.length === 0) return { width: 600, height: 400 };
    const maxX = Math.max(...items.map((item) => item.x + item.width));
    const maxY = Math.max(...items.map((item) => item.y + item.height));
    return {
      width: Math.max(maxX + 40, 600),
      height: Math.max(maxY + 40, 400),
    };
  };

  const getPreviewScale = (boardWidth: number) => {
    const modalWidth = window.innerWidth * 0.9 - 32;
    return Math.min(1, modalWidth / boardWidth);
  };

  // Draw preview onto canvas whenever preview changes
  useEffect(() => {
    if (!preview || !previewRef.current) return;

    const dimensions = getBoardDimensions(preview.board, preview.items);
    const canvas = previewRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = isDark ? "#2a223a" : "#ffffff";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const sortedItems = [...preview.items].sort((a, b) => a.zIndex - b.zIndex);

    const drawItems = async () => {
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
    };

    drawItems();
  }, [preview, isDark]);

  const handleDownload = async () => {
    if (!preview) return;
    setDownloading(true);

    try {
      const dimensions = getBoardDimensions(preview.board, preview.items);
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Could not get canvas context");

      ctx.fillStyle = isDark ? "#2a223a" : "#ffffff";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const sortedItems = [...preview.items].sort((a, b) => a.zIndex - b.zIndex);

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
      link.download = `${preview.board.name}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }

    setDownloading(false);
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

  const boardDimensions = preview
    ? getBoardDimensions(preview.board, preview.items)
    : null;
  const previewScale = boardDimensions
    ? getPreviewScale(boardDimensions.width)
    : 1;

  return (
    <div className="p-6 rounded-2xl">
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: textColor }}
      >
        Saved Mood Boards
      </h2>
      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center" style={{ color: textColor }}>
            No saved boards yet. Create your first one!
          </p>
          <button
            onClick={() => navigate("/moodboard")}
            className="px-6 py-3 text-white rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "var(--primary)" }}
          >
           Create a Mood Board
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-xl"
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
              <div className="flex gap-2 justify-center flex-wrap">
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
                  Edit
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
            className="rounded-2xl shadow-xl p-4 w-[90vw] max-w-4xl flex flex-col"
            style={{
              ...modalStyle,
              maxHeight: "90vh",
              height: `calc(${previewScale * boardDimensions.height}px + 120px)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
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

            {/* Canvas preview area */}
            <div
              className="flex-1 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: isDark ? "#2a223a" : "#f3f4f6" }}
            >
              <canvas
                ref={previewRef}
                width={boardDimensions.width}
                height={boardDimensions.height}
                style={{
                  width: boardDimensions.width * previewScale,
                  height: boardDimensions.height * previewScale,
                  display: "block",
                }}
              />
            </div>

            {/* Modal footer */}
            <div className="flex gap-2 mt-3 justify-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-2 text-white rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50 text-sm"
                style={{ backgroundColor: "var(--rose)" }}
              >
                {downloading ? "Downloading..." : "Download"}
              </button>
              <button
                onClick={() => navigate(`/moodboard?board=${preview.board.id}`)}
                className="flex-1 py-2 text-white rounded-xl hover:opacity-80 transition-opacity text-sm"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(preview.board.id)}
                className="flex-1 py-2 text-white rounded-xl hover:opacity-80 transition-opacity text-sm"
                style={{ backgroundColor: "var(--orchid)" }}
              >
                Delete
              </button>
              <button
                onClick={() => setPreview(null)}
                className="flex-1 py-2 text-white rounded-xl hover:opacity-80 transition-opacity text-sm"
                style={{ backgroundColor: "var(--plum)" }}
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