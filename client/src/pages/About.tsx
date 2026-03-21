// src/pages/About.tsx
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { theme } = useTheme();

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center mt-16">About Manifest Magic</h1>

      <p className="text-lg leading-relaxed">
        There is something powerful about writing down what you want. 
      </p>
      <p className="text-lg leading-relaxed">  
        About seeing it.
      </p>  
      <p className="text-lg leading-relaxed">  
        About believing it before it exists.
      </p>
      <p className="text-lg leading-relaxed mb-6">
        Manifest Magic was born from that belief. It is a sacred space rooted in intentional living, personal growth, and spiritual empowerment. We believe in the power of vision, discipline, and aligned action. Here, your inner world shapes your outer one, and growth feels less like a destination and more like a daily practice.
      </p>
      <p className="text-lg leading-relaxed mb-6">
        Through tools, resources, and community, we aim to support your journey. Whether you're manifesting love, peace, purpose, or abundance, whatever you're calling in, you deserve a space that holds that vision with you and helps you unlock your highest potential by aligning your thoughts, habits, and environment with your deepest desires.
      </p>
      <p className="text-lg leading-relaxed">
        Here, magic meets mindfulness. And we are honored to be part of your journey. {theme === "dark" ? "🤍" : "💜"}
      </p>
    </section>
  );
};

export default About;