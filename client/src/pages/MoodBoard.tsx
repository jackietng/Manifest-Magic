// src/pages/MoodBoard.tsx
import { Outlet } from "react-router-dom";

function MoodBoard() {
  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <Outlet /> {/* Nested routes will render here */}
      </div>
    </div>
  );
}

export default MoodBoard;
