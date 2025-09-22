import { motion } from 'framer-motion';
import { ReactNode, ButtonHTMLAttributes, memo } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const GlassButton = memo(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  className = '', 
  ...props 
}: GlassButtonProps) => {
  const variants = {
    primary: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-600 dark:text-blue-400',
    secondary: 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-400/30 text-gray-700 dark:text-gray-300',
    success: 'bg-green-500/20 hover:bg-green-500/30 border-green-400/30 text-green-600 dark:text-green-400',
    danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-600 dark:text-red-400',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      className={`
        backdrop-blur-lg border rounded-xl
        font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed relative
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );