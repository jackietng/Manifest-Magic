// src/hooks/useUserMoods.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export const useUserMoods = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMoods = async () => {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("mood, created_at")
        .eq("profile_id", user.id)  // changed from user_id to profile_id
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching moods:", error);
      else setData(data);

      setLoading(false);
    };

    fetchMoods();
  }, [user]);

  return { data, loading };
};