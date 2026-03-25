// src/pages/Dashboard.tsx
import MoodLogger from '../components/dashboard/MoodLogger';
import MoodGraph from '../components/dashboard/MoodGraph';
import JournalHistory from '../components/dashboard/JournalHistory';
import JournalPrompt from '../components/dashboard/JournalPrompt';
import SavedMoodBoards from '../components/dashboard/SavedMoodBoards';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const { theme } = useTheme();

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mt-8">
          <SavedMoodBoards />
        </div>
        <div className="mt-8">
          <JournalPrompt />
        </div>
        <div className="mt-8">
          <JournalHistory />
        </div>
        <div className="p-6 mt-8">
          <MoodLogger onMoodLogged={() => {}} />
        </div>
        <div className="mt-8">
          <MoodGraph />
        </div>
      </div>
    </>
  );
}