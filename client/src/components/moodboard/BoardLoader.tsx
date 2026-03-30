// src/components/moodboard/BoardLoader.tsx
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const SPARKLE_COUNT = 12;

type Sparkle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  shape: "star" | "dot" | "ring";
};

function generateSparkles(): Sparkle[] {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 4 + Math.random() * 10,
    delay: Math.random() * 1.8,
    duration: 1.2 + Math.random() * 1.0,
    shape: (["star", "dot", "ring"] as const)[Math.floor(Math.random() * 3)],
  }));
}

function StarShape({ size, color }: { size: number; color: string }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 L13.5 9.5 L21 12 L13.5 14.5 L12 22 L10.5 14.5 L3 12 L10.5 9.5 Z"
        fill={color}
      />
    </svg>
  );
}

export default function BoardLoader() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sparkles] = useState<Sparkle[]>(generateSparkles);
  const [tick, setTick] = useState(0);

  // Subtle pulse on the message text
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  const bg = isDark ? "#1a1428" : "#f9f6ff";
  const primary = "var(--primary, #544683)";
  const orchid = "var(--orchid, #a485b4)";
  const lavender = "var(--lavender, #c4b5d4)";
  const violet = "var(--violet, #7c5cbf)";
  const snow = "var(--snow, #f4f1f0)";
  const textColor = isDark ? snow : primary;
  const mutedColor = isDark ? lavender : orchid;

  const sparkleColors = [primary, orchid, lavender, violet, "#e8c5f0", "#d4a8e8"];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        zIndex: 10,
      }}
    >
      {/* Sparkle field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            style={{
              position: "absolute",
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              animation: `sparkle-float ${sp.duration}s ${sp.delay}s ease-in-out infinite alternate`,
              opacity: 0,
            }}
          >
            {sp.shape === "star" && (
              <StarShape
                size={sp.size}
                color={sparkleColors[sp.id % sparkleColors.length]}
              />
            )}
            {sp.shape === "dot" && (
              <div
                style={{
                  width: sp.size * 0.5,
                  height: sp.size * 0.5,
                  borderRadius: "50%",
                  backgroundColor: sparkleColors[sp.id % sparkleColors.length],
                }}
              />
            )}
            {sp.shape === "ring" && (
              <div
                style={{
                  width: sp.size,
                  height: sp.size,
                  borderRadius: "50%",
                  border: `2px solid ${sparkleColors[sp.id % sparkleColors.length]}`,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Crystal ball pulsing orb */}
      <div
        style={{
          position: "relative",
          width: 80,
          height: 80,
          marginBottom: 24,
        }}
      >
        {/* Outer glow rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: -(i + 1) * 10,
              borderRadius: "50%",
              border: `1px solid ${isDark ? "rgba(196,181,212,0.15)" : "rgba(84,70,131,0.1)"}`,
              animation: `ring-pulse 2s ${i * 0.4}s ease-out infinite`,
              opacity: 0,
            }}
          />
        ))}

        {/* Main orb */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: isDark
              ? "radial-gradient(circle at 35% 35%, #7c5cbf, #3d2a6b, #1a1428)"
              : "radial-gradient(circle at 35% 35%, #c4b5d4, #8b6db0, #544683)",
            boxShadow: isDark
              ? "0 0 30px rgba(124,92,191,0.6), inset 0 0 20px rgba(255,255,255,0.1)"
              : "0 0 30px rgba(84,70,131,0.4), inset 0 0 20px rgba(255,255,255,0.2)",
            animation: "orb-pulse 2s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner shimmer */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.4)",
              filter: "blur(4px)",
              transform: "translate(-8px, -8px)",
            }}
          />
        </div>

        {/* Sparkle burst from orb */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 6,
              height: 6,
              marginTop: -3,
              marginLeft: -3,
              animation: `orb-sparkle 1.6s ${i * 0.4}s ease-out infinite`,
              opacity: 0,
            }}
          >
            <StarShape size={6} color={isDark ? lavender : orchid} />
          </div>
        ))}
      </div>

      {/* Loading text */}
      <p
        style={{
          color: textColor,
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        Manifesting your board
        {".".repeat((tick % 3) + 1)}
      </p>
      <p
        style={{
          color: mutedColor,
          fontSize: "12px",
          letterSpacing: "0.03em",
        }}
      >
        ✨ Setting intentions ✨
      </p>

      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes sparkle-float {
          0%   { opacity: 0; transform: translateY(0px) scale(0.8); }
          50%  { opacity: 1; transform: translateY(-8px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-16px) scale(0.6); }
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50%       { transform: scale(1.06); filter: brightness(1.15); }
        }
        @keyframes ring-pulse {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes orb-sparkle {
          0%   { opacity: 0; transform: translate(0, 0) scale(0); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translate(
            ${Math.cos(0) * 40}px, ${Math.sin(0) * 40}px
          ) scale(0.5); }
        }
      `}</style>
    </div>
  );
}