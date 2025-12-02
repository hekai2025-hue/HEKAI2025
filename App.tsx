import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import NewsFeed from './components/NewsFeed';
import Sidebar from './components/Sidebar';
import AnalysisModal from './components/AnalysisModal';
// 确保这里的路径是正确的，指向 services 文件夹
import { fetchGlobalNews, analyzeNewsItem } from './services/geminiService';
import { NewsItem, AnalysisResult } from './types';
import { RefreshCw, Radio, Pause, Play } from 'lucide-react';

const AUTO_REFRESH_INTERVAL = 60; // seconds

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  
  // Auto Refresh State
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeLeft, setTimeLeft] = useState(AUTO_REFRESH_INTERVAL);
  const timerRef = useRef<number | null>(null);

  // Analysis State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Initial Load
  useEffect(() => {
    loadNews();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto Refresh Timer Logic
  useEffect(() => {
    if (autoRefresh && !loadingNews) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            loadNews();
            return AUTO_REFRESH_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, loadingNews]);

  const loadNews = async () => {
    setLoadingNews(true);
    try {
      const data = await fetchGlobalNews();
      setNews(data);
      setTimeLeft(AUTO_REFRESH_INTERVAL); // Reset timer after load
    } catch (e) {
      console.error("Failed to load news", e);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleAnalyze = async (item: NewsItem) => {
    setSelectedNews(item);
    setAnalysisResult(null);
    setModalOpen(true);
    setAnalyzing(true);
    
    // Pause auto-refresh while analyzing to prevent disruption
    const wasAutoRefreshing = autoRefresh;
    if (wasAutoRefreshing) setAutoRefresh(false);
    
    try {
      const result = await analyzeNewsItem(item);
      setAnalysisResult(result);
    } catch (e) {
      console.error("Analysis error", e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900 font-sans">
      <Header darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

      <main className="container mx-auto px-4 py-6">
        {/* Top Ticker Bar */}
        <div className="mb-6 overflow-hidden whitespace-nowrap bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-8 shadow-sm">
             <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200"><Radio size={12} className="text-red-500 animate-pulse" /> 市场直播</span>
             <span>USDJPY <span className="text-slate-900 dark:text-white font-bold">151.20</span> <span className="text-bearish">▼ 0.1%</span></span>
             <span>EURUSD <span className="text-slate-900 dark:text-white font-bold">1.0850</span> <span className="text-bullish">▲ 0.05%</span></span>
             <span>BTCUSD <span className="text-slate-900 dark:text-white font-bold">69,420</span> <span className="text-bullish">▲ 1.2%</span></span>
             <span>XAUUSD <span className="text-slate-900 dark:text-white font-bold">2,350.10</span> <span className="text-bullish">▲ 0.3%</span></span>
             <span>NVDA <span className="text-slate-900 dark:text-white font-bold">905.20</span> <span className="text-bearish">▼ 0.8%</span></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed - 8 Columns */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">全球 7x24h 快讯 (北京时间)</h3>
              
              <div className="flex items-center gap-3">
                {/* Auto Refresh Toggle */}
                <button 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    autoRefresh 
                      ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                      : 'bg-slate-100 text-slate-500 border-transparent dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {autoRefresh ? <Pause size={12} /> : <Play size={12} />}
                  <span>{autoRefresh ? `${timeLeft}s` : '自动刷新'}</span>
                  {autoRefresh && (
                    <div className="w-8 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                         style={{ width: `${(timeLeft / AUTO_REFRESH_INTERVAL) * 100}%` }}
                       ></div>
                    </div>
                  )}
                </button>

                <button 
                  onClick={loadNews}
                  disabled={loadingNews}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 font-bold shadow-sm disabled:opacity-50 hover:shadow transition-all"
                >
                  <RefreshCw size={14} className={loadingNews ? 'animate-spin' : ''} />
                  刷新
                </button>
              </div>
            </div>
            
            <NewsFeed 
              news={news} 
              onAnalyze={handleAnalyze} 
              loading={loadingNews} 
            />
          </div>

          {/* Sidebar - 4 Columns */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      <AnalysisModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        newsItem={selectedNews}
        analysis={analysisResult}
        isLoading={analyzing}
      />
    </div>
  );
};

export default App;
