// src/components/moodboard/MoodItem.tsx
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

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

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
  const [selected, setSelected] = useState(false);
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const touchDevice = isTouchDevice();
  const showControls = touchDevice ? selected : hovered;

  // Sync external item changes only when not interacting
  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      setPos({ x: item.x, y: item.y });
      setSize({ width: item.width, height: item.height });
    }
  }, [item.x, item.y, item.width, item.height]);

  useEffect(() => {
    if (!touchDevice || !selected) return;

    const handleTouchOutside = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".no-drag")) return;
      setSelected(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener("touchstart", handleTouchOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("touchstart", handleTouchOutside);
    };
  }, [selected, touchDevice]);

  const fontSize = Math.max(12, Math.min(size.width, size.height) * 0.14);

  const handleMouseEnter = () => {
    if (touchDevice) return;
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    if (touchDevice) return;
    leaveTimer.current = setTimeout(() => setHovered(false), 150);
  };

  const handleTap = (e: React.TouchEvent) => {
    if (!touchDevice) return;
    const target = e.target as HTMLElement;
    if (target.closest(".no-drag")) return;
    e.stopPropagation();
    setSelected(true);
  };

  const handleStyle = {
    width: touchDevice ? "20px" : "12px",
    height: touchDevice ? "20px" : "12px",
    backgroundColor: showControls ? "rgba(156, 163, 175, 0.9)" : "transparent",
    borderRadius: "3px",
    zIndex: 10,
    transition: "background-color 0.15s ease",
  };

  const btnSize = touchDevice ? "32px" : "20px";
  const btnFontSize = touchDevice ? "18px" : "12px";
  const overlayBtnPadding = touchDevice ? "8px 12px" : "2px 5px";
  const overlayBtnFontSize = touchDevice ? "13px" : "9px";

  // Rnd expects positions/sizes in SCALED (screen) pixels.
  // Our state stores UNSCALED (board) coordinates.
  // We convert here so Rnd renders correctly under the CSS scale() transform.
  const scaledPos = { x: pos.x * scale, y: pos.y * scale };
  const scaledSize = { width: size.width * scale, height: size.height * scale };

  return (
    <Rnd
      position={scaledPos}
      size={scaledSize}
      bounds="parent"
      lockAspectRatio={false}
      enableUserSelectHack={false}
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
        overflow: "visible",
        zIndex: item.zIndex,
        outline: showControls
          ? "2px dashed rgba(156, 163, 175, 0.8)"
          : "none",
        transition: "outline 0.15s ease",
        touchAction: "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={() => {
        isDragging.current = true;
        if (touchDevice) setSelected(true);
      }}
      onDrag={(_, d) => {
        // d.x/d.y are already in scaled screen pixels — convert back to board coords
        setPos({ x: d.x / scale, y: d.y / scale });
      }}
      onDragStop={(_, d) => {
        isDragging.current = false;
        const unscaledX = d.x / scale;
        const unscaledY = d.y / scale;
        setPos({ x: unscaledX, y: unscaledY });
        onChange(item.id, { x: unscaledX, y: unscaledY });
      }}
      onResizeStart={() => {
        isResizing.current = true;
      }}
      onResize={(_, __, ref, _delta, position) => {
        // ref.style.width/height are in scaled pixels — convert to board coords
        const newWidth = parseFloat(ref.style.width) / scale;
        const newHeight = parseFloat(ref.style.height) / scale;
        const unscaledX = position.x / scale;
        const unscaledY = position.y / scale;
        setPos({ x: unscaledX, y: unscaledY });
        setSize({ width: newWidth, height: newHeight });
      }}
      onResizeStop={(_, __, ref, _delta, position) => {
        isResizing.current = false;
        const newWidth = parseFloat(ref.style.width) / scale;
        const newHeight = parseFloat(ref.style.height) / scale;
        const unscaledX = position.x / scale;
        const unscaledY = position.y / scale;
        setPos({ x: unscaledX, y: unscaledY });
        setSize({ width: newWidth, height: newHeight });
        onChange(item.id, {
          width: newWidth,
          height: newHeight,
          x: unscaledX,
          y: unscaledY,
        });
      }}
    >
      {/* Inner content wrapper */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: item.type === "text" ? "visible" : "hidden",
        }}
        onTouchStart={handleTap}
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

        {/* Overlay controls */}
        {showControls && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              zIndex: item.zIndex + 100,
            }}
          >
            {/* Delete button */}
            <button
              className="no-drag"
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRemove(item.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: btnSize,
                height: btnSize,
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "50%",
                fontSize: btnFontSize,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "all",
                lineHeight: 1,
                padding: touchDevice ? "8px" : "0px",
              }}
            >
              ×
            </button>

            {/* Front / Back buttons */}
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                left: "4px",
                display: "flex",
                gap: "4px",
                pointerEvents: "all",
              }}
            >
              <button
                className="no-drag"
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onBringToFront(item.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onBringToFront(item.id);
                }}
                style={{
                  background: "rgba(84, 70, 131, 0.85)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: overlayBtnPadding,
                  fontSize: overlayBtnFontSize,
                  cursor: "pointer",
                  lineHeight: 1.4,
                  backdropFilter: "blur(2px)",
                }}
              >
                ↑ Front
              </button>
              <button
                className="no-drag"
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSendToBack(item.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSendToBack(item.id);
                }}
                style={{
                  background: "rgba(164, 133, 180, 0.85)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: overlayBtnPadding,
                  fontSize: overlayBtnFontSize,
                  cursor: "pointer",
                  lineHeight: 1.4,
                  backdropFilter: "blur(2px)",
                }}
              >
                ↓ Back
              </button>
            </div>
          </div>
        )}
      </div>
    </Rnd>
  );
}