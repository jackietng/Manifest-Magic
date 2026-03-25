// src/components/dashboard/MoodGraph.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useUserMoods } from "../../hooks/useUserMoods";
import { useTheme } from "../../context/ThemeContext";

const moodMap: Record<string, number> = {
  Excited: 7,
  Happy: 6,
  Calm: 5,
  Neutral: 4,
  Anxious: 3,
  Sad: 2,
  Mad: 1
};

const MoodGraph = ({ refreshKey = 0 }: { refreshKey?: number }) => {
  const { data, loading } = useUserMoods(refreshKey);
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const textColor = isDark ? "#f4f1f0" : "#544683";
  const gridColor = isDark ? "#4a4060" : "#e0d5f5";
  const tooltipBg = isDark ? "#2a223a" : "#ffffff";
  const tooltipBorder = isDark ? "#7b5ea7" : "#ae89cf";

  const formattedData = data.map((entry) => ({
    date: new Date(entry.created_at).toLocaleDateString(),
    moodValue: moodMap[entry.mood] || 0,
    moodLabel: entry.mood
  }));

  if (loading) return <p>Loading mood data...</p>;

  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: textColor }}>
        Mood Over Time
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis
            domain={[1, 7]}
            ticks={[1, 2, 3, 4, 5, 6, 7]}
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            width={60}
            tickFormatter={(value) => {
              const label = Object.keys(moodMap).find(key => moodMap[key] === value) || '';
              return label.length > 7 ? label.slice(0, 6) + '…' : label;
            }}
          />
          <Tooltip
            formatter={(value: number) => Object.keys(moodMap).find(key => moodMap[key] === value)}
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: "12px",
              color: textColor,
            }}
            labelStyle={{ color: textColor }}
          />
          <Line type="monotone" dataKey="Mood:" stroke="#8884d8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodGraph;