// src/components/moodboard/BoardLoader.tsx
export default function MagicLoader() {
  return (
    <div className="magic-loader">
      <div className="sparkle-container">
        {Array.from({ length: 40 }).map((_, i) => {
        const style = {
            "--x": Math.random(),
            "--y": Math.random(),
            "--delay": `${Math.random() * 3}s`,
            "--duration": `${2 + Math.random() * 2.5}s`,
            "--scale": 0.5 + Math.random() * 1.5,
            "--drift": `${(Math.random() - 0.5) * 40}px`,
            "--twinkle": `${0.5 + Math.random() * 1.5}s`,
        } as React.CSSProperties;

        return <span key={i} className="sparkle" style={style} />;
        })}
      </div>

      <p className="loading-text">Manifesting your vision...</p>
    </div>
  );
}