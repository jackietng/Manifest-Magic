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

  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      setPos({ x: item.x, y: item.y });
      setSize({ width: item.width, height: item.height });
    }
  }, [item.x, item.y, item.width, item.height]);

  useEffect(() => {
    if (!touchDevice || !selected) return;
    const handleTouchOutside = () => setSelected(false);
    document.addEventListener("touchstart", handleTouchOutside);
    return () => document.removeEventListener("touchstart", handleTouchOutside);
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

  const btnSize = touchDevice ? "28px" : "20px";
  const btnFontSize = touchDevice ? "16px" : "12px";
  const overlayBtnPadding = touchDevice ? "5px 8px" : "2px 5px";
  const overlayBtnFontSize = touchDevice ? "12px" : "9px";

  return (
    <Rnd
      position={{ x: pos.x, y: pos.y }}
      size={{ width: size.width, height: size.height }}
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
        const scaledX = touchDevice ? d.x : d.x / scale;
        const scaledY = touchDevice ? d.y : d.y / scale;
        setPos({ x: scaledX, y: scaledY });
      }}
      onDragStop={(_, d) => {
        isDragging.current = false;
        const scaledX = touchDevice ? d.x : d.x / scale;
        const scaledY = touchDevice ? d.y : d.y / scale;
        setPos({ x: scaledX, y: scaledY });
        onChange(item.id, { x: scaledX, y: scaledY });
      }}
      onResizeStart={() => {
        isResizing.current = true;
        if (touchDevice) setSelected(true);
      }}
      onResize={(_, __, ref, _delta, position) => {
        const newWidth = touchDevice
          ? parseFloat(ref.style.width)
          : parseFloat(ref.style.width) / scale;
        const newHeight = touchDevice
          ? parseFloat(ref.style.height)
          : parseFloat(ref.style.height) / scale;
        const scaledX = touchDevice ? position.x : position.x / scale;
        const scaledY = touchDevice ? position.y : position.y / scale;
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
        const newWidth = touchDevice
          ? parseFloat(ref.style.width)
          : parseFloat(ref.style.width) / scale;
        const newHeight = touchDevice
          ? parseFloat(ref.style.height)
          : parseFloat(ref.style.height) / scale;
        const scaledX = touchDevice ? position.x : position.x / scale;
        const scaledY = touchDevice ? position.y : position.y / scale;
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
        {/* Image or text content */}
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

        {/* Overlay controls — always inside the item bounds */}
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
            {/* Delete button — top right corner */}
            <button
              className="no-drag"
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
              }}
            >
              ×
            </button>

            {/* Front / Back buttons — bottom left corner */}
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                left: "4px",
                display: "flex",
                gap: "3px",
                pointerEvents: "all",
              }}
            >
              <button
                className="no-drag"
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