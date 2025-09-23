import { Stock, MarketData, AnalysisResult, NewsItem, MarketIndex } from '../types';

// Security: Rate limiting and caching
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests = 100;
  private readonly windowMs = 60000; // 1 minute

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Simple cache implementation
class Cache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Mock stock data for demonstration
const MOCK_STOCKS: Readonly<MarketData[]> = Object.freeze([
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
]);

const MOCK_INDICES: Readonly<MarketIndex[]> = Object.freeze([
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
  // Global Indices
  { name: 'FTSE 100', symbol: 'UKX', value: 7654.32, change: 45.67, changePercent: 0.60, country: 'UK' },
  { name: 'DAX', symbol: 'DAX', value: 15432.10, change: -89.45, changePercent: -0.58, country: 'DE' },
  { name: 'NIKKEI 225', symbol: 'NKY', value: 32145.67, change: 234.56, changePercent: 0.74, country: 'JP' },
  { name: 'HANG SENG', symbol: 'HSI', value: 18765.43, change: -123.45, changePercent: -0.65, country: 'HK' },
  { name: 'CAC 40', symbol: 'CAC', value: 7234.56, change: 67.89, changePercent: 0.95, country: 'FR' },
  // Crypto Indices
  { name: 'Bitcoin', symbol: 'BTC-USD', value: 43567.89, change: 1234.56, changePercent: 2.92, country: 'CRYPTO' },
  { name: 'Ethereum', symbol: 'ETH-USD', value: 2678.45, change: -89.34, changePercent: -3.23, country: 'CRYPTO' },
  { name: 'BNB', symbol: 'BNB-USD', value: 345.67, change: 12.34, changePercent: 3.70, country: 'CRYPTO' },
  { name: 'Solana', symbol: 'SOL-USD', value: 98.76, change: -4.56, changePercent: -4.42, country: 'CRYPTO' },
  { name: 'Cardano', symbol: 'ADA-USD', value: 0.456, change: 0.023, changePercent: 5.31, country: 'CRYPTO' },
]);

const MOCK_NEWS: Readonly<NewsItem[]> = Object.freeze([
  {
    id: '1',
    title: 'NIFTY 50 Surges to Record High as FII Inflows Touch ₹15,000 Crores',
    summary: 'Indian benchmark index NIFTY 50 reached a new record high of 21,847 points driven by massive foreign institutional investor inflows and stellar Q3 earnings from IT and banking sectors.',
    source: 'Economic Times',
    timestamp: '1 hour ago',
    url: '#',
    category: 'market'
  },
  {
    id: '2',
    title: 'RBI Holds Repo Rate at 6.5%, Signals Cautious Stance on Inflation',
    summary: 'Reserve Bank of India maintains accommodative policy stance while keeping a close watch on food inflation and global commodity prices. GDP growth forecast revised to 6.8%.',
    source: 'Business Standard',
    timestamp: '3 hours ago',
    url: '#',
    category: 'policy'
  },
  {
    id: '3',
    title: 'IT Sector Rallies 4.2% as TCS, Infosys Beat Q3 Estimates',
    summary: 'Technology stocks surge on robust quarterly earnings with TCS reporting 12% YoY growth and Infosys raising FY24 guidance. Deal wins in BFSI sector drive optimism.',
    source: 'Moneycontrol',
    timestamp: '4 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '4',
    title: 'Bank Nifty Recovers 2.1% on Improved Asset Quality Metrics',
    summary: 'Banking stocks rebound strongly after HDFC Bank and ICICI Bank report significant improvement in asset quality with NPA ratios hitting multi-year lows.',
    source: 'Mint',
    timestamp: '5 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '5',
    title: 'Energy Stocks Gain 3.5% as Crude Oil Prices Stabilize Above $85',
    summary: 'Oil & Gas sector outperforms with ONGC, Reliance Industries leading gains as Brent crude stabilizes. Refining margins show improvement.',
    source: 'CNBC TV18',
    timestamp: '6 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '6',
    title: 'Adani Group Stocks Surge 8% on Debt Reduction Announcement',
    summary: 'Adani portfolio companies rally after the group announces accelerated debt reduction plan and strategic asset monetization worth ₹25,000 crores.',
    source: 'Reuters',
    timestamp: '7 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '7',
    title: 'Mutual Fund Inflows Hit Record ₹1.2 Lakh Crores in Q3',
    summary: 'Equity mutual funds witness unprecedented inflows as retail investors show strong appetite for Indian equities amid market volatility.',
    source: 'Financial Express',
    timestamp: '8 hours ago',
    url: '#',
    category: 'market'
  },
  {
    id: '8',
    title: 'Auto Sector Gains 2.8% on Strong December Sales Data',
    summary: 'Automobile stocks rally as companies report robust festive season sales with Maruti Suzuki, Tata Motors leading the charge.',
    source: 'ET Auto',
    timestamp: '9 hours ago',
    url: '#',
    category: 'stock'
  },
  {
    id: '9',
    title: 'Foreign Portfolio Investment Turns Positive After 3 Months',
    summary: 'FPIs invest ₹8,500 crores in Indian equities in January, marking a reversal from three consecutive months of outflows.',
    source: 'Bloomberg Quint',
    timestamp: '10 hours ago',
    url: '#',
    category: 'market'
  },
  {
    id: '10',
    title: 'Pharma Stocks Rally 5.2% on US FDA Approval for Generic Drugs',
    summary: 'Pharmaceutical sector surges as Dr. Reddy\'s and Sun Pharma receive multiple ANDA approvals from US FDA, boosting export prospects.',
    source: 'Pharma Letter',
    timestamp: '11 hours ago',
    url: '#',
    category: 'stock'
  }
]);

class StockService {
  private rateLimiter = new RateLimiter();
  private cache = new Cache();

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    const cacheKey = `market_data_${symbols.join(',')}`;
    const cached = this.cache.get<MarketData[]>(cacheKey);
    if (cached) return cached;

    if (!this.rateLimiter.canMakeRequest('market_data')) {
      throw new Error('Rate limit exceeded');
    }
    
    await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay
    
    const result = MOCK_STOCKS.filter(stock => 
      symbols.length === 0 || symbols.includes(stock.symbol)
    );
    
    this.cache.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    const cached = this.cache.get<MarketIndex[]>('market_indices');
    if (cached) return cached;

    if (!this.rateLimiter.canMakeRequest('market_indices')) {
      throw new Error('Rate limit exceeded');
    }

    await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay
    
    this.cache.set('market_indices', [...MOCK_INDICES], 120000); // Cache for 2 minutes
    return [...MOCK_INDICES];
  }

  async getNews(): Promise<NewsItem[]> {
    const cached = this.cache.get<NewsItem[]>('news');
    if (cached) return cached;

    if (!this.rateLimiter.canMakeRequest('news')) {
      throw new Error('Rate limit exceeded');
    }

    await new Promise(resolve => setTimeout(resolve, 250)); // Reduced delay
    
    this.cache.set('news', [...MOCK_NEWS], 300000); // Cache for 5 minutes
    return [...MOCK_NEWS];
  }

  async getHistoricalData(symbol: string, period: string = '1M'): Promise<number[]> {
    // Security: Input validation
    if (typeof symbol !== 'string' || symbol.length > 10) {
      throw new Error('Invalid symbol');
    }
    
    const validPeriods = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];
    if (!validPeriods.includes(period)) {
      throw new Error('Invalid period');
    }

    const cacheKey = `historical_${symbol}_${period}`;
    const cached = this.cache.get<number[]>(cacheKey);
    if (cached) return cached;

    const basePrice = MOCK_STOCKS.find(s => s.symbol === symbol)?.price || 100;
    const days = this.getPeriodDays(period);
    
    const data: number[] = [];
    let currentPrice = basePrice * 0.9;
    
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * 0.05;
      currentPrice *= (1 + change);
      data.push(Number(currentPrice.toFixed(2)));
    }
    
    this.cache.set(cacheKey, data, 600000); // Cache for 10 minutes
    return data;
  }

  private getPeriodDays(period: string): number {
    const periodMap: Record<string, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '2Y': 730
    };
    return periodMap[period] || 30;
  }

  async analyzePortfolio(stocks: Stock[]): Promise<AnalysisResult> {
    // Security: Input validation
    if (!Array.isArray(stocks) || stocks.length > 100) {
      throw new Error('Invalid portfolio data');
    }

    const cacheKey = `analysis_${JSON.stringify(stocks.map(s => ({ symbol: s.symbol, quantity: s.quantity })))}`;
    const cached = this.cache.get<AnalysisResult>(cacheKey);
    if (cached) return cached;

    await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay

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

    const result = {
      risk_level: riskLevel,
      diversification_score: Math.round(diversificationScore),
      performance_score: Math.round(performanceScore),
      recommendations,
      insights,
    };
    
    this.cache.set(cacheKey, result, 180000); // Cache for 3 minutes
    return result;
  }

  private getSector(symbol: string): string {
    const sectors: Readonly<Record<string, string>> = Object.freeze({
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
    });
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

  // Cleanup method for memory management
  clearCache(): void {
    this.cache.clear();
  }
}

export const stockService = new StockService();