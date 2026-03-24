// src/components/dashboard/MoodLogger.tsx
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const moods = [
  { emoji: '🤩', mood: 'Excited' },
  { emoji: '😄', mood: 'Happy' },
  { emoji: '😌', mood: 'Calm' },
  { emoji: '😐', mood: 'Neutral' },
  { emoji: '😰', mood: 'Anxious' },
  { emoji: '😢', mood: 'Sad' },
  { emoji: '😠', mood: 'Mad' },
];

const MoodLogger = ({ onMoodLogged }: { onMoodLogged: () => void }) => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [logged, setLogged] = useState<string | null>(null);
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";
  const mutedColor = isDark ? "var(--lavender)" : "var(--orchid)";

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      setProfileId(profile?.id);
    };

    fetchProfile();
  }, []);

  const logMood = async (mood: string) => {
    if (!profileId) return;

    const { error } = await supabase.from('mood_logs').insert({
      profile_id: profileId,
      mood,
    });

    if (!error) {
      setLogged(mood);
      onMoodLogged();
      setTimeout(() => setLogged(null), 2000);
    } else {
      alert('Failed to log mood');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 px-2">
      <h2
        className="text-xl font-semibold text-center"
        style={{ color: textColor }}
      >
        How are you feeling?
      </h2>

      {/* Emoji grid — wraps naturally on mobile */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {moods.map((m) => (
          <button
            key={m.mood}
            onClick={() => logMood(m.mood)}
            className="flex flex-col items-center gap-1 hover:scale-125 transition-transform p-2 rounded-xl"
            title={m.mood}
          >
            <span style={{ fontSize: "2rem" }}>{m.emoji}</span>
            <span
              className="text-xs"
              style={{ color: textColor }}
            >
              {m.mood}
            </span>
          </button>
        ))}
      </div>

      {/* Logged confirmation */}
      {logged && (
        <p
          className="text-sm text-center"
          style={{ color: isDark ? "var(--snow)" : "var(--primary)" }}
        >
          Logged: {logged} ✨
        </p>
      )}
    </div>
  );
};

export default MoodLogger;