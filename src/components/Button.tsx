import { type FC } from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "subtle" | "danger";
  className?: string;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ onClick, children, variant = "primary", className, disabled }) => {
  const baseClasses = "px-3 py-1.5 rounded text-xs font-medium transition-colors";
  let variantClasses = "";
  switch (variant) {
    case "secondary":
      variantClasses = "bg-gray-600 hover:bg-gray-500";
      break;
    case "subtle":
      variantClasses = "text-blue-400 hover:text-blue-300";
      break;
    case "danger":
      variantClasses = "bg-red-600 hover:bg-red-500 text-white";
      break;
    case "primary":
    default:
      variantClasses = "bg-blue-500 hover:bg-blue-400 text-white";
      break;
  }
  if (disabled) {
    variantClasses = "opacity-50 cursor-not-allowed";
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
};

export default Button;
