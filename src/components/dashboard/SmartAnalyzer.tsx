import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Stock, AnalysisResult } from '../../types';
import { stockService } from '../../services/stockService';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

interface SmartAnalyzerProps {
  stocks: Stock[];
}

export const SmartAnalyzer = ({ stocks }: SmartAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await stockService.analyzePortfolio(stocks);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stocks.length > 0) {
      runAnalysis();
    }
  }, [stocks]);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl blur-3xl -z-10" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm border border-purple-400/20"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(168, 85, 247, 0.3)',
                '0 0 30px rgba(59, 130, 246, 0.3)',
                '0 0 20px rgba(168, 85, 247, 0.3)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="w-7 h-7 text-purple-300" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Portfolio Analyzer
            </h2>
            <p className="text-white/70 text-lg">Advanced insights powered by machine learning</p>
          </div>
        </div>
        </div>
        <GlassButton
          onClick={runAnalysis}
          disabled={loading || stocks.length === 0}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/30 hover:from-purple-500/30 hover:to-blue-500/30"
        >
          {loading ? (
            <motion.div
              className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          <span className="font-semibold">{loading ? 'Analyzing...' : 'Analyze Portfolio'}</span>
        </GlassButton>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Risk Assessment */}
          <GlassCard className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              {getRiskIcon(analysis.risk_level)}
              <div>
                <h3 className="text-xl font-bold text-white">Risk Assessment</h3>
                <p className={`text-2xl font-bold ${getRiskColor(analysis.risk_level)} capitalize`}>
                  {analysis.risk_level}
                </p>
              </div>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  analysis.risk_level === 'low' ? 'bg-green-400' :
                  analysis.risk_level === 'medium' ? 'bg-yellow-400' :
                  'bg-red-400'
                } shadow-lg`}
                initial={{ width: '0%' }}
                animate={{ 
                  width: analysis.risk_level === 'low' ? '30%' :
                         analysis.risk_level === 'medium' ? '60%' : '90%'
                }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>
          </GlassCard>

          {/* Diversification Score */}
          <GlassCard className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-blue-500/30 border border-blue-400/20">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Diversification</h3>
                <p className="text-3xl font-bold text-blue-400">{analysis.diversification_score}%</p>
              </div>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-lg"
                initial={{ width: '0%' }}
                animate={{ width: `${analysis.diversification_score}%` }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </div>
          </GlassCard>

          {/* Performance Score */}
          <GlassCard className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-xl bg-green-500/30 border border-green-400/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Performance</h3>
                <p className="text-3xl font-bold text-green-400">{analysis.performance_score}%</p>
              </div>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg"
                initial={{ width: '0%' }}
                animate={{ width: `${analysis.performance_score}%` }}
                transition={{ delay: 0.9, duration: 0.8 }}
              />
            </div>
          </GlassCard>
        </motion.div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Recommendations */}
          <GlassCard className="p-8 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <span>AI Recommendations</span>
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mt-2 flex-shrink-0 shadow-lg" />
                  <p className="text-white/90 font-medium">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Insights */}
          <GlassCard className="p-8 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span>Portfolio Insights</span>
            </h3>
            <div className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mt-2 flex-shrink-0 shadow-lg" />
                  <p className="text-white/90 font-medium">{insight}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};