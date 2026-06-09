document.addEventListener('DOMContentLoaded', () => {

    // ── 自動插入聊天對話框 ──
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

            // 顯示 Gemini 錯誤細節（除錯用）
            if (data.geminiError) {
                responseDiv.innerText = "Gemini 錯誤：" + JSON.stringify(data.geminiError);
                return;
            }
            if (data.error) {
                responseDiv.innerText = "錯誤：" + data.error;
                return;
            }

            if (data.candidates && data.candidates[0].content) {
                responseDiv.innerText = data.candidates[0].content.parts[0].text;
            } else {
                responseDiv.innerText = "回傳格式異常：" + JSON.stringify(data);
            }
        } catch (error) {
            responseDiv.innerText = "Fetch 失敗：" + error.message;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
