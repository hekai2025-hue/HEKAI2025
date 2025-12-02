import React from 'react';
import { AnalysisResult, NewsItem } from '../types';
import { X, TrendingUp, TrendingDown, Target, BrainCircuit, AlertCircle, Clock, BarChart2, Globe } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
  newsItem: NewsItem | null;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis, newsItem, isLoading }) => {
  if (!isOpen) return null;

  // Don't render if we don't have newsItem (unless loading, but generally we need context)
  if (!newsItem && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-850 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-900">
          <div className="flex gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                AI 交易大师分析
                {!isLoading && analysis && (
                  <span className="text-[10px] font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200 dark:border-green-800">
                    <Globe size={10} /> 联网实时数据
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash • 机构级视角</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <div className="text-center space-y-2">
                 <p className="text-slate-800 dark:text-slate-200 font-medium text-lg animate-pulse">正在联网查询实时行情...</p>
                 <p className="text-slate-500 text-sm">检索相关标的现价 • 分析市场情绪 • 生成交易策略</p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              
              {/* News Context */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                 <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">分析对象</div>
                 <div className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{newsItem?.content}"
                 </div>
              </div>

              {/* Core Insight Summary */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                   <BarChart2 size={18} className="text-blue-500" />
                   核心观点
                </h4>
                <p className="text-slate-700 dark:text-slate-300 font-medium text-lg leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard 
                  label="情绪得分" 
                  value={analysis.sentimentScore > 0 ? `+${analysis.sentimentScore}` : analysis.sentimentScore.toString()}
                  color={analysis.sentimentScore > 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30' : analysis.sentimentScore < 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200'}
                  icon={analysis.sentimentScore > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                />
                <StatCard 
                  label="交易信号" 
                  value={
                    analysis.tradingSignal === 'LONG' ? '做多' : 
                    analysis.tradingSignal === 'SHORT' ? '做空' : 
                    analysis.tradingSignal === 'WAIT' ? '观望' : '中性'
                  }
                  color={
                    analysis.tradingSignal === 'LONG' ? 'text-green-700 bg-green-100 dark:bg-green-900/40 border-green-200' : 
                    analysis.tradingSignal === 'SHORT' ? 'text-red-700 bg-red-100 dark:bg-red-900/40 border-red-200' : 
                    'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200'
                  }
                  isBadge
                />
                <StatCard 
                  label="置信度" 
                  value={`${analysis.confidence}%`}
                  color="text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                />
                 <StatCard 
                  label="影响周期" 
                  value={analysis.impactDuration}
                  color="text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800"
                  icon={<Clock size={16} />}
                  textSmall
                />
              </div>

              {/* Logic & Reasoning */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-orange-500" />
                  大师逻辑
                </h4>
                <ul className="space-y-3">
                  {analysis.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="leading-tight pt-0.5">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tickers & Targets */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <Target size={18} className="text-red-500" />
                  操作建议
                </h4>
                <div className="grid gap-3">
                  {analysis.tickers.map((ticker, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-blue-400 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide
                          ${ticker.action === '买入' || ticker.action === 'Buy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                            ticker.action === '卖出' || ticker.action === 'Sell' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {ticker.action}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-slate-800 dark:text-white font-mono">{ticker.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-xs text-slate-500 mb-0.5">目标点位</div>
                         <div className="font-mono font-bold text-slate-700 dark:text-blue-300">{ticker.priceTarget || '--'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-red-500 py-8">
              <p>无法生成分析报告，请稍后重试。</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-400 flex justify-between items-center">
          <span>免责声明: AI生成内容仅供参考，不构成投资建议。市场有风险，投资需谨慎。</span>
          <span className="font-mono opacity-50">VER: 2.5-FLASH-LIVE</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, icon, isBadge = false, textSmall = false }: any) => (
  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${color}`}>
    <span className="text-[10px] opacity-70 mb-1 uppercase tracking-wider font-semibold">{label}</span>
    {isBadge ? (
       <span className={`px-2 py-0.5 rounded text-sm font-bold`}>{value}</span>
    ) : (
      <div className={`flex items-center gap-1 font-bold ${textSmall ? 'text-sm' : 'text-xl'}`}>
        {icon}
        {value}
      </div>
    )}
  </div>
);

export default AnalysisModal;