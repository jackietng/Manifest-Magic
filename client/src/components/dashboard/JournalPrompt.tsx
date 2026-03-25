// src/components/dashboard/JournalPrompt.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";
import promptData from "../../data/journalPrompts.json";

const getRandomPrompt = (exclude?: string): string => {
  const available = promptData.prompts.filter((p) => p !== exclude);
  return available[Math.floor(Math.random() * available.length)];
};

const JournalPrompt = ({ onEntrySaved }: { onEntrySaved: () => void }) => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState(() => getRandomPrompt());
  const { theme } = useTheme();

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
    borderColor: theme === "dark" ? "var(--violet)" : "var(--plum)",
  };

  const textColor = theme === "dark" ? "var(--snow)" : "var(--primary)";
  const mutedColor = theme === "dark" ? "var(--snow)" : "var(--primary)";

  const handleNewPrompt = () => {
    setPrompt((prev) => getRandomPrompt(prev));
    setText("");
    setTitle("");
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to save journal entries.");
      return;
    }

    const { error } = await supabase.from("journals").insert({
      profile_id: user.id,
      title: title || prompt,
      content: text,
    });

    if (error) {
      setError("Failed to save entry. Please try again.");
    } else {
      setText("");
      setTitle("");
      setSaved(true);
      onEntrySaved();
      setPrompt(getRandomPrompt(prompt));
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl p-6">
      <h2
        className="text-xl font-semibold mb-4 text-center"
        style={{ color: textColor }}
      >
        Journal Prompt
      </h2>
      <p
        className="italic text-center"
        style={{ color: mutedColor }}
      >
        "{prompt}"
      </p>

      {/* New prompt button */}
      <div className="flex justify-center -mt-4">
        <button
          onClick={handleNewPrompt}
          className="text-sm px-3 py-1 rounded-full hover:shadow-lg"
          style={{
            backgroundColor: "transparent",
            color: mutedColor,
          }}
        >
          ✨ Give me a different prompt
        </button>
      </div>

      <input
        type="text"
        className="mt-4 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
        placeholder="Entry title (optional — defaults to prompt)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />
      <textarea
        rows={5}
        className="mt-3 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
        placeholder="Write your thoughts here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={inputStyle}
      />
      <div className="flex justify-center mt-2">
        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 text-white rounded-xl hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "var(--lilac)" }}
        >
          Save Entry
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-center" style={{ color: theme === "dark" ? "var(--snow)" : "var(--primary)" }}>
          Entry saved!
        </p>
      )}
      {error && (
        <p className="mt-2 text-center" style={{ color: "var(--rose)" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default JournalPrompt;