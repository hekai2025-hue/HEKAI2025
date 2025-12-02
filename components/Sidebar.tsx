import React from 'react';
import { CalendarDays, TrendingUp, TrendingDown, Globe, Lock } from 'lucide-react';

const Sidebar: React.FC = () => {
  const indices = [
    { name: '标普 500', value: '5,245.12', change: '+0.45%', isUp: true },
    { name: '纳斯达克', value: '16,428.50', change: '+1.12%', isUp: true },
    { name: '美元指数 DXY', value: '104.20', change: '-0.15%', isUp: false },
    { name: '现货黄金', value: '2,345.10', change: '+0.80%', isUp: true },
    { name: '比特币 BTC', value: '67,120.00', change: '-1.20%', isUp: false },
    { name: '上证指数', value: '3,050.20', change: '+0.22%', isUp: true },
  ];

  const events = [
    { time: '20:30', event: '美国 3月 未季调CPI年率', impact: 'High', currency: 'USD' },
    { time: '20:30', event: '美国 初请失业金人数', impact: 'Medium', currency: 'USD' },
    { time: '22:00', event: '欧洲央行行长拉加德讲话', impact: 'High', currency: 'EUR' },
    { time: '02:00', event: '美联储公布货币政策会议纪要', impact: 'High', currency: 'USD' },
  ];

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <Globe size={18} className="text-blue-600" />
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">主要行情</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {indices.map((idx) => (
            <div key={idx.name} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{idx.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{idx.value}</div>
                <div className={`text-xs font-medium ${idx.isUp ? 'text-bullish' : 'text-bearish'} flex items-center justify-end gap-1`}>
                   {idx.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                   {idx.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Calendar */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <CalendarDays size={18} className="text-purple-600" />
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">财经日历 (今日)</h2>
        </div>
        <div className="p-0">
          {events.map((evt, i) => (
             <div key={i} className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex gap-3 items-start hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
               <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-1 rounded min-w-[42px] text-center">
                 {evt.time}
               </div>
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1 rounded">{evt.currency}</span>
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, starI) => (
                        <div key={starI} className={`w-2 h-2 rounded-full ${starI < (evt.impact === 'High' ? 3 : 2) ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-tight mt-1.5 font-medium">{evt.event}</p>
               </div>
             </div>
          ))}
        </div>
        <div className="p-2 text-center bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
           <button className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline py-1">查看完整日历 &rarr;</button>
        </div>
      </div>

       {/* VIP Promo */}
       <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-5 text-white shadow-lg group cursor-pointer">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock size={64} />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1 text-yellow-400">机构暗池数据</h3>
            <p className="text-slate-300 text-xs mb-3 leading-relaxed">解锁高盛、摩根大通的实时大单流向与期权异动数据。</p>
            <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded text-xs transition-colors">
              立即升级 PRO
            </button>
          </div>
       </div>
    </div>
  );
};

export default Sidebar;
