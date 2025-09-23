import { memo } from 'react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'premium' | 'elegant';
}

export const GlassCard = memo(({ children, className = '', hover = false, variant = 'default' }: GlassCardProps) => {
  const variants = {
    default: 'backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border border-white/20 dark:border-slate-700/50 shadow-xl shadow-black/5 dark:shadow-black/20',
    premium: 'backdrop-blur-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 border border-white/30 dark:border-slate-600/30 shadow-2xl shadow-blue-500/10 dark:shadow-blue-400/5',
    elegant: 'backdrop-blur-xl bg-gradient-to-br from-slate-50/95 to-white/90 dark:from-slate-800/95 dark:to-slate-900/90 border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10 dark:shadow-black/30'
  };

  return (
    <motion.div
      className={`
        ${variants[variant]}
        rounded-2xl
        ${hover ? 'hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-400/10 transition-all duration-300 hover:-translate-y-1' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
});