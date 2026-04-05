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

// Visible bar/dot rendered inside each resize handle
function BarHandle({
  direction,
  visible,
  touchDevice,
}: {
  direction: "top" | "bottom" | "left" | "right" | "corner";
  visible: boolean;
  touchDevice: boolean;
}) {
  const isHorizontal = direction === "top" || direction === "bottom";
  const isCorner = direction === "corner";

  const base: React.CSSProperties = {
    borderRadius: "999px",
    backgroundColor: visible ? "rgba(139, 92, 246, 0.85)" : "transparent",
    transition: "background-color 0.15s ease, opacity 0.15s ease",
    opacity: visible ? 1 : 0,
    pointerEvents: "none",
    flexShrink: 0,
  };

  if (isCorner) {
    const s = touchDevice ? 14 : 10;
    return <div style={{ ...base, width: s, height: s, borderRadius: "50%" }} />;
  }

  if (isHorizontal) {
    return (
      <div
        style={{
          ...base,
          width: touchDevice ? 36 : 24,
          height: touchDevice ? 5 : 4,
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        width: touchDevice ? 5 : 4,
        height: touchDevice ? 36 : 24,
      }}
    />
  );
}

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
  const isActive = isDragging.current || isResizing.current;
  const touchDevice = isTouchDevice();
  const showControls = touchDevice ? selected : hovered;

  // Generous touch hit area for each handle
  const hitArea = touchDevice ? 28 : 14;

  useEffect(() => {
    if (!isDragging.current && !isResizing.current) {
      setPos({ x: item.x, y: item.y });
      setSize({ width: item.width, height: item.height });
    }
  }, [item.x, item.y, item.width, item.height, scale]);

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

  // Each handle wrapper: transparent hit area, flexbox to position the visible bar
  const edgeH = (align: "flex-start" | "center" | "flex-end", justify: "flex-start" | "center" | "flex-end"): React.CSSProperties => ({
    width: "100%",
    height: hitArea,
    background: "transparent",
    zIndex: 20,
    display: "flex",
    alignItems: align,
    justifyContent: justify,
    padding: "2px 0",
  });

  const edgeV = (align: "flex-start" | "center" | "flex-end", justify: "flex-start" | "center" | "flex-end"): React.CSSProperties => ({
    width: hitArea,
    height: "100%",
    background: "transparent",
    zIndex: 20,
    display: "flex",
    alignItems: align,
    justifyContent: justify,
    padding: "0 2px",
  });

  const cornerStyle = (align: "flex-start" | "flex-end", justify: "flex-start" | "flex-end"): React.CSSProperties => ({
    width: hitArea,
    height: hitArea,
    background: "transparent",
    zIndex: 20,
    display: "flex",
    alignItems: align,
    justifyContent: justify,
    padding: "2px",
  });

  const btnSize = touchDevice ? "32px" : "20px";
  const btnFontSize = touchDevice ? "18px" : "12px";
  const overlayBtnPadding = touchDevice ? "8px 12px" : "2px 5px";
  const overlayBtnFontSize = touchDevice ? "13px" : "9px";

  // During drag/resize use local state; otherwise always derive from props
  // This ensures scale changes from parent always reflect correctly
  const sourceX = isActive ? pos.x : item.x;
  const sourceY = isActive ? pos.y : item.y;
  const sourceW = isActive ? size.width : item.width;
  const sourceH = isActive ? size.height : item.height;
  const scaledPos = { x: sourceX * scale, y: sourceY * scale };
  const scaledSize = { width: sourceW * scale, height: sourceH * scale };

  const bar = (dir: "top" | "bottom" | "left" | "right" | "corner") => (
    <BarHandle direction={dir} visible={showControls} touchDevice={touchDevice} />
  );

  console.log(`item ${item.id.slice(0,6)} | item.x:${item.x} item.y:${item.y} | scale:${scale} | scaledPos:`, scaledPos);

  return (
    <Rnd
      position={scaledPos}
      size={scaledSize}
      bounds="parent"
      lockAspectRatio={false}
      enableUserSelectHack={false}
      enableResizing={{
        top: true,
        bottom: true,
        left: true,
        right: true,
        topLeft: true,
        topRight: true,
        bottomLeft: true,
        bottomRight: true,
      }}
      resizeHandleStyles={{
        top:         edgeH("flex-start", "center"),
        bottom:      edgeH("flex-end",   "center"),
        left:        edgeV("center",     "flex-start"),
        right:       edgeV("center",     "flex-end"),
        topLeft:     cornerStyle("flex-start", "flex-start"),
        topRight:    cornerStyle("flex-start", "flex-end"),
        bottomLeft:  cornerStyle("flex-end",   "flex-start"),
        bottomRight: cornerStyle("flex-end",   "flex-end"),
      }}
      resizeHandleComponent={{
        top:         <>{bar("top")}</>,
        bottom:      <>{bar("bottom")}</>,
        left:        <>{bar("left")}</>,
        right:       <>{bar("right")}</>,
        topLeft:     <>{bar("corner")}</>,
        topRight:    <>{bar("corner")}</>,
        bottomLeft:  <>{bar("corner")}</>,
        bottomRight: <>{bar("corner")}</>,
      }}
      style={{
        position: "absolute",
        overflow: "visible",
        zIndex: item.zIndex,
        outline: showControls ? "2px dashed rgba(139, 92, 246, 0.6)" : "none",
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
        if (touchDevice) setSelected(true);
      }}
      onResize={(_, __, ref, _delta, position) => {
        const newWidth = parseFloat(ref.style.width) / scale;
        const newHeight = parseFloat(ref.style.height) / scale;
        const unscaledX = position.x / scale;
        const unscaledY = position.y / scale;
        setPos({ x: unscaledX, y: unscaledY });
        setSize({ width: newWidth, height: newHeight });
      }}
      onResizeStop={(_, __, ref, _delta, position) => {
        console.log("scale at resize stop:", scale);
        console.log("raw ref width:", ref.style.width, "raw ref height:", ref.style.height);
        console.log("raw position:", position);
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
            {/* Delete — top right */}
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

            {/* Front / Back — bottom left */}
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