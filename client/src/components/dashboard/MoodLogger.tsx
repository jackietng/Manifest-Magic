// src/components/dashboard/MoodLogger.tsx
import { supabase } from '../../lib/supabaseClient';
import { useEffect, useState } from 'react';

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
      onMoodLogged();
    } else {
      alert('Failed to log mood');
    }
  };

  return (
    <div className="flex gap-4 items-center flex-wrap justify-center">
      <h2 className="text-xl font-semibold w-full text-center">How are you feeling?</h2>
      {moods.map((m) => (
        <button
  key={m.mood}
  onClick={() => logMood(m.mood)}
  style={{ fontSize: '1.8rem' }}
  className="hover:scale-125 transition-transform"
  title={m.mood}
>
  {m.emoji}
</button>
      ))}
    </div>
  );
};

export default MoodLogger;