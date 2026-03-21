// src/components/Button.tsx
import { Link } from 'react-router-dom';

interface ButtonProps {
  to?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ to, children, onClick, className = '' }: ButtonProps) => {
  const baseClasses = `bg-pastel-purple hover:bg-pastel-pink text-text-dark font-semibold py-2 px-4 rounded transition ${className}`;

  return to ? (
    <Link to={to} className={baseClasses}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
};

export default Button;
