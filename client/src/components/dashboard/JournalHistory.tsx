// src/components/dashboard/JournalHistory.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

type JournalEntry = {
  id?: string;
  title: string;
  content: string;
  created_at: string;
};

export default function JournalHistory({ refreshKey }: { refreshKey?: number }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [preview, setPreview] = useState<JournalEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const { theme } = useTheme();

  const cardStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
  };

  const modalStyle = {
    backgroundColor: theme === "dark" ? "#1a1428" : "#ffffff",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
  };

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
    borderColor: theme === "dark" ? "var(--violet)" : "var(--plum)",
  };

  const mutedColor = theme === "dark" ? "var(--lavender)" : "var(--orchid)";
  const textColor = theme === "dark" ? "var(--snow)" : "var(--primary)";

  useEffect(() => {
    fetchJournals();
  }, [refreshKey]);

  const fetchJournals = async () => {
    const { data, error } = await supabase
      .from('journals')
      .select('id, title, content, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  const handlePreview = (entry: JournalEntry) => {
    setPreview(entry);
    setEditing(false);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setSaveFeedback("");
  };

  const handleEdit = () => {
    setEditing(true);
    setSaveFeedback("");
  };

  const handleSave = async () => {
    if (!preview?.id) return;
    setSaving(true);
    setSaveFeedback("");

    const { error } = await supabase
      .from('journals')
      .update({ title: editTitle, content: editContent })
      .eq('id', preview.id);

    if (error) {
      setSaveFeedback("Failed to save. Please try again.");
    } else {
      setSaveFeedback("Entry saved!");
      setEditing(false);
      setPreview({ ...preview, title: editTitle, content: editContent });
      fetchJournals();
      setTimeout(() => setSaveFeedback(""), 2000);
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journal entry?")) return;

    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', id);

    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (preview?.id === id) setPreview(null);
    }
  };

  const btnBase = "px-4 py-2 text-white rounded-xl text-sm hover:opacity-80 transition-opacity";

  return (
    <div>
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: textColor }}
      >
        Your Journal Entries
      </h2>

      {entries.length === 0 ? (
        <p className="text-center" style={{ color: mutedColor }}>
          No journal entries yet. Write your first one above!
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-start gap-3"
              style={cardStyle}
            >
              {/* Entry info */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-lg font-bold truncate"
                  style={{ color: textColor }}
                >
                  {entry.title}
                </h3>
                <p className="text-sm mt-1" style={{ color: mutedColor }}>
                  {new Date(entry.created_at).toLocaleString()}
                </p>
                <p
                  className="mt-2 line-clamp-2 text-sm"
                  style={{ color: textColor }}
                >
                  {entry.content}
                </p>
              </div>

              {/* Action buttons — row on mobile, column on sm+ */}
              <div className="flex sm:flex-col flex-row gap-2 shrink-0">
                <button
                  onClick={() => handlePreview(entry)}
                  className={`${btnBase} flex-1 sm:flex-none text-center`}
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Preview
                </button>
                <button
                  onClick={() => entry.id && handleDelete(entry.id)}
                  className={`${btnBase} flex-1 sm:flex-none text-center`}
                  style={{ backgroundColor: "var(--rose)" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-xl p-4 sm:p-6"
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4 gap-2">
              {editing ? (
                <textarea
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  rows={2}
                  className="text-lg font-bold w-full px-3 py-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)] resize-none leading-snug"
                  style={inputStyle}
                />
              ) : (
                <h3
                  className="text-lg font-bold break-words flex-1"
                  style={{ color: textColor }}
                >
                  {preview.title}
                </h3>
              )}
              <button
                onClick={() => setPreview(null)}
                className="text-xl font-bold hover:opacity-60 transition-opacity shrink-0"
                style={{ color: textColor }}
              >
                ×
              </button>
            </div>

            {/* Date */}
            <p className="text-sm mb-4" style={{ color: mutedColor }}>
              {new Date(preview.created_at).toLocaleString()}
            </p>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {editing ? (
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)] resize-none"
                  style={inputStyle}
                />
              ) : (
                <p
                  className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base"
                  style={{ color: textColor }}
                >
                  {preview.content}
                </p>
              )}
            </div>

            {/* Feedback */}
            {saveFeedback && (
              <p
                className="mt-3 text-sm text-center"
                style={{
                  color: saveFeedback === "Entry saved!"
                    ? "var(--primary)"
                    : "var(--rose)",
                }}
              >
                {saveFeedback}
              </p>
            )}

            {/* Modal footer buttons — centered and full width on mobile */}
            <div className="flex gap-2 mt-4 justify-center">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className={`${btnBase} flex-1`}
                    style={{ backgroundColor: "var(--orchid)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`${btnBase} flex-1`}
                    style={{ backgroundColor: "var(--plum)" }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className={`${btnBase} flex-1`}
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => preview.id && handleDelete(preview.id)}
                    className={`${btnBase} flex-1`}
                    style={{ backgroundColor: "var(--rose)" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}