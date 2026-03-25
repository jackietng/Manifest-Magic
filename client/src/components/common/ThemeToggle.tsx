//src/components/common/ThemeToggle.tsx
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg hover:scale-110 transition-all"
      style={{
        backgroundColor: theme === "dark" ? "var(--lilac)" : "var(--primary)",
      }}
      whileTap={{ scale: 0.9, rotate: 20 }}
      aria-label="Toggle Theme"
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" style={{ color: "var(--snow)" }} />
        ) : (
          <Sun className="h-5 w-5" style={{ color: "var(--lavender)" }} />
        )}
      </motion.div>
    </motion.button>
  );
}