async function sendMessage() {
  const inputField = document.getElementById('user-input');
  const responseDiv = document.getElementById('ai-response');
  const input = inputField.value;

  if (!input) return; // 沒輸入字就不執行

  // 顯示正在載入
  responseDiv.innerText = "思考中...";
  
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });
    
    const data = await res.json();
    
    // 顯示 AI 回覆
    if (data.candidates && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        responseDiv.innerText = text;
    } else {
        responseDiv.innerText = "抱歉，AI 暫時無法回答，請稍後再試。";
        console.error("API 回傳結構錯誤:", data); // 在開發者工具看詳細錯誤
    }
  } catch (error) {
    responseDiv.innerText = "抱歉，系統暫時無法回應，請稍後再試。";
  }
  
  inputField.value = ""; // 清空輸入框
}