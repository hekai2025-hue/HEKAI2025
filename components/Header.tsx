import React from 'react';
import { Moon, Sun, Radio, BarChart3, Wifi } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <BarChart3 size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              Alpha<span className="text-blue-600">Stream</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Global Intelligence</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Status Indicator */}
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">系统正常</span>
              <div className="h-3 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
              <Wifi size={12} className="text-slate-400" />
           </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={darkMode ? "切换亮色模式" : "切换暗色模式"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
