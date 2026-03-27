// src/context/ProfileContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const AVATARS: Record<number, string> = {
  1: "🔮", 2: "🌙", 3: "⭐", 4: "🌸", 5: "🦋",
  6: "🌺", 7: "✨", 8: "🌿", 9: "💫", 10: "🕊️",
  11: "🌻", 12: "☀️",
};

type ProfileContextType = {
  displayName: string;
  avatarId: number | null;
  avatarEmoji: string;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  displayName: "",
  avatarId: null,
  avatarEmoji: "👤",
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState<number | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setDisplayName("");
      setAvatarId(null);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarId(profile.avatar_id || null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const avatarEmoji = avatarId ? AVATARS[avatarId] : "👤";

  return (
    <ProfileContext.Provider
      value={{ displayName, avatarId, avatarEmoji, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};