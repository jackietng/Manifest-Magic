//src/components/moodboard/MoodItem.tsx
import { Rnd } from "react-rnd";
import { useState, useRef } from "react";

export type MoodItemType = {
  id: string;
  type: "image" | "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

export default function MoodItem({
  item,
  onChange,
  onRemove,
  onBringToFront,
  onSendToBack,
}: {
  item: MoodItemType;
  onChange: (id: string, changes: Partial<MoodItemType>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const [size, setSize] = useState({ width: item.width, height: item.height });
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const aspectRatio = item.width / item.height;
  const fontSize = Math.max(12, Math.min(size.width, size.height) * 0.14);

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const handleStyle = {
    width: "12px",
    height: "12px",
    backgroundColor: hovered ? "rgba(156, 163, 175, 0.9)" : "transparent",
    borderRadius: "3px",
    zIndex: 10,
    transition: "background-color 0.15s ease",
  };

  return (
    <>
      {/* Delete button */}
      <button
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onRemove(item.id)}
        style={{
          position: "absolute",
          left: pos.x + size.width - 9,
          top: pos.y - 9,
          zIndex: item.zIndex + 100,
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "18px",
          height: "18px",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: hovered ? "all" : "none",
        }}
      >
        ×
      </button>

      {/* Bring to front / send to back buttons */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y - 22,
          zIndex: item.zIndex + 100,
          display: "flex",
          gap: "3px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s ease",
          pointerEvents: hovered ? "all" : "none",
        }}
      >
        <button
          onClick={() => onBringToFront(item.id)}
          title="Bring to front"
          style={{
            background: "rgba(84, 70, 131, 0.85)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            cursor: "pointer",
            lineHeight: 1.4,
          }}
        >
          ↑ Front
        </button>
        <button
          onClick={() => onSendToBack(item.id)}
          title="Send to back"
          style={{
            background: "rgba(164, 133, 180, 0.85)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            cursor: "pointer",
            lineHeight: 1.4,
          }}
        >
          ↓ Back
        </button>
      </div>

      <Rnd
        default={{
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        }}
        bounds="parent"
        lockAspectRatio={false}
        enableResizing={{
          topLeft: true,
          topRight: false,
          bottomLeft: true,
          bottomRight: true,
          top: false,
          bottom: false,
          left: false,
          right: false,
        }}
        resizeHandleStyles={{
          topLeft: { ...handleStyle, top: "0px", left: "0px" },
          bottomLeft: { ...handleStyle, bottom: "0px", left: "0px" },
          bottomRight: { ...handleStyle, bottom: "0px", right: "0px" },
        }}
        style={{
          position: "absolute",
          overflow: item.type === "text" ? "visible" : "hidden",
          zIndex: item.zIndex,
          outline: hovered ? "1px dashed rgba(156, 163, 175, 0.6)" : "none",
          transition: "outline 0.15s ease",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDrag={(_, d) => {
          setPos({ x: d.x, y: d.y });
        }}
        onDragStop={(_, d) => {
          setPos({ x: d.x, y: d.y });
          onChange(item.id, { x: d.x, y: d.y });
        }}
        onResize={(_, __, ref, _delta, position) => {
          setPos({ x: position.x, y: position.y });
          setSize({
            width: parseFloat(ref.style.width),
            height: parseFloat(ref.style.height),
          });
        }}
        onResizeStop={(_, __, ref, _delta, position) => {
          let newWidth = parseFloat(ref.style.width);
          let newHeight = parseFloat(ref.style.height);

          if (item.type === "image") {
            const widthChanged = Math.abs(newWidth - size.width);
            const heightChanged = Math.abs(newHeight - size.height);
            if (widthChanged >= heightChanged) {
              newHeight = Math.round(newWidth / aspectRatio);
            } else {
              newWidth = Math.round(newHeight * aspectRatio);
            }
          }

          setPos({ x: position.x, y: position.y });
          setSize({ width: newWidth, height: newHeight });
          onChange(item.id, {
            width: newWidth,
            height: newHeight,
            x: position.x,
            y: position.y,
          });
        }}
      >
        {item.type === "image" ? (
          <img
            src={item.content}
            alt="Mood"
            className="mood-item-img"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
              margin: 0,
              padding: 0,
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
              fontSize: `${fontSize}px`,
              padding: "8px",
              boxSizing: "border-box",
              wordBreak: "break-word",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {item.content}
          </div>
        )}
      </Rnd>
    </>
  );
}