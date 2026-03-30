//src/components/moodboard/BoardLoader.tsx
export default function MagicLoader() {
  return (
    <div className="magic-loader">
      <div className="sparkle-container">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className="sparkle" />
        ))}
      </div>

      <p className="loading-text">Manifesting your vision...</p>
    </div>
  );
}