// 確保 DOM 載入後才執行
document.addEventListener('DOMContentLoaded', () => {

    // ── 自動插入聊天對話框到每個頁面 ──
    const chatHTML = `
    <div class="chat-widget" id="chat-widget">
        <div id="chat-header">大阪旅遊 AI 助手</div>
        <div id="ai-response">你好！有什麼想問的嗎？</div>
        <div class="input-area">
            <input type="text" id="user-input" placeholder="問 AI 大阪旅遊...">
            <button id="send-btn">發送</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // ── 插入後才取得元素 ──
    const inputField = document.getElementById('user-input');
    const responseDiv = document.getElementById('ai-response');
    const sendBtn = document.getElementById('send-btn');

    // ── 假資料回應庫 ──
    const mockResponses = [
        {
            keywords: ["道頓堀", "dotonbori", "章魚燒", "霓虹", "運河"],
            answer: "🐙 道頓堀是大阪最熱鬧的美食街！建議傍晚6點後前往，霓虹燈全亮後超美。必吃：章魚燒（約¥600）、串炸（約¥1,200）。固力果跑者招牌是打卡首選，記得走到戎橋拍運河倒影！"
        },
        {
            keywords: ["大阪城", "osaka castle", "天守閣", "豐臣", "城堡"],
            answer: "🏯 大阪城天守閣門票¥1,000，持大阪周遊卡可免費入場！開放時間09:00-17:00。從地鐵谷町四丁目站走過去約15分鐘，建議穿舒適的鞋。春天賞櫻超美，4月初是最佳時機！"
        },
        {
            keywords: ["海遊館", "kaiyukan", "水族館", "鯨鯊", "魚"],
            answer: "🦈 大阪海遊館門票大人¥2,400，建議預留2.5小時。鎮館之寶是超大的鯨鯊！下午5點後進入夜間模式，燈光超浪漫、人也比較少。大阪地鐵中央線「大阪港站」下車走5分鐘即達。"
        },
        {
            keywords: ["梅田", "空中庭園", "umeda", "sky building", "夜景", "展望台"],
            answer: "🌌 梅田空中庭園門票¥2,000，開放到晚上22:30！強烈建議日落前30分鐘上去，能同時欣賞夕陽+夜景。露天平台的蓄光石夜晚會發光像銀河，超浪漫。從JR大阪站走過去約8分鐘。"
        },
        {
            keywords: ["心齋橋", "shinsaibashi", "購物", "逛街", "藥妝", "買"],
            answer: "🛍️ 心齋橋商店街全長600公尺，10:30-21:00營業。藥妝推薦：松本清、大國藥妝，消費滿¥5,000可退稅（記得帶護照）！逛完後往南走8分鐘就到道頓堀，完美接力行程！"
        },
        {
            keywords: ["黑門市場", "kuromon", "海鮮", "和牛", "市場", "吃"],
            answer: "🐟 黑門市場09:00-18:00，最建議10點前後去，食材最齊全！必吃：現烤大干貝、黑毛和牛鐵板燒、海膽。大阪地鐵「日本橋站」10號出口出來走2分鐘就到。週日部分店家會休息喔！"
        },
        {
            keywords: ["通天閣", "tsutenkaku", "新世界", "串炸", "昭和"],
            answer: "🗼 通天閣門票¥900，持周遊卡免費！推薦傍晚去，霓虹亮起後的昭和復古感超棒。一定要摸頂層的Billiken神像腳底帶來好運！周邊是串炸發源地，晚餐就在這解決吧。"
        },
        {
            keywords: ["環球影城", "usj", "任天堂", "哈利波特", "樂園", "universal"],
            answer: "🌏 USJ一日券約¥8,600起，建議事先網路購票。一定要買「快速通關券」，尤其任天堂世界超搶手！入園後先用APP搶瑪利歐賽車的整理券。搭JR夢咲線到「環球影城站」直達，從大阪站出發約15分鐘。"
        },
        {
            keywords: ["住吉大社", "sumiyoshi", "神社", "鳥居", "參拜"],
            answer: "⛩️ 住吉大社免費參觀，06:00-17:00開放。最特別的是搭乘阪堺路面電車去，叮叮噹噹很復古！朱紅色的反橋（太鼓橋）弧度超大，走過去有洗淨穢氣的意義。記得找「五大力石」集齊三顆祈願！"
        },
        {
            keywords: ["天王寺", "tennoji", "動物園", "獅子", "zoo"],
            answer: "🦁 天王寺動物園門票大人¥500，持周遊卡免費！09:30-17:00，週一休園。非洲草原區可以同時看到獅子和草食動物，混合展示設計很特別。逛完可以直接走到旁邊的天王寺公園草地野餐，超悠閒！"
        },
        {
            keywords: ["周遊卡", "交通", "地鐵", "電車", "JR", "ic card", "icoca"],
            answer: "🚃 大阪周遊卡強力推薦！1日券¥2,800，可免費進入大阪城、通天閣、天王寺動物園等多個景點，還包含地鐵無限搭乘，非常划算。另外辦一張ICOCA IC卡也方便，到處都能刷卡搭車。"
        },
        {
            keywords: ["住宿", "飯店", "hotel", "民宿", "難波", "梅田"],
            answer: "🏨 住宿推薦區域：①難波/心齋橋：購物美食最方便 ②梅田：交通樞紐，購物商場密集 ③新大阪：新幹線方便，前往京都奈良快速。預算抓每晚¥8,000-15,000（約台幣1,500-2,700元）可找到不錯的商務飯店。"
        },
        {
            keywords: ["天氣", "氣候", "幾月", "什麼時候", "季節", "最好"],
            answer: "☀️ 大阪旅遊最佳季節：春天3-4月（賞櫻）、秋天10-11月（楓葉涼爽）。夏天（7-8月）非常熱且濕，約35°C以上。冬天（12-2月）較冷約5-10°C但人少票便宜。梅雨季6月多雨，記得帶傘！"
        },
        {
            keywords: ["美食", "吃什麼", "推薦", "必吃", "食物", "料理"],
            answer: "🍜 大阪必吃清單：①章魚燒 ②串炸（不能重複沾醬！）③大阪燒 ④黑門市場海鮮 ⑤拉麵 ⑥河豚料理。道頓堀和黑門市場是美食最集中的地方。大阪人愛說「吃到倒（Kuidaore）」，就是形容這裡吃到破產的飲食文化！"
        },
        {
            keywords: ["預算", "費用", "多少錢", "花多少", "便宜", "省錢"],
            answer: "💰 大阪7天預算參考（不含機票）：住宿約¥70,000-120,000、餐飲¥25,000、交通¥7,000、景點¥10,000。善用「大阪周遊卡」可省很多門票錢。換匯建議在台灣先換好日幣，或到大阪市區的郵局ATM領，匯率較好。"
        },
        {
            keywords: ["機場", "關西機場", "kix", "怎麼去", "南海電鐵", "抵達"],
            answer: "✈️ 從關西機場進市區：①南海電鐵特急「Rapi:t」到難波，約38分鐘¥1,450，最快！②一般南海電車到難波，約50分鐘¥920，較省錢。③機場巴士到各大飯店門口，約¥1,600，適合行李多的旅客。"
        },
        {
            keywords: ["奈良", "京都", "神戶", "一日遊", "周邊", "附近"],
            answer: "🗺️ 大阪周邊一日遊推薦：①京都：搭JR約15分鐘¥570，伏見稻荷、清水寺必去 ②奈良：搭近鐵約35分鐘¥680，餵小鹿超療癒 ③神戶：搭阪神電車約30分鐘¥330，有名牛排和北野異人館。建議各安排一天！"
        }
    ];

    function getMockResponse(input) {
        const lowerInput = input.toLowerCase();
        for (const item of mockResponses) {
            if (item.keywords.some(kw => lowerInput.includes(kw))) {
                return item.answer;
            }
        }
        // 預設回應
        return "😊 感謝你的提問！大阪是個美食與文化並重的城市。你可以問我關於：道頓堀、大阪城、海遊館、梅田夜景、心齋橋購物、黑門市場、通天閣、USJ、住吉大社、天王寺動物園、交通方式、住宿推薦或旅遊預算等問題喔！";
    }

    async function sendMessage() {
        const input = inputField.value.trim();
        if (!input) return;

        responseDiv.innerText = "思考中...";
        inputField.value = "";

        // 模擬短暫延遲，讓體驗更自然
        await new Promise(resolve => setTimeout(resolve, 600));

        responseDiv.innerText = getMockResponse(input);
    }

    // 綁定按鈕點擊
    sendBtn.addEventListener('click', sendMessage);

    // 支援按下 Enter 發送
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
