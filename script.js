// 確保 DOM 載入後才執行
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn') || document.querySelector('[onclick="sendMessage()"]');
    const inputField = document.getElementById('user-input');
    const responseDiv = document.getElementById('ai-response');

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

    // 將 sendMessage 掛到 window 供 onclick 屬性使用
    window.sendMessage = sendMessage;

    // 支援按下 Enter 發送
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});