// src/components/dashboard/JournalPrompt.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

const prompts = [
  "What are three things you're grateful for today?",
  "Describe a moment this week that made you smile.",
  "Write about a challenge and what you learned from it.",
  "How can you show yourself more kindness today?",
  "What emotion has been most present for you lately?",
  "What is something you are looking forward to?",
  "What would make today feel meaningful?",
];

const JournalPrompt = () => {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [prompt] = useState(
    prompts[Math.floor(Math.random() * prompts.length)]
  );
  const { theme } = useTheme();

  const inputStyle = {
    backgroundColor: theme === "dark" ? "#2a223a" : "var(--snow)",
    color: theme === "dark" ? "var(--snow)" : "var(--primary)",
    borderColor: theme === "dark" ? "var(--violet)" : "var(--plum)",
  };

  const textColor = theme === "dark" ? "var(--snow)" : "var(--primary)";
  const mutedColor = theme === "dark" ? "var(--snow)" : "var(--primary)";

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
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 text-white bg-[var(--lilac)] rounded-xl hover:shadow-lg"
        >
          Save Entry
        </button>
      </div> 
      {saved && (
        <p className="mt-2" style={{ color: "var(--primary)" }}>
          Entry saved!
        </p>
      )}
      {error && (
        <p className="mt-2" style={{ color: "var(--rose)" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default JournalPrompt;