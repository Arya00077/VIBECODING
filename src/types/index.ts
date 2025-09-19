export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Stock {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_value: number;
  total_invested: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  stock_id: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface AnalysisResult {
  risk_level: 'low' | 'medium' | 'high';
  diversification_score: number;
  performance_score: number;
  recommendations: string[];
  insights: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url: string;
  category: 'market' | 'stock' | 'economy' | 'policy';
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  country: 'IN' | 'US' | 'UK' | 'DE' | 'JP' | 'HK' | 'FR' | 'CRYPTO';
}