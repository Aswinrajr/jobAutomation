import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-transparent",
    secondary:
      "bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 backdrop-blur-sm",
    outline:
      "border-2 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    danger:
      "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
    md: "px-5 py-2.5 text-sm font-semibold",
    lg: "px-8 py-3.5 text-base font-bold",
  };

  return (
    <button
      className={cn(
        "rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className, label, error, ...props }) => (
  <div className="w-full group">
    {label && (
      <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
        {label}
      </label>
    )}
    <input
      className={cn(
        "w-full px-4 py-3.5 bg-gray-900/40 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium",
        error && "border-red-500/50 focus:ring-red-500/50",
        className,
      )}
      {...props}
    />
    {error && (
      <p className="text-red-400 text-xs mt-1 ml-1 font-medium animate-pulse">
        {error}
      </p>
    )}
  </div>
);

export const Card = ({
  className,
  children,
  hoverEffect = false,
  ...props
}) => (
  <div
    className={cn(
      "glass-card rounded-2xl p-6 relative overflow-hidden",
      hoverEffect &&
        "hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1",
      className,
    )}
    {...props}
  >
    {hoverEffect && (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    )}
    <div className="relative z-10">{children}</div>
  </div>
);

export const Badge = ({ children, variant = "default", className }) => {
  const styles = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-lg text-xs font-semibold border",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};
