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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-500/20">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Portfolio Analyzer</h2>
            <p className="text-white/60">Advanced insights powered by machine learning</p>
          </div>
        </div>
        <GlassButton
          onClick={runAnalysis}
          disabled={loading || stocks.length === 0}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          <span>{loading ? 'Analyzing...' : 'Analyze Portfolio'}</span>
        </GlassButton>
      </div>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Risk Assessment */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              {getRiskIcon(analysis.risk_level)}
              <div>
                <h3 className="text-lg font-semibold text-white">Risk Level</h3>
                <p className={`text-xl font-bold ${getRiskColor(analysis.risk_level)} capitalize`}>
                  {analysis.risk_level}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  analysis.risk_level === 'low' ? 'bg-green-400' :
                  analysis.risk_level === 'medium' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`}
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
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Diversification</h3>
                <p className="text-2xl font-bold text-blue-400">{analysis.diversification_score}%</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-400"
                initial={{ width: '0%' }}
                animate={{ width: `${analysis.diversification_score}%` }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </div>
          </GlassCard>

          {/* Performance Score */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Performance</h3>
                <p className="text-2xl font-bold text-green-400">{analysis.performance_score}%</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-400"
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recommendations */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-white/80">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Insights */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Portfolio Insights</h3>
            <div className="space-y-3">
              {analysis.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-3 p-3 rounded-lg bg-white/5"
                >
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-white/80">{insight}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};