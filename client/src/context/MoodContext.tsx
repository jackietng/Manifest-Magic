import { createContext, useContext, useState } from "react";

interface MoodContextType {
  mood: string;
  setMood: (mood: string) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: React.ReactNode }) => {
  const [mood, setMood] = useState("");

  return (
    <MoodContext.Provider value={{ mood, setMood }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMood must be used within MoodProvider");
  return context;
};
export default MoodContext;