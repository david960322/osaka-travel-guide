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

    async function sendMessage() {
        const input = inputField.value;
        if (!input) return;

        responseDiv.innerText = "思考中...";
        inputField.value = "";

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            const data = await res.json();
            if (data.candidates && data.candidates[0].content) {
                responseDiv.innerText = data.candidates[0].content.parts[0].text;
            } else {
                responseDiv.innerText = "抱歉，AI 暫時無法回答。";
            }
        } catch (error) {
            responseDiv.innerText = "系統忙碌中，請稍後再試。";
        }
    }

    // 綁定按鈕點擊
    sendBtn.addEventListener('click', sendMessage);

    // 支援按下 Enter 發送
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});