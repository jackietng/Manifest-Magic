// src/components/moodboard/MoodInput.tsx
import { useMood } from "../../context/MoodContext";
import { useTheme } from "../../context/ThemeContext";

const MoodInput = () => {
  const { mood, setMood } = useMood();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const inputStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: isDark ? "var(--snow)" : "var(--primary)",
  };

  const textColor = isDark ? "var(--snow)" : "var(--primary)";

  return (
    <div className="rounded-2xl px-4 py-6 sm:p-6">
      <h2
        className="text-xl text-center font-semibold mb-4"
        style={{ color: textColor }}
      >
        How are you feeling today?
      </h2>
      <input
        type="text"
        placeholder="Type your mood..."
        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)] text-base"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
};

export default MoodInput;