// 獲取API金鑰
let apiKey = '';

// 從環境變數中獲取API金鑰
async function loadApiKey() {
    try {
        // 使用 env-config.js 中的 getApiKey 函數
        apiKey = await window.getApiKey();
        if (!apiKey) {
            console.error('API金鑰未設置');
            apiKey = ''; // 設置為空字符串，將使用備用情緒列表
        }
    } catch (error) {
        console.error('無法載入環境變數:', error);
        apiKey = ''; // 設置為空字符串，將使用備用情緒列表
    }
}

let emotionHistory = []; // 用於記錄情緒列表歷史
let usedEmotions = new Set(); // 記錄已使用過的情緒
let otherSituationClickCount = 0; // 追蹤「我有其他狀況」按鈕點擊次數

// 初始化獲取首頁情緒
async function initEmotions() {
    await loadApiKey();
    const firstEmotions = await generateEmotions('首次訪問，請推薦5個常見的情緒狀態');
    emotionHistory.push(firstEmotions);
    createEmotionButtons(firstEmotions);
}

// 用API生成情緒列表
async function generateEmotions(context) {
    if (!apiKey) {
        console.warn('API金鑰未設置，使用備用情緒列表');
        return ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', '我有其他狀況'];
    }
    
    try {
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: 'user',
                    content: `根據以下情境提供5個中文情緒狀態(不要編號)，最後加「我有其他狀況」，用空格分隔：
                    情境：${context}
                    範例輸出：焦慮 悲傷 孤獨 壓力 喜樂 我有其他狀況`
                }],
                max_tokens: 100,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response structure');
        }

        const emotions = data.choices[0].message.content.split(' ');
        
        // 過濾已使用過的情緒
        const newEmotions = emotions.filter(e => !usedEmotions.has(e));
        newEmotions.forEach(e => usedEmotions.add(e));
        
        return newEmotions.slice(0, 5).concat('我有其他狀況');
    } catch (error) {
        console.error('獲取情緒列表失敗:', error);
        return ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', '我有其他狀況'];
    }
}

// 創建動態按鈕
function createEmotionButtons(emotions) {
    const container = document.getElementById('mainEmotions');
    container.innerHTML = '';
    
    emotions.forEach(emotion => {
        const btn = document.createElement('button');
        btn.textContent = emotion;
        btn.onclick = () => {
            if (emotion === '我有其他狀況') {
                loadMoreEmotions();
            } else {
                getEmotionalVerse(emotion);
            }
        };
        if(emotion === '我有其他狀況') btn.style.backgroundColor = '#2196F3';
        container.appendChild(btn);
    });
}

// 加載更多情緒
async function loadMoreEmotions() {
    try {
        otherSituationClickCount++; // 增加點擊計數
        
        // 第三次點擊時顯示輸入框
        if (otherSituationClickCount >= 3) {
            showCustomEmotionInput();
            return;
        }
        
        document.getElementById('mainEmotions').innerHTML = '⏳ 正在尋找更多情緒...';
        const newEmotions = await generateEmotions('需要不同於之前的情緒狀態');
        emotionHistory.push(newEmotions);
        createEmotionButtons(newEmotions);
        document.getElementById('backButton').style.display = 'inline-block';
    } catch (error) {
        alert('無法加載更多情緒');
    }
}

// 顯示自定義情緒輸入框
function showCustomEmotionInput() {
    const container = document.getElementById('mainEmotions');
    container.innerHTML = '';
    
    // 創建輸入框
    const inputContainer = document.createElement('div');
    inputContainer.style.margin = '20px auto';
    inputContainer.style.maxWidth = '500px';
    
    const label = document.createElement('p');
    label.textContent = '請描述您目前的困難狀況：';
    label.style.marginBottom = '10px';
    label.style.fontWeight = 'bold';
    
    const textarea = document.createElement('textarea');
    textarea.id = 'customEmotionInput';
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.padding = '10px';
    textarea.style.borderRadius = '8px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.marginBottom = '15px';
    textarea.style.fontFamily = 'inherit';
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = '提交';
    submitBtn.style.backgroundColor = '#2196F3';
    submitBtn.onclick = submitCustomEmotion;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '重新選擇情緒';
    resetBtn.style.backgroundColor = '#666';
    resetBtn.onclick = resetEmotionSelection;
    
    inputContainer.appendChild(label);
    inputContainer.appendChild(textarea);
    inputContainer.appendChild(submitBtn);
    inputContainer.appendChild(resetBtn);
    
    container.appendChild(inputContainer);
}

// 提交自定義情緒
function submitCustomEmotion() {
    const customEmotion = document.getElementById('customEmotionInput').value.trim();
    if (customEmotion) {
        getEmotionalVerse(customEmotion);
    } else {
        alert('請輸入您的困難狀況');
    }
}

// 重置情緒選擇
function resetEmotionSelection() {
    otherSituationClickCount = 0; // 重置計數器
    initEmotions(); // 重新初始化情緒按鈕
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('verse').innerHTML = ''; // 清空經文區域
}

// 返回上一個情緒列表
function showPreviousEmotions() {
    if (emotionHistory.length > 1) {
        emotionHistory.pop(); // 移除當前列表
        const prevEmotions = emotionHistory[emotionHistory.length-1];
        createEmotionButtons(prevEmotions);
        
        // 如果返回到第一個情緒列表，重置計數器
        if (emotionHistory.length === 1) {
            otherSituationClickCount = 0;
        } else {
            // 否則減少計數器
            otherSituationClickCount--;
            if (otherSituationClickCount < 0) otherSituationClickCount = 0;
        }
    }
    if (emotionHistory.length === 1) {
        document.getElementById('backButton').style.display = 'none';
    }
}

// 修改後的獲取經文函數
async function getEmotionalVerse(emotion) {
    if (!apiKey) {
        document.getElementById('verse').innerHTML = '❌ API金鑰未設置，無法獲取經文';
        return;
    }
    
    try {
        document.getElementById('verse').innerHTML = '⏳ 正在尋找合適的經文...';
        
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ 
                    role: 'user',
                    content: `請針對「${emotion}」情緒：
                    1. 提供合適聖經經文(格式：『經文』書名 章:節)同時提出中英文
                    2. 簡明的解說，50字內
                    3. 禱告詞，你是一個資深慈愛的牧師，同情用戶的狀態，深情地為用戶禱告，為用戶設身處地思考，祈求上帝給用戶安慰和力量，用華麗的辭藻，用詩歌般的語言，用最真摯的情感，寫出最感人的禱告詞，激發用戶的感受，讓靈性灌注與降臨
                    請用以下格式回應：
                    【經文】{內容}
                    【說明】{解說}
                    【禱告】{禱告詞}`
                }],
                max_tokens: 300,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response structure');
        }

        const responseText = data.choices[0].message.content.trim();
        
        // 使用多行匹配
        const verseMatch = responseText.match(/【經文】([\s\S]+?)\n【說明】/);
        const comfortMatch = responseText.match(/【說明】([\s\S]+?)\n【禱告】/);
        const prayerMatch = responseText.match(/【禱告】([\s\S]+)/);

        if (verseMatch && comfortMatch && prayerMatch) {
            const formatText = (text) => text.replace(/\n/g, '<br>');
            const prayerText = prayerMatch[1].trim();
            
            document.getElementById('verse').innerHTML = `
                <div style="text-align: left; max-width: 600px; margin: 20px auto;">
                    <h3 style="color: #2c3e50;">📖 給正在經歷「${emotion}」的你：</h3>
                    <p style="font-size: 1.1em;">
                        <strong>經文：</strong><br>
                        ${formatText(verseMatch[1].trim())}
                    </p>
                    <p style="color: #27ae60; margin-top: 20px;">
                        <strong>說明：</strong><br>
                        ${formatText(comfortMatch[1].trim())}
                    </p>
                    <div id="audio-player" style="margin: 15px 0;">
                        <button onclick="playPrayer('${encodeURIComponent(prayerText)}')" id="play-button">
                            <span id="play-text">▶ 播放禱告詞</span>
                            <span id="loading-spinner" style="display: none;">⏳ 生成音頻中...</span>
                        </button>
                        <audio id="prayer-audio" controls style="display: none; margin-top: 10px; width: 100%;"></audio>
                    </div>
                    <p style="color: #2980b9; margin-top: 20px; line-height: 1.6;">
                        <strong>禱告詞：</strong><br>
                        ${formatText(prayerText)}
                    </p>
                </div>
            `;
        } else {
            document.getElementById('verse').innerHTML = '⚠️ 未能解析回應，以下是原始內容：<br>' + responseText;
        }
    } catch (error) {
        console.error('錯誤：', error);
        document.getElementById('verse').innerHTML = '❌ 獲取經文時出錯，請稍後再試';
    }
}

// 修改playPrayer函數
async function playPrayer(encodedText) {
    if (!apiKey) {
        alert('API金鑰未設置，無法播放音頻');
        return;
    }
    
    const button = document.getElementById('play-button');
    const spinner = document.getElementById('loading-spinner');
    const playText = document.getElementById('play-text');
    
    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';
        
        const text = decodeURIComponent(encodedText);
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: "sage",
                input: text,
                response_format: "mp3"
            })
        });

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
        const audioElement = document.getElementById('prayer-audio');
        audioElement.src = audioUrl;
        audioElement.style.display = 'block';
        audioElement.play();
    } catch (error) {
        console.error('播放失敗:', error);
        alert('無法播放音頻，請稍後再試');
    } finally {
        button.disabled = false;
        playText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// 初始化按鈕
window.onload = initEmotions;
