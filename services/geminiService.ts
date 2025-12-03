import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, NewsItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock data for fallback mode (when API key is missing or network fails)
const MOCK_NEWS: NewsItem[] = [
    {
        id: 'mock-1',
        time: '14:30',
        content: '【模拟数据】由于网络或 Key 未配置，正在显示演示数据。美联储暗示将在下个季度考虑降息，市场反应强烈。',
        rawContent: 'Demo Mode Active',
        category: 'Macro',
        importance: 'High',
        region: 'US',
        sources: [{ name: 'System Demo', url: '#' }]
    },
    {
        id: 'mock-2',
        time: '14:28',
        content: '英伟达 (NVDA) 股价盘前突破 950 美元，AI 芯片需求持续超出华尔街预期。',
        category: 'Stock',
        importance: 'Medium',
        region: 'US',
        sources: [{ name: 'Mock Source', url: '#' }]
    },
    {
        id: 'mock-3',
        time: '14:15',
        content: '现货黄金短线跳水 10 美元，现报 2340.50 美元/盎司，受美元指数反弹影响。',
        category: 'Commodity',
        importance: 'Medium',
        region: 'GLOBAL',
        sources: [{ name: 'Mock Source', url: '#' }]
    },
    {
        id: 'mock-4',
        time: '13:50',
        content: '比特币突破 71000 美元关口，ETF 资金净流入创单周新高。',
        category: 'Crypto',
        importance: 'High',
        region: 'GLOBAL',
        sources: [{ name: 'Mock Source', url: '#' }]
    }
];

// Helper to clean JSON markdown
const cleanJson = (text: string): string => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
  return cleaned.trim();
};

const extractJson = (text: string): any => {
    let jsonStr = cleanJson(text);
    const start = jsonStr.indexOf('[');
    const end = jsonStr.lastIndexOf(']');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    } 
    return JSON.parse(jsonStr);
};

// Internal fetcher for specific categories
const fetchCategoryNews = async (
    categoryName: string, 
    searchQuery: string, 
    regionCode: string
): Promise<NewsItem[]> => {
    if (!ai) throw new Error("API Key Missing");

    try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' });

        const fullPrompt = `
        当前北京时间: ${timeString}
        
        **极速任务**：
        作为"金十数据"的即时快讯同步助手，请搜索 **site:jin10.com/flash OR site:cls.cn/telegraph OR site:wallstreetcn.com/live**。
        只关注**最近 1 小时内**发生的最新金融快讯。
        
        **搜索目标**: ${searchQuery}

        **严格要求**：
        1. **速度第一**：无需啰嗦，直接提取最新 3-5 条关键快讯。
        2. **格式同步**：内容风格必须像金十快讯一样简练（例如："【美国3月CPI高于预期】..."）。
        3. **时间校准**：time 字段必须是新闻发生的北京时间 (HH:MM)。

        返回 JSON (Array):
        [
            {
                "time": "HH:MM",
                "content": "【标题】内容摘要(含关键数据)",
                "rawContent": "一句话背景补充",
                "category": "Stock" | "Forex" | "Crypto" | "Commodity" | "Macro" | "RealEstate",
                "importance": "High" | "Medium" | "Low",
                "region": "${regionCode}" 
            }
        ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text;
        if (!text) return [];

        let data = [];
        try {
            data = extractJson(text);
        } catch (e) {
            return [];
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => ({
                name: chunk.web?.title || 'Jin10/Source',
                url: chunk.web?.uri || '#'
            }))
            .filter((s: any) => s.url && s.url !== '#')
            .slice(0, 2);

        return data.map((item: any) => ({
            ...item,
            id: uuidv4(),
            sources: sources.length > 0 ? sources : [{ name: 'Jin10 Sync', url: 'https://www.jin10.com' }]
        }));

    } catch (error) {
        console.error(`Error fetching ${regionCode}:`, error);
        throw error; // Let the main handler switch to mock
    }
};

// Main export used by App.tsx
export const fetchGlobalNews = async (): Promise<NewsItem[]> => {
    // 1. Check if API Key exists
    if (!ai) {
        console.warn("No API Key found. Using Mock Data.");
        return MOCK_NEWS;
    }

    try {
        const tasks = [
          { query: '中国市场突发：A股 港股 人民币汇率 房地产政策', region: 'CN' },
          { query: '美股盘前/盘中 美联储 科技股 英伟达 特斯拉', region: 'US' },
          { query: '黄金(Gold) 原油 比特币(BTC) 外汇(Forex) 价格异动', region: 'GLOBAL' }
        ];

        // Parallel execution
        const results = await Promise.allSettled(
            tasks.map(t => fetchCategoryNews('General', t.query, t.region))
        );

        let allNews: NewsItem[] = [];
        let successCount = 0;

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allNews = [...allNews, ...result.value];
                successCount++;
            }
        });

        // If ALL requests failed (likely network issue), return Mock data
        if (successCount === 0 && allNews.length === 0) {
            console.warn("All API requests failed (Network/VPN issue?). Using Mock Data.");
            return MOCK_NEWS;
        }

        // Sort by time descending
        return allNews.sort((a, b) => b.time.localeCompare(a.time));

    } catch (e) {
        console.error("Global Fetch Error:", e);
        return MOCK_NEWS;
    }
};

export const analyzeNewsItem = async (newsItem: NewsItem): Promise<AnalysisResult> => {
  if (!ai) throw new Error("API Key Missing");

  // If it's a mock item, return mock analysis
  if (newsItem.id.startsWith('mock-')) {
      return new Promise((resolve) => {
          setTimeout(() => {
              resolve({
                  summary: "【演示分析】这是针对演示数据的模拟分析结果。如果看到此消息，说明无法连接 Google Gemini API。",
                  sentimentScore: 8,
                  tradingSignal: 'LONG',
                  confidence: 90,
                  reasoning: ["演示逻辑一：模拟数据触发买入信号", "演示逻辑二：市场情绪模拟为乐观"],
                  impactDuration: 'Intraday',
                  tickers: [{ symbol: 'DEMO', action: 'Buy', priceTarget: '100.00' }]
              });
          }, 1500);
      });
  }

  try {
    const prompt = `
      角色：顶级游资/机构交易员。
      分析对象: "${newsItem.content}"
      
      **必须联网**：
      1. 查该消息相关资产的 **实时现价**。
      2. 查市场最新解读。

      JSON输出 (中文):
      {
        "summary": "核心逻辑+实时价格。",
        "sentimentScore": -10到10,
        "tradingSignal": "LONG" | "SHORT" | "WAIT" | "NEUTRAL",
        "confidence": 0-100,
        "reasoning": ["理由1", "理由2", "理由3"],
        "impactDuration": "Scalp" | "Intraday" | "Swing",
        "tickers": [
           { "symbol": "代码", "action": "买入"|"卖出"|"观望", "priceTarget": "点位" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis");
    
    let jsonStr = cleanJson(text);
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

    return JSON.parse(jsonStr) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};
