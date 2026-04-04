// src/components/dashboard/SavedMoodBoards.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

type MoodBoard = {
  id: string;
  name: string;
  created_at: string;
  thumbnail_url: string | null;
};

export default function SavedMoodBoards({ refreshKey = 0 }: { refreshKey?: number }) {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";
  const mutedColor = isDark ? "var(--lavender)" : "var(--orchid)";
  const cardBg = isDark ? "#2a223a" : "var(--snow)";
  const cardBorder = isDark ? "var(--violet)" : "var(--plum)";

  useEffect(() => {
    const fetchBoards = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("moodboards")
        .select("id, name, created_at, thumbnail_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setBoards(data);
      setLoading(false);
    };

    fetchBoards();
  }, [refreshKey]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this mood board?")) return;
    const { error } = await supabase.from("moodboards").delete().eq("id", id);
    if (!error) setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading)
    return (
      <p className="text-center" style={{ color: mutedColor }}>
        Loading saved boards...
      </p>
    );

  return (
    <div className="p-6 rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: textColor }}>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/moodboard?board=${board.id}`)}
              className="rounded-xl border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              {/* Thumbnail */}
              <div
                className="w-full aspect-[3/4] overflow-hidden"
                style={{ backgroundColor: isDark ? "#1a1428" : "#f3f0ff" }}
              >
                {board.thumbnail_url ? (
                  <img
                    src={board.thumbnail_url}
                    alt={board.name}
                    className="mood-item-img object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl"
                    style={{ color: mutedColor }}
                  >
                    ✨
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: textColor }}>
                    {board.name || "Untitled"}
                  </p>
                  <p className="text-xs" style={{ color: mutedColor }}>
                    {new Date(board.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, board.id)}
                  className="shrink-0 px-2 py-1 text-white rounded-lg text-xs hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "var(--orchid)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}