export interface NewsSource {
  name: string;
  url: string;
}

export interface NewsItem {
  id: string;
  time: string;
  content: string;
  rawContent?: string;
  category: 'Forex' | 'Stock' | 'Crypto' | 'Commodity' | 'Macro';
  importance: 'Low' | 'Medium' | 'High';
  sources?: NewsSource[];
  region?: string;
}

export interface AnalysisResult {
  summary: string;
  sentimentScore: number; // -10 (Bearish) to 10 (Bullish)
  tradingSignal: 'LONG' | 'SHORT' | 'WAIT' | 'NEUTRAL';
  confidence: number; // 0 to 100
  reasoning: string[];
  impactDuration: 'Scalp (Mins)' | 'Intraday' | 'Swing (Days)' | 'Long Term';
  tickers: {
    symbol: string;
    action: 'Buy' | 'Sell' | 'Watch' | '买入' | '卖出' | '观望';
    priceTarget?: string;
  }[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface MarketIndex {
  name: string;
  value: string;
  change: string;
  isUp: boolean;
}