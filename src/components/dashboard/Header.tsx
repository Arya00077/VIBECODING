import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Share,
  Download,
  Calculator as CalcIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { ShareModal } from '../ui/ShareModal';
import { ExportModal } from './ExportModal';
import { Calculator } from '../ui/Calculator';

interface HeaderProps {
  portfolioData?: any;
}

export const Header = ({ portfolioData }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 dark:bg-white/5 border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 5 }}
            >
              <span className="text-xl font-bold text-white">📊</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Stock Dashboard</h1>
              <p className="text-sm text-white/60">Professional Trading Suite</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <GlassButton
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setShowShareModal(true)}
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </GlassButton>
            
            <GlassButton
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setShowCalculator(true)}
            >
              <CalcIcon className="w-4 h-4" />
              <span>Calculator</span>
            </GlassButton>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-gray-900 dark:text-white" /> : <Moon className="w-5 h-5 text-gray-900 dark:text-white" />}
            </button>

            <button className="p-2 rounded-xl bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-900 dark:text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium">{user?.full_name || 'User'}</span>
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48"
                >
                  <GlassCard className="p-2">
                    <div className="space-y-1">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
          
          {/* Current Time Display */}
          <div className="hidden md:flex items-center space-x-2 ml-6">
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 dark:bg-black/20 rounded-lg backdrop-blur-sm">
              <Clock className="w-4 h-4 text-white/80" />
              <div className="text-white/90">
                <div className="text-xs font-medium">
                  {new Date().toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata'
                  })} IST
                </div>
                <div className="text-xs text-white/60">
                  {new Date().toLocaleDateString('en-IN', { 
                    day: '2-digit', 
                    month: 'short',
                    timeZone: 'Asia/Kolkata'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-4"
          >
            <div className="space-y-2">
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
              >
                <Share className="w-4 h-4" />
                <span>Share Portfolio</span>
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button 
                onClick={() => setShowCalculator(true)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
              >
                <CalcIcon className="w-4 h-4" />
                <span>Calculator</span>
              </button>
              <button 
                onClick={toggleTheme}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-black/20 transition-colors text-gray-900 dark:text-white flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          portfolioData={portfolioData}
        />
      )}
      
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          portfolioData={portfolioData}
        />
      )}
      
      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}
    </motion.header>
  );
};