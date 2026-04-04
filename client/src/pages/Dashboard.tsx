// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import MoodLogger from '../components/dashboard/MoodLogger';
import MoodGraph from '../components/dashboard/MoodGraph';
import JournalHistory from '../components/dashboard/JournalHistory';
import JournalPrompt from '../components/dashboard/JournalPrompt';
import SavedMoodBoards from '../components/dashboard/SavedMoodBoards';

export default function Dashboard() {
  const [moodRefreshKey, setMoodRefreshKey] = useState(0);
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);
  const [savedBoardsRefreshKey, setSavedBoardsRefreshKey] = useState(0);

  useEffect(() => {
    const savePendingBoard = async () => {
      const pending = localStorage.getItem("manifest_magic_pending_board");
      if (!pending) return;

      const { items, boardName, boardMood } = JSON.parse(pending);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: board, error: boardError } = await supabase
        .from("moodboards")
        .insert([{
          user_id: user.id,
          name: boardName || "My Board",
          mood: boardMood || "",
          board_width: 600,
          board_height: 800,
        }])
        .select()
        .single();

      if (boardError) { console.error("Failed to save pending board:", boardError); return; }

      const { error: itemError } = await supabase
        .from("moodboard_items")
        .insert(items.map((item: any) => ({
          board_id: board.id,
          type: item.type,
          content: item.content,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          zIndex: item.zIndex,
        })));

      if (itemError) { console.error("Failed to save pending board items:", itemError); return; }

      localStorage.removeItem("manifest_magic_pending_board");
      setSavedBoardsRefreshKey(k => k + 1);
    };

    savePendingBoard();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setSavedBoardsRefreshKey(k => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mt-8">
          <SavedMoodBoards refreshKey={savedBoardsRefreshKey} />
        </div>
        <div className="mt-8">
          <JournalPrompt onEntrySaved={() => setJournalRefreshKey(k => k + 1)} />
        </div>
        <div className="mt-8">
          <JournalHistory refreshKey={journalRefreshKey} />
        </div>
        <div className="p-6 mt-8">
          <MoodLogger onMoodLogged={() => setMoodRefreshKey(k => k + 1)} />
        </div>
        <div className="mt-8">
          <MoodGraph refreshKey={moodRefreshKey} />
        </div>
      </div>
    </>
  );
}