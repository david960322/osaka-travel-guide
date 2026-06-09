// /api/chat.js
// ─────────────────────────────────────────────
// 架構：先走 Mock 層 → 沒命中才呼叫 Gemini API
// ─────────────────────────────────────────────

// ① Mock 資料庫
//    key   = 觸發關鍵字陣列（只要訊息包含任一個就命中）
//    value = 要回傳的假回答（支援 Markdown）
const MOCK_DB = [
  {
    keywords: ['大阪', 'osaka'],
    answer: `## 大阪必玩景點 🏯

**道頓堀**
霓虹招牌、章魚燒、大阪燒聚集地，晚上最熱鬧，記得找「Glico 跑跑人」拍照。

**通天閣 × 新世界**
昭和懷舊風情，串炸發源地，一串大約 ¥100–200，炸完一定要沾醬。

**大阪城公園**
春天賞櫻首選，免費入園，天守閣票 ¥600。

**環球影城 USJ**
哈利波特、超級任天堂世界，建議提前搶 Express Pass。

> 💡 建議搭乘 **Osaka Amazing Pass**（1 日 ¥2,800），可無限搭乘地鐵＋免費進入 40+ 景點。`,
  },
  {
    keywords: ['京都', 'kyoto'],
    answer: `## 京都必玩景點 ⛩️

**伏見稻荷大社**
千本鳥居隧道，免費參觀，清晨或傍晚人少光線美，爬上山頂約 2 小時。

**嵐山 × 竹林小徑**
早上 7 點前人潮最少，渡月橋旁有小船出租 ¥1,500/30 分鐘。

**金閣寺**
黃金閣倒映在鏡湖池，票 ¥500，附贈御守一張。

**祇園花見小路**
石板路兩側是百年茶屋，傍晚有機會巧遇藝妓，請勿擋路拍照。

> 💡 京都巴士一日券 ¥700，可無限搭 100、101、102 號等熱門觀光路線。`,
  },
  {
    keywords: ['神戶', 'kobe'],
    answer: `## 神戶必玩景點 ⚓

**北野異人館街**
明治時代外國人留下的洋式建築群，薔薇館、風見雞館最熱門，票 ¥500–700。

**神戶港 × 美利堅公園**
神戶地標「BE KOBE」白色字母裝置，夜景配六甲山倒影絕美。

**有馬溫泉**
日本三大古湯之一，金泉（含鐵褐色溫泉）免費足湯就在街邊，日歸入浴約 ¥650。

**南京町（中華街）**
關西最大中華街，烤豬包、杏仁豆腐邊走邊吃，平日人潮較少。

> 💡 從大阪難波搭阪神電車到神戶三宮約 40 分鐘，票價 ¥330，比新幹線划算。`,
  },
];

// ② Mock 比對函式
//    回傳第一個命中的答案字串，無命中則回傳 null
function findMockAnswer(message) {
  const lower = message.toLowerCase();
  for (const { keywords, answer } of MOCK_DB) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return answer;
    }
  }
  return null;
}

// ③ 主 Handler
export default async function handler(req, res) {
  // 只接受 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '請提供 message 字串' });
  }

  // ── 步驟 1：先查 Mock 層 ──────────────────────
  const mockAnswer = findMockAnswer(message);
  if (mockAnswer) {
    console.log('[Mock] 命中關鍵字，回傳預設答案');
    // 模擬 Gemini 回傳格式，前端不需要改任何 parsing 邏輯
    return res.status(200).json({
      _source: 'mock',                          // 方便 debug 用，正式上線可移除
      candidates: [
        {
          content: {
            parts: [{ text: mockAnswer }],
          },
        },
      ],
    });
  }

  // ── 步驟 2：Mock 沒命中 → 呼叫真實 Gemini API ─
  console.log('[Gemini] 呼叫真實 API');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY 未設定' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({ geminiError: data.error ?? data });
    }

    return res.status(200).json({ _source: 'gemini', ...data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
