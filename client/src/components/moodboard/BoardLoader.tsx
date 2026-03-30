// src/components/moodboard/BoardLoader.tsx
import { useTheme } from "../../context/ThemeContext";

export default function MagicLoader() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="magic-loader"
      style={{
        background: "transparent",
      }}
    >
      <div className="sparkle-container">
        {Array.from({ length: 40 }).map((_, i) => {
          const style = {
            "--x": Math.random(),
            "--y": Math.random(),
            "--delay": `${Math.random() * 3}s`,
            "--duration": `${2 + Math.random() * 2.5}s`,
            "--scale": 0.5 + Math.random() * 1.5,
            "--drift": `${(Math.random() - 0.5) * 40}px`,
            "--twinkle": `${0.5 + Math.random() * 1.5}s`,
          } as React.CSSProperties;

          return <span key={i} className="sparkle" style={style} />;
        })}
      </div>

      <p
        className="loading-text"
        style={{ color: isDark ? "#f4f1f0" : "#544683" }}
      >
        Manifesting your vision...
      </p>
    </div>
  );
}