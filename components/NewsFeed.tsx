import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, Zap, Share2, Volume2 } from 'lucide-react';

interface NewsFeedProps {
  news: NewsItem[];
  onAnalyze: (item: NewsItem) => void;
  loading: boolean;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news, onAnalyze, loading }) => {
  
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to use a Chinese voice if available, though browser default usually auto-detects
      utterance.lang = 'zh-CN'; 
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'Forex': return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300';
        case 'Crypto': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300';
        case 'Stock': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Macro': return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300';
        case 'Commodity': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-300';
        default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      'Forex': '外汇',
      'Crypto': '加密',
      'Stock': '股市',
      'Macro': '宏观',
      'Commodity': '商品'
    };
    return map[cat] || cat;
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="flex-1 space-y-2">
               <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
               <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        暂无最新消息，请点击刷新。
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
         <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} fill="currentColor" />
            实时快讯 (Flash Feed)
         </h2>
         <span className="text-xs text-slate-500 flex items-center gap-1 bg-green-100 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-green-700 dark:text-green-400 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            LIVE
         </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {news.map((item) => (
          <div key={item.id} className="group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex gap-4 items-start relative">
            {/* Time Column */}
            <div className="flex flex-col items-center min-w-[64px] pt-1">
              <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-lg tracking-tight">{item.time}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded mt-1 font-medium ${getCategoryColor(item.category)}`}>
                {getCategoryLabel(item.category)}
              </span>
            </div>

            {/* Content Column */}
            <div className="flex-1 pr-2">
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[16px] font-medium tracking-wide">
                {item.content}
              </p>
              
              {/* Meta & Actions */}
              <div className="mt-3 flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                   <span className="flex items-center gap-1 font-mono">
                     {item.region} 
                     {item.importance === 'High' && <span className="text-red-500 font-bold ml-1">!!! 重要</span>}
                   </span>
                   {item.sources && item.sources.length > 0 && (
                     <a href={item.sources[0].url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                       <ExternalLink size={12} />
                       来源: {item.sources[0].name}
                     </a>
                   )}
                </div>

                <div className="flex items-center gap-1">
                   <button onClick={() => speakText(item.content)} title="朗读" className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Volume2 size={16} />
                   </button>
                   <button title="分享" className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Share2 size={16} />
                   </button>
                   <button 
                     onClick={() => onAnalyze(item)}
                     className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1 shadow-sm hover:shadow active:scale-95"
                   >
                     <Zap size={14} fill="currentColor" />
                     AI 深度分析
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
