import { memo } from 'react';
import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton = memo(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  ...props 
}: GlassButtonProps) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-blue-400/40 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20',
    secondary: 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 hover:from-slate-500/30 hover:to-gray-500/30 border-slate-400/40 text-slate-700 dark:text-slate-300 shadow-lg shadow-slate-500/20',
    success: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border-emerald-400/40 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/20',
    danger: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 hover:from-red-500/30 hover:to-rose-500/30 border-red-400/40 text-red-700 dark:text-red-300 shadow-lg shadow-red-500/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      className={`
        backdrop-blur-xl border rounded-xl
        font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:backdrop-blur-2xl
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.button>
  );
});