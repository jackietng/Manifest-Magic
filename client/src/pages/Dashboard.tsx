// src/pages/Dashboard.tsx
import { useState } from 'react';
import MoodLogger from '../components/dashboard/MoodLogger';
import MoodGraph from '../components/dashboard/MoodGraph';
import JournalHistory from '../components/dashboard/JournalHistory';
import JournalPrompt from '../components/dashboard/JournalPrompt';
import SavedMoodBoards from '../components/dashboard/SavedMoodBoards';

export default function Dashboard() {
  const [moodRefreshKey, setMoodRefreshKey] = useState(0);
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mt-8">
          <SavedMoodBoards />
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