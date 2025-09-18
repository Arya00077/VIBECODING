import { Stock, MarketData, AnalysisResult } from '../types';
import { NewsItem, MarketIndex } from '../types';

// Mock stock data for demonstration
const MOCK_STOCKS: MarketData[] = [
  // Indian Stocks
  { symbol: 'RELIANCE', price: 2456.75, change: 32.15, changePercent: 1.33, volume: 2345678, marketCap: 16600000000000 },
  { symbol: 'TCS', price: 3678.90, change: -45.20, changePercent: -1.21, volume: 1234567, marketCap: 13400000000000 },
  { symbol: 'HDFCBANK', price: 1567.45, change: 18.75, changePercent: 1.21, volume: 3456789, marketCap: 8900000000000 },
  { symbol: 'INFY', price: 1456.30, change: -12.45, changePercent: -0.85, volume: 2345678, marketCap: 6200000000000 },
  { symbol: 'ICICIBANK', price: 987.65, change: 15.30, changePercent: 1.57, volume: 4567890, marketCap: 6900000000000 },
  { symbol: 'HINDUNILVR', price: 2345.80, change: -8.90, changePercent: -0.38, volume: 1234567, marketCap: 5500000000000 },
  // US Stocks
  { symbol: 'AAPL', price: 185.25, change: 2.15, changePercent: 1.17, volume: 45234567, marketCap: 2890000000000 },
  { symbol: 'GOOGL', price: 142.89, change: -1.45, changePercent: -1.00, volume: 23456789, marketCap: 1780000000000 },
  { symbol: 'MSFT', price: 378.45, change: 5.23, changePercent: 1.40, volume: 34567890, marketCap: 2810000000000 },
  { symbol: 'TSLA', price: 248.76, change: -8.34, changePercent: -3.24, volume: 67890123, marketCap: 789000000000 },
];

const MOCK_INDICES: MarketIndex[] = [
  // Indian Indices
  { name: 'NIFTY 50', symbol: 'NIFTY', value: 21456.78, change: 145.32, changePercent: 0.68, country: 'IN' },
  { name: 'BANK NIFTY', symbol: 'BANKNIFTY', value: 45678.90, change: -234.56, changePercent: -0.51, country: 'IN' },
  { name: 'NIFTY IT', symbol: 'NIFTYIT', value: 32456.78, change: 123.45, changePercent: 0.38, country: 'IN' },
  { name: 'NIFTY FMCG', symbol: 'NIFTYFMCG', value: 54321.09, change: -87.65, changePercent: -0.16, country: 'IN' },
  { name: 'SENSEX', symbol: 'SENSEX', value: 71234.56, change: 456.78, changePercent: 0.65, country: 'IN' },
  // US Indices
  { name: 'S&P 500', symbol: 'SPX', value: 4567.89, change: 23.45, changePercent: 0.52, country: 'US' },
  { name: 'NASDAQ', symbol: 'IXIC', value: 14567.89, change: 67.89, changePercent: 0.47, country: 'US' },
  { name: 'DOW JONES', symbol: 'DJI', value: 34567.89, change: -123.45, changePercent: -0.36, country: 'US' },
];

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'NIFTY 50 Hits New All-Time High Amid Strong FII Inflows',
    summary: 'Indian benchmark index NIFTY 50 reached a new record high of 21,500 points driven by strong foreign institutional investor inflows and positive Q3 earnings.',
    source: 'Economic Times',
    timestamp: '2 hours ago',
    url: '#',
    category: 'market'
  },
  {
    id: '2',
    title: 'RBI Maintains Repo Rate at 6.5%, Focus on Inflation Control',
    summary: 'Reserve Bank of India keeps key policy rates unchanged, citing inflation concerns and global economic uncertainties.',
    source: 'Business Standard',
    timestamp: '4 hours ago',
    url: '#',
    category: 'policy'
  },
  {
    id: '3',
    title: 'IT Stocks Rally on Strong Q3 Results, TCS Leads Gains',
    summary: 'Information Technology sector outperforms broader market with TCS, Infosys posting better-than-expected quarterly results.',
    source: 'Moneycontrol',
    timestamp: '6 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '4',
    title: 'Banking Sector Under Pressure Amid NPA Concerns',
    summary: 'Bank Nifty declines 0.5% as investors worry about rising non-performing assets in the banking sector.',
    source: 'Mint',
    timestamp: '8 hours ago',
    url: '#',
    category: 'market'
  },
  {
    id: '5',
    title: 'Crude Oil Prices Impact Energy Stocks, ONGC Down 2%',
    summary: 'Rising crude oil prices put pressure on energy sector stocks with ONGC and other oil companies declining.',
    source: 'CNBC TV18',
    timestamp: '10 hours ago',
    url: '#',
    category: 'stock'
  }
];

class StockService {
  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_STOCKS.filter(stock => 
      symbols.length === 0 || symbols.includes(stock.symbol)
    );
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_INDICES;
  }

  async getNews(): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_NEWS;
  }

  async getHistoricalData(symbol: string, period: string = '1M'): Promise<number[]> {
    const basePrice = MOCK_STOCKS.find(s => s.symbol === symbol)?.price || 100;
    const days = period === '1M' ? 30 : period === '3M' ? 90 : period === '1Y' ? 365 : 7;
    
    const data: number[] = [];
    let currentPrice = basePrice * 0.9;
    
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * 0.05;
      currentPrice *= (1 + change);
      data.push(Number(currentPrice.toFixed(2)));
    }
    
    return data;
  }

  async analyzePortfolio(stocks: Stock[]): Promise<AnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totalValue = stocks.reduce((sum, stock) => sum + (stock.current_price * stock.quantity), 0);
    const totalInvested = stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.quantity), 0);
    const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    const uniqueSectors = new Set(stocks.map(s => this.getSector(s.symbol))).size;
    const diversificationScore = Math.min((uniqueSectors / 8) * 100, 100);

    const riskLevel: 'low' | 'medium' | 'high' = 
      diversificationScore > 60 ? 'low' : 
      diversificationScore > 30 ? 'medium' : 'high';

    const performanceScore = Math.max(Math.min(totalReturn + 50, 100), 0);

    const recommendations = this.generateRecommendations(stocks, diversificationScore, totalReturn);
    const insights = this.generateInsights(stocks, totalReturn, riskLevel);

    return {
      risk_level: riskLevel,
      diversification_score: Math.round(diversificationScore),
      performance_score: Math.round(performanceScore),
      recommendations,
      insights,
    };
  }

  private getSector(symbol: string): string {
    const sectors: Record<string, string> = {
      // Indian Stocks
      'RELIANCE': 'Oil & Gas',
      'TCS': 'Information Technology',
      'HDFCBANK': 'Banking',
      'INFY': 'Information Technology',
      'ICICIBANK': 'Banking',
      'HINDUNILVR': 'FMCG',
      // US Stocks
      'AAPL': 'Technology',
      'GOOGL': 'Technology',
      'MSFT': 'Technology',
      'TSLA': 'Automotive',
      'AMZN': 'E-commerce',
      'NVDA': 'Semiconductors',
    };
    return sectors[symbol] || 'Other';
  }

  private generateRecommendations(stocks: Stock[], diversificationScore: number, totalReturn: number): string[] {
    const recommendations: string[] = [];

    if (diversificationScore < 40) {
      recommendations.push('Consider diversifying across more sectors to reduce risk');
    }

    if (totalReturn < -10) {
      recommendations.push('Review underperforming positions for potential rebalancing');
    }

    if (stocks.length < 5) {
      recommendations.push('Consider expanding portfolio size for better risk distribution');
    }

    const techHeavy = stocks.filter(s => this.getSector(s.symbol) === 'Technology').length > stocks.length * 0.5;
    if (techHeavy) {
      recommendations.push('Portfolio is heavily weighted in technology - consider other sectors');
    }

    return recommendations;
  }

  private generateInsights(stocks: Stock[], totalReturn: number, riskLevel: string): string[] {
    const insights: string[] = [];

    insights.push(`Your portfolio has generated a ${totalReturn.toFixed(1)}% return`);
    insights.push(`Risk level is assessed as ${riskLevel} based on diversification`);
    insights.push(`You hold ${stocks.length} different stocks across ${new Set(stocks.map(s => this.getSector(s.symbol))).size} sectors`);

    if (stocks.length > 0) {
      const topPerformer = stocks.reduce((best, stock) => {
        const currentReturn = ((stock.current_price - stock.purchase_price) / stock.purchase_price) * 100;
        const bestReturn = ((best.current_price - best.purchase_price) / best.purchase_price) * 100;
        return currentReturn > bestReturn ? stock : best;
      });

      insights.push(`${topPerformer.symbol} is your best performing stock`);
    }

    return insights;
  }
}

export const stockService = new StockService();