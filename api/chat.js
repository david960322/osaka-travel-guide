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
    keywords: ['東京', 'tokyo'],
    answer: `## 東京必玩景點 🗼

**淺草寺 × 仲見世通**
東京最古老寺廟，雷門大燈籠必拍，周邊和菓子、人形燒超好買。

**新宿御苑**
市區最大公園，春櫻秋楓皆美，外國人票 ¥500。

**渋谷 Scramble 交叉口**
全球最忙碌路口，Starbucks 2F 是俯拍最佳位置。

**築地場外市場**
清晨 5 點開始營業，新鮮海鮮丼飯從 ¥1,200 起。

> 💡 交通建議使用 **Suica / Pasmo** 儲值卡，幾乎可搭所有大眾運輸。`,
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
    keywords: ['美食', '吃', '推薦餐廳', '好吃'],
    answer: `## 日本旅遊必吃清單 🍜

| 品項 | 預算 | 備註 |
|------|------|------|
| 迴轉壽司（壽司郎/くら壽司） | ¥100–200/盤 | App 預約免排隊 |
| 一蘭拉麵 | ¥980 起 | 個人隔間，獨自用餐不尷尬 |
| 吉野家牛丼 | ¥430 起 | 24 小時，深夜救星 |
| 松屋定食 | ¥500–800 | 附味噌湯，CP 值高 |
| 便利商店飯糰 | ¥150 | 7-Eleven 鮭魚奶油最熱銷 |

> 🔑 想吃米其林卻怕貴？搜尋「**ビブグルマン**（必比登）」，性價比高的店都在這裡。`,
  },
  {
    keywords: ['交通', 'jr pass', '新幹線', '地鐵', '電車'],
    answer: `## 日本交通攻略 🚄

**JR Pass（外國旅客專用）**
- 7 日 ¥50,000 / 14 日 ¥80,000 / 21 日 ¥100,000
- 可無限搭新幹線（NOZOMI、MIZUHO 除外）
- 適合移動城市 3 個以上才划算

**IC 卡（Suica / ICOCA）**
- 全日本幾乎通用，自動計算最短路徑票價
- Apple Pay / Google Pay 可直接加值，不用買實體卡

**城市地鐵一日券**
- 東京：¥600（Metro 版）
- 大阪：¥800（含地鐵＋巴士）
- 京都：巴士一日券 ¥700

> ⚠️ 新幹線月台「自由席（自由座）」不需劃位，但假日容易站票，建議提前用 App 劃位。`,
  },
  {
    keywords: ['住宿', '飯店', '旅館', '民宿', 'airbnb'],
    answer: `## 日本住宿選擇指南 🏨

**膠囊旅館（Capsule Hotel）**
預算 ¥2,000–4,000/晚，適合單人背包客，九州、難波周邊最多。

**商務旅館（Business Hotel）**
東橫 Inn、APA Hotel 等，¥6,000–10,000/晚，含早餐方案 CP 值高。

**傳統旅館（Ryokan）**
含晚餐＋早餐 ¥15,000–30,000/人，有溫泉湯屋，穿浴衣體驗日式文化。

**民宿 × Airbnb**
日本法規較嚴，需確認「住宅宿泊事業法」登錄號，避免訂到違法物件。

> 💡 **Booking.com** 標示「免費取消」房型，可先卡位再比價，機票確認後再決定。`,
  },
  {
    keywords: ['預算', '費用', '花多少錢', '便宜'],
    answer: `## 日本旅遊預算參考 💴

### 每日花費估算（東京為例）

| 項目 | 省錢方案 | 舒適方案 |
|------|---------|---------|
| 住宿 | ¥2,500（膠囊） | ¥9,000（商務旅館） |
| 三餐 | ¥1,500（便利商店+吉野家） | ¥4,000（拉麵+定食+咖啡） |
| 交通 | ¥500（一日券） | ¥1,500（隨走隨搭） |
| 景點 | ¥0（免費景點為主） | ¥2,000（博物館/主題樂園） |
| **合計** | **約 ¥4,500 / 天** | **約 ¥16,500 / 天** |

> 匯率參考：¥100 ≈ 台幣 22 元（請依出發前實際匯率換算）`,
  },
  {
    keywords: ['台灣', '台北', '高雄', '台中', '花蓮'],
    answer: `## 台灣旅遊快速指南 🇹🇼

**台北**：故宮博物院、九份老街、士林夜市、陽明山國家公園

**台中**：彩虹眷村、逢甲夜市、高美濕地夕陽、宮原眼科冰淇淋

**高雄**：駁二藝術特區、旗津海岸、六合夜市、佛光山

**花蓮**：太魯閣國家公園、七星潭、東大門夜市

> 🚄 高鐵單程台北↔高雄約 96 分鐘，票價 NT$1,490，提前在 App 訂位享早鳥優惠。`,
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
