//src/components/moodboard/MoodItem.tsx
import { Rnd } from "react-rnd";
import { useState, useRef, useEffect } from "react";

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
  scale = 1,
}: {
  item: MoodItemType;
  onChange: (id: string, changes: Partial<MoodItemType>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  scale?: number;
}) {
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const [size, setSize] = useState({ width: item.width, height: item.height });
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);

  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      setPos({ x: item.x, y: item.y });
      setSize({ width: item.width, height: item.height });
    }
  }, [item.x, item.y, item.width, item.height]);

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
        position={{ x: pos.x, y: pos.y }}
        size={{ width: size.width, height: size.height }}
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
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDrag={(_, d) => {
          // Divide by scale so drag distance matches visual position
          const scaledX = d.x / scale;
          const scaledY = d.y / scale;
          setPos({ x: scaledX, y: scaledY });
        }}
        onDragStop={(_, d) => {
          isDragging.current = false;
          const scaledX = d.x / scale;
          const scaledY = d.y / scale;
          setPos({ x: scaledX, y: scaledY });
          onChange(item.id, { x: scaledX, y: scaledY });
        }}
        onResizeStart={() => {
          isResizing.current = true;
        }}
        onResize={(_, __, ref, _delta, position) => {
          const newWidth = parseFloat(ref.style.width) / scale;
          const newHeight = parseFloat(ref.style.height) / scale;
          const scaledX = position.x / scale;
          const scaledY = position.y / scale;
          setPos({ x: scaledX, y: scaledY });
          setSize({ width: newWidth, height: newHeight });
          onChange(item.id, {
            width: newWidth,
            height: newHeight,
            x: scaledX,
            y: scaledY,
          });
        }}
        onResizeStop={(_, __, ref, _delta, position) => {
          isResizing.current = false;
          const newWidth = parseFloat(ref.style.width) / scale;
          const newHeight = parseFloat(ref.style.height) / scale;
          const scaledX = position.x / scale;
          const scaledY = position.y / scale;
          setPos({ x: scaledX, y: scaledY });
          setSize({ width: newWidth, height: newHeight });
          onChange(item.id, {
            width: newWidth,
            height: newHeight,
            x: scaledX,
            y: scaledY,
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