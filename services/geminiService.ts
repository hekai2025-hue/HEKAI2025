import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, NewsItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

// Get API Key from Vite environment variables
// In Vite, variables in .env must start with VITE_ to be exposed to the client
// CRITICAL FIX: Do not use process.env here as it causes ReferenceError in browsers
const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Optional: For custom proxies

if (!API_KEY) {
  console.error("API_KEY is missing. Please create a .env file with VITE_API_KEY=your_key");
}

// Support for custom base URL (e.g., for proxies)
const genAIConfig: any = { apiKey: API_KEY || '' };
if (API_BASE_URL) {
  genAIConfig.baseUrl = API_BASE_URL;
}

const ai = new GoogleGenAI(genAIConfig);

// Helper to clean JSON markdown
const cleanJson = (text: string): string => {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
  return cleaned.trim();
};

export const fetchGlobalNews = async (): Promise<NewsItem[]> => {
  if (!API_KEY) {
    // Return mock data if no key is present to prevent crash
    return [
      {
        id: 'error-mock',
        time: '系统提示',
        content: '未检测到 API Key，请在项目根目录创建 .env 文件并填入 VITE_API_KEY。',
        rawContent: '请前往 Google AI Studio 获取免费 Key。',
        category: 'Macro',
        importance: 'High',
        region: 'SYSTEM'
      }
    ];
  }

  try {
    const now = new Date();
    // Inject current timestamp to force model to be aware of "now"
    const utcTime = now.toISOString();
    
    // Prompt changed to Chinese for better local context matching Jin10 style
    // Added strict time instructions
    const prompt = `
      你是一个专业的全球金融快讯聚合器，风格类似“金十数据”或“华尔街见闻”。
      
      当前系统时间 (UTC): ${utcTime}
      请注意：必须将新闻发生的时间转换为 **北京时间 (UTC+8)** 格式 (HH:MM)。

      任务：
      1. 使用 Google Search 搜索过去3-6小时内关于：
         - 中国股市（A股/港股/中概股）
         - 中国房地产政策与市场动态
         - 美国股市（重点关注科技七巨头、AI板块）
         - 现货黄金 (XAUUSD) 与美元指数
      2. 挑选出当前最值得关注的 6-8 条新闻。
      3. 返回一个纯 JSON 数组。

      对于每一条新闻，严格遵守以下 JSON 格式（不要包含任何Markdown标记）：
      {
        "time": "HH:MM", (必须是北京时间 UTC+8),
        "content": "简练、专业的快讯摘要（最多30个字）。重点突出数据、涨跌幅和关键事件。",
        "rawContent": "稍详细的背景描述，100字以内。",
        "category": "Stock" | "Forex" | "Crypto" | "Commodity" | "Macro" | "RealEstate",
        "importance": "High" | "Medium" | "Low",
        "region": "CN" | "US" | "EU" | "ASIA" | "GLOBAL"
      }
      
      要求：
      - 语气紧迫、专业、客观。
      - 必须包含具体的数字（如 CPI 3.2%, 股价 $150）。
      - 仅输出 JSON 字符串。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini");

    // Robust JSON extraction
    let jsonStr = cleanJson(text);
    const start = jsonStr.indexOf('[');
    const end = jsonStr.lastIndexOf(']');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    } else {
      console.warn("Could not find JSON array brackets, attempting raw parse");
    }

    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON from text:", text);
        throw new Error("Invalid JSON format received");
    }
    
    // Enrich with sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({
        name: chunk.web?.title || 'Source',
        url: chunk.web?.uri || '#'
      }))
      .filter((s: any) => s.url && s.url !== '#')
      .slice(0, 3);

    return data.map((item: any) => ({
      ...item,
      id: uuidv4(),
      sources: sources.length > 0 ? sources : [{ name: 'MarketWire', url: '#' }]
    }));

  } catch (error) {
    console.error("Error fetching news:", error);
    // Chinese Fallback data
    return [
      {
        id: 'mock-1',
        time: '20:30',
        content: '美国 3月 CPI 年率录得 3.5%，高于预期的 3.4%，美联储降息预期降温。',
        rawContent: '数据显示通胀依然顽固，美元指数短线拉升50点，非美货币普跌。',
        category: 'Macro',
        importance: 'High',
        region: 'US',
        sources: [{ name: 'BLS.gov', url: '#' }]
      },
      {
        id: 'mock-2',
        time: '21:00',
        content: '万科A发布最新公告，拟回购不低于20亿元A股股份，股价盘后拉升。',
        category: 'RealEstate',
        importance: 'High',
        region: 'CN'
      },
      {
        id: 'mock-3',
        time: '21:15',
        content: '现货黄金短线跳水10美元，跌破2330美元/盎司。',
        category: 'Commodity',
        importance: 'Medium',
        region: 'GLOBAL'
      }
    ];
  }
};

export const analyzeNewsItem = async (newsItem: NewsItem): Promise<AnalysisResult> => {
  if (!API_KEY) {
     throw new Error("API Key Missing");
  }

  try {
    const prompt = `
      任务：扮演一位世界顶级的华尔街交易大师、宏观策略师和技术分析专家。
      
      分析对象：
      新闻: "${newsItem.content}" (分类: ${newsItem.category})
      详情: "${newsItem.rawContent || ''}"

      **关键步骤（必须联网）**：
      请利用 Google Search 联网查询：
      1. 该新闻涉及的交易标的（Ticker）的**当前实时价格**（例如：如果新闻是关于黄金，请查询 XAUUSD 现价；如果是关于苹果，查询 AAPL 现价；如果是关于A股，查询对应代码现价）。
      2. 该新闻发布后的最新市场反应、分析师评论或相关后续报道。

      结合你搜索到的**实时数据**和新闻内容，生成一份专业的交易备忘录。

      请以 JSON 格式输出分析结果（使用中文）：
      {
        "summary": "一句话核心逻辑（包含你查到的实时价格信息，例如：'数据利空，黄金现报2340，建议做空'）。",
        "sentimentScore": 整数 -10 (极度看跌) 到 10 (极度看涨),
        "tradingSignal": "LONG" (做多) | "SHORT" (做空) | "WAIT" (观望) | "NEUTRAL" (中性),
        "confidence": 0-100 的置信度整数,
        "reasoning": ["包含实时数据的理由1", "技术面/基本面理由2", "风险提示理由3"],
        "impactDuration": "Scalp (Mins)" | "Intraday" | "Swing (Days)" | "Long Term",
        "tickers": [
           {
             "symbol": "代码 (如 XAUUSD)",
             "action": "买入" | "卖出" | "观望",
             "priceTarget": "基于现价的具体目标 (如 '看至 2350')"
           }
        ]
      }
      
      要求：仅返回合法的 JSON 字符串，不要包含 Markdown 代码块标记。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        // ENABLE SEARCH to get real-time prices and context
        tools: [{ googleSearch: {} }],
        // responseMimeType must be removed when using tools
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");

    // Extract JSON manually since we can't use responseMimeType with tools
    let jsonStr = cleanJson(text);
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1);
    }

    return JSON.parse(jsonStr) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

