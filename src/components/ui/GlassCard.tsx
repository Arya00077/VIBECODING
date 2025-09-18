import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className = '', hover = false }: GlassCardProps) => {
  return (
    <motion.div
      className={`
        backdrop-blur-lg bg-white/90 dark:bg-black/90
        border border-gray-200 dark:border-gray-800
        rounded-2xl shadow-xl shadow-black/5
        ${hover ? 'hover:bg-white/95 dark:hover:bg-black/95 transition-all duration-300' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};