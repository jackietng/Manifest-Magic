//src/components/moodboard/MoodItem.tsx
import { Rnd } from "react-rnd";
import { useState } from "react";

export type MoodItemType = {
  id: string;
  type: "image" | "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function MoodItem({
  item,
  onChange,
  onRemove,
}: {
  item: MoodItemType;
  onChange: (id: string, changes: Partial<MoodItemType>) => void;
  onRemove: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: item.x, y: item.y });
  const [size, setSize] = useState({ width: item.width, height: item.height });

  // Calculate aspect ratio from original dimensions
  const aspectRatio = item.width / item.height;

  return (
    <>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          position: "absolute",
          left: pos.x + size.width - 9,
          top: pos.y - 9,
          zIndex: 30,
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
        }}
      >
        ×
      </button>
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
          topLeft: {
            width: "12px",
            height: "12px",
            backgroundColor: "rgba(156, 163, 175, 0.9)",
            borderRadius: "3px",
            top: "0px",
            left: "0px",
            zIndex: 10,
          },
          bottomLeft: {
            width: "12px",
            height: "12px",
            backgroundColor: "rgba(156, 163, 175, 0.9)",
            borderRadius: "3px",
            bottom: "0px",
            left: "0px",
            zIndex: 10,
          },
          bottomRight: {
            width: "12px",
            height: "12px",
            backgroundColor: "rgba(156, 163, 175, 0.9)",
            borderRadius: "3px",
            bottom: "0px",
            right: "0px",
            zIndex: 10,
          },
        }}
        style={{
          position: "absolute",
          overflow: "hidden",
        }}
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

          // For images manually enforce aspect ratio based on which dimension changed most
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
              fontSize: "1rem",
            }}
          >
            {item.content}
          </div>
        )}
      </Rnd>
    </>
  );
}