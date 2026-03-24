// src/pages/About.tsx
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "var(--snow)" : "var(--primary)";

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1
        className="text-3xl sm:text-4xl font-bold mb-8 text-center mt-12 sm:mt-16"
        style={{ color: textColor }}
      >
        About Manifest Magic
      </h1>

      <div className="flex flex-col gap-4">
        <p
          className="text-center text-lg leading-relaxed italic"
          style={{ color: textColor }}
        >
          There is something powerful about writing down what you want.
        </p>
        <p
          className="text-center text-lg leading-relaxed italic"
          style={{ color: textColor }}
        >
          About seeing it.
        </p>
        <p
          className="text-center text-lg leading-relaxed italic mb-2"
          style={{ color: textColor }}
        >
          About believing it before it exists.
        </p>
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: textColor }}
        >
          Manifest Magic was born from that belief. It is a sacred space rooted in intentional living, personal growth, and spiritual empowerment. We believe in the power of vision, discipline, and aligned action. Here, your inner world shapes your outer one, and growth feels less like a destination and more like a daily practice.
        </p>
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: textColor }}
        >
          Through tools, resources, and community, we aim to support your journey. Whether you're manifesting love, peace, purpose, or abundance, whatever you're calling in, you deserve a space that holds that vision with you and helps you unlock your highest potential by aligning your thoughts, habits, and environment with your deepest desires.
        </p>
        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: textColor }}
        >
          Here, magic meets mindfulness. And we are honored to be part of your journey. {isDark ? "🤍" : "💜"}
        </p>
      </div>
    </section>
  );
};

export default About;