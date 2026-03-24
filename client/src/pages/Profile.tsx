// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const AVATARS = [
  { id: 1, emoji: "🔮", label: "Crystal Ball" },
  { id: 2, emoji: "🌙", label: "Moon" },
  { id: 3, emoji: "⭐", label: "Star" },
  { id: 4, emoji: "🌸", label: "Blossom" },
  { id: 5, emoji: "🦋", label: "Butterfly" },
  { id: 6, emoji: "🌺", label: "Hibiscus" },
  { id: 7, emoji: "✨", label: "Sparkles" },
  { id: 8, emoji: "🌿", label: "Herb" },
  { id: 9, emoji: "💫", label: "Dizzy" },
  { id: 10, emoji: "🕊️", label: "Dove" },
  { id: 11, emoji: "🌻", label: "Sunflower" },
  { id: 12, emoji: "☀️", label: "Sun" },
];

export default function Profile() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";
  const mutedColor = isDark ? "var(--lavender)" : "var(--orchid)";
  const inputStyle = {
    backgroundColor: isDark ? "#2a223a" : "var(--snow)",
    color: isDark ? "var(--snow)" : "var(--primary)",
    borderColor: isDark ? "var(--violet)" : "var(--plum)",
  };
  const cardStyle = {
    backgroundColor: isDark ? "#2a223a" : "#ffffff",
    color: textColor,
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setSelectedAvatar(profile.avatar_id || null);
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update display name and avatar in profiles table
    const { data: updateData, error: profileError } = await supabase
        .from("profiles")
        .update({
            display_name: displayName,
            avatar_id: selectedAvatar,
        })
        .eq("id", user.id)
        .select();

        console.log("Update result:", updateData);
        console.log("Update error:", profileError);
        console.log("User ID:", user.id);
        console.log("Avatar ID:", selectedAvatar);
        console.log("Display Name:", displayName);

        if (profileError) {
        setError("Failed to update profile. Please try again.");
        setSaving(false);
        return;
        }

    // Update password if provided
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match.");
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        setSaving(false);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passwordError) {
        setError("Failed to update password. Please try again.");
        setSaving(false);
        return;
      }
    }

    setSuccess("Profile updated successfully! 💜");
    setNewPassword("");
    setConfirmPassword("");
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: textColor }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1
        className="text-3xl font-bold text-center mb-8 mt-8"
        style={{ color: textColor }}
      >
        My Profile
      </h1>

      {/* Avatar selection */}
      <div
        className="rounded-2xl p-6 mb-6 shadow-sm"
      >
        <h2
          className="text-lg font-semibold text-center mb-4"
          style={{ color: textColor }}
        >
          Choose Your Avatar: 
        </h2>
        {selectedAvatar && (
          <p
            className="text-md -mt-4 text-center"
            style={{ color: textColor }}
          >
            {AVATARS.find((a) => a.id === selectedAvatar)?.emoji}{" "}
            {AVATARS.find((a) => a.id === selectedAvatar)?.label}
          </p>
        )}
        <div className="grid grid-cols-6 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              title={avatar.label}
              style={{
                fontSize: "2rem",
                padding: "8px",
                borderRadius: "12px",
                border: selectedAvatar === avatar.id
                  ? `2px solid var(--primary)`
                  : `2px solid transparent`,
                backgroundColor: selectedAvatar === avatar.id
                  ? isDark ? "#3b2a5a" : "var(--petal)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                lineHeight: 1,
              }}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Profile info */}
      <div
        className="rounded-2xl p-6 mb-6"
      >
        <h2
          className="text-lg font-semibold text-center mb-4"
          style={{ color: textColor }}
        >
          Account Information
        </h2>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-center mb-1"
              style={{ color: textColor }}
            >
              Email
            </label>
            <p
              className="text-xs text-center mt-1"
              style={{ color: textColor }}
            >
              Email cannot be changed
            </p>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border rounded-xl focus:outline-none opacity-60"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-sm text-center font-medium mb-1"
              style={{ color: textColor }}
            >
              Username
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter a display name..."
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Password update */}
      <div
        className="rounded-2xl p-6 mb-6"
      >
        <h2
          className="text-lg font-semibold text-center mb-4"
          style={{ color: textColor }}
        >
          Change Password
        </h2>
          <p
            className="text-sm text-center"
            style={{ color: textColor }}
          >
            Leave blank if you don't want to change your password
          </p>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm text-center font-medium mb-1"
              style={{ color: textColor }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-sm text-center font-medium mb-1"
              style={{ color: textColor }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password..."
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--violet)]"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <p
          className="text-center mb-4"
          style={{ color: "var(--rose)" }}
        >
          {error}
        </p>
      )}
      {success && (
        <p
          className="text-center mb-4"
          style={{ color: theme === "dark" ? "var(--snow)" : "var(--primary)" }}
        >
          {success}
        </p>
      )}

      {/* Save button */}
      <div className="flex justify-center">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="px-8 py-3 rounded-xl font-medium"
          style={{ backgroundColor: "var(--lilac)" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}