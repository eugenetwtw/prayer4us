// 獲取API金鑰
let apiKey = '';
let currentLanguage = '';

// Counter API path - adjusted for actual deployment structure
const counterApiPath = '/api/counter';

// Flag to disable counter functionality if the endpoint is not available
let counterFunctionalityDisabled = false;

// 檢測用戶瀏覽器語言並設置合適的語言
function detectUserLanguage() {
    // 只有當用戶還沒有設置語言偏好時才自動檢測
    if (localStorage.getItem('preferredLanguage')) {
        return;
    }
    
    const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko'];
    let browserLang = navigator.language || navigator.userLanguage || '';
    browserLang = browserLang.toLowerCase();
    
    // 首先檢查完全匹配
    if (supportedLanguages.includes(browserLang)) {
        localStorage.setItem('preferredLanguage', browserLang);
        return;
    }
    
    // 檢查語言代碼前綴匹配
    const langPrefix = browserLang.split('-')[0];
    
    // 中文特殊處理：檢查是否為簡體中文區域
    if (langPrefix === 'zh') {
        // zh-CN, zh-SG 為簡體中文區域
        if (browserLang.includes('cn') || browserLang.includes('sg')) {
            localStorage.setItem('preferredLanguage', 'zh-Hans');
        } else {
            // zh-TW, zh-HK, zh-MO 等為繁體中文區域
            localStorage.setItem('preferredLanguage', 'zh-Hant');
        }
        return;
    }
    
    // 其他語言的前綴匹配
    switch (langPrefix) {
        case 'en':
            localStorage.setItem('preferredLanguage', 'en');
            break;
        case 'ja':
            localStorage.setItem('preferredLanguage', 'ja');
            break;
        case 'ko':
            localStorage.setItem('preferredLanguage', 'ko');
            break;
        default:
            // 默認使用繁體中文
            localStorage.setItem('preferredLanguage', 'zh-Hant');
    }
}

// 記錄訪問
async function recordVisit(language) {
    // 如果功能已被禁用，則直接返回
    if (counterFunctionalityDisabled) {
        console.log('計數器功能已被禁用，跳過訪問記錄');
        return;
    }

    try {
        // 打印 API URL 以便調試
        const apiUrl = `${window.location.origin}${counterApiPath}`; // Use counterApiPath directly
        console.log('正在記錄訪問，API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'visit',
                language: language
            })
        });
        
        if (!response.ok) {
            console.warn(`無法記錄訪問，狀態碼: ${response.status}`);
            
            // 嘗試讀取錯誤詳情
            try {
                const errorData = await response.json();
                console.warn('錯誤詳情:', errorData);
            } catch (e) {
                // 可能無法解析為 JSON
                console.warn('無法解析錯誤回應');
            }
        } else {
            console.log('成功記錄訪問');
        }
    } catch (error) {
        console.warn('記錄訪問時出錯:', error);
        
        // 如果在本地開發中遇到 404 錯誤，可能是 API 尚未準備好
        if (error.message && error.message.includes('404')) {
            console.info('提示: 在本地開發中，請確保 Next.js API 路由正確設置並運行。');
        }
    }
}

// 記錄音頻生成
async function recordAudioGeneration(language) {
    // 如果功能已被禁用，則直接返回
    if (counterFunctionalityDisabled) {
        console.log('計數器功能已被禁用，跳過音頻生成記錄');
        return;
    }

    console.log(`[recordAudioGeneration] Attempting to record audio generation for language: ${language}`); // Added log
    try {
        // 打印 API URL 以便調試
        const apiUrl = `${window.location.origin}${counterApiPath}`; // Use counterApiPath directly
        console.log('[recordAudioGeneration] Sending POST request to:', apiUrl); // Added log

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'audio',
                language: language
            })
        });
        
        console.log(`[recordAudioGeneration] Received response status: ${response.status}`); // Added log
        if (!response.ok) {
            console.warn(`[recordAudioGeneration] Failed to record audio generation. Status: ${response.status}`); // Modified log
            
            // 嘗試讀取錯誤詳情
            try {
                const errorData = await response.json();
                console.warn('[recordAudioGeneration] Error details:', errorData); // Modified log
            } catch (e) {
                // 可能無法解析為 JSON
                console.warn('[recordAudioGeneration] Could not parse error response.'); // Modified log
            }
        } else {
            const responseData = await response.json(); // Added log
            console.log('[recordAudioGeneration] Successfully recorded audio generation. Response data:', responseData); // Modified log
        }
    } catch (error) {
        console.error('[recordAudioGeneration] Error during fetch:', error); // Modified log
        
        // 檢查是否為404錯誤，在本地開發中提供更有用的訊息
        if (error.message && error.message.includes('404')) {
            console.info('提示: 在本地開發中，請確保 Next.js API 路由正確設置並運行，或已部署到 Vercel 。');
        }
    }
}

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
    
    // 檢測並設置用戶語言
    detectUserLanguage();
    
    // 獲取當前語言
    currentLanguage = getCurrentLanguage();
}

let emotionHistory = []; // 用於記錄情緒列表歷史
let usedEmotions = new Set(); // 記錄已使用過的情緒
let otherSituationClickCount = 0; // 追蹤「我有其他狀況」按鈕點擊次數

// 初始化獲取首頁情緒
async function initEmotions() {
    await loadApiKey();
    
    // 創建語言選擇器
    createLanguageSelector();
    
    // 記錄訪問
    await recordVisit(currentLanguage);
    
    // 獲取情緒列表
    const promptByLang = {
        'zh-Hant': '首次訪問，請推薦5個常見的情緒狀態',
        'zh-Hans': '首次访问，请推荐5个常见的情绪状态',
        'en': 'First visit, please recommend 5 common emotional states',
        'ja': '初回訪問、一般的な感情状態を5つ推薦してください',
        'ko': '첫 방문, 일반적인 감정 상태 5가지를 추천해 주세요'
    };
    
    const prompt = promptByLang[currentLanguage] || promptByLang['zh-Hant'];
    const firstEmotions = await generateEmotions(prompt);
    emotionHistory.push(firstEmotions);
    createEmotionButtons(firstEmotions);
}

// 創建語言選擇器
function createLanguageSelector() {
    // 檢查是否已經存在語言選擇器
    if (document.getElementById('languageSelector')) return;
    
    // 創建語言選擇容器
    const langContainer = document.createElement('div');
    langContainer.id = 'languageContainer';
    langContainer.style.position = 'absolute';
    langContainer.style.top = '10px';
    langContainer.style.right = '10px';
    
    // 創建語言選擇標籤
    const langLabel = document.createElement('span');
    langLabel.textContent = t('languageSelector') + ': ';
    langLabel.style.marginRight = '5px';
    
    // 創建語言選擇下拉框
    const langSelector = document.createElement('select');
    langSelector.id = 'languageSelector';
    langSelector.style.padding = '5px';
    langSelector.style.borderRadius = '5px';
    
    // 添加語言選項
    const languages = [
        { code: 'zh-Hant', name: '繁體中文' },
        { code: 'zh-Hans', name: '简体中文' },
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' }
    ];
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        option.selected = currentLanguage === lang.code;
        langSelector.appendChild(option);
    });
    
    // 添加語言切換事件
    langSelector.addEventListener('change', function() {
        const newLanguage = this.value;
        setCurrentLanguage(newLanguage);
        // 記錄新語言的訪問
        recordVisit(newLanguage);
        // 重新加載情緒按鈕
        resetEmotionSelection();
    });
    
    // 組裝語言選擇器
    langContainer.appendChild(langLabel);
    langContainer.appendChild(langSelector);
    
    // 添加到頁面
    document.body.appendChild(langContainer);
}

// 用API生成情緒列表
async function generateEmotions(context) {
    if (!apiKey) {
        console.warn('API金鑰未設置，使用備用情緒列表');
        
        // 根據語言返回不同的備用情緒列表
        const fallbackEmotions = {
            'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', t('otherSituation')],
            'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', t('otherSituation')],
            'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', t('otherSituation')],
            'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', t('otherSituation')],
            'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', t('otherSituation')]
        };
        
        return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
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
                    content: `根據以下情境提供5個${currentLanguage === 'en' ? '英文' : currentLanguage === 'ja' ? '日文' : currentLanguage === 'ko' ? '韓文' : '中文'}情緒狀態(不要編號)，最後加「${t('otherSituation')}」，用空格分隔：
                    情境：${context}
                    範例輸出：${currentLanguage === 'en' ? 'Anxiety Sadness Loneliness Stress Joy ' + t('otherSituation') : 
                              currentLanguage === 'ja' ? '不安 悲しみ 孤独 ストレス 喜び ' + t('otherSituation') : 
                              currentLanguage === 'ko' ? '불안 슬픔 외로움 스트레스 기쁨 ' + t('otherSituation') : 
                              '焦慮 悲傷 孤獨 壓力 喜樂 ' + t('otherSituation')}`
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
        
        return newEmotions.slice(0, 5).concat(t('otherSituation'));
    } catch (error) {
        console.error('獲取情緒列表失敗:', error);
        // 根據語言返回不同的備用情緒列表
        const fallbackEmotions = {
            'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', t('otherSituation')],
            'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', t('otherSituation')],
            'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', t('otherSituation')],
            'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', t('otherSituation')],
            'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', t('otherSituation')]
        };
        
        return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
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
            if (emotion === t('otherSituation') || 
               emotion === '我有其他狀況' || 
               emotion === '我有其他状况' || 
               emotion === 'I have another situation' ||
               emotion === '他の状況があります' ||
               emotion === '다른 상황이 있어요') {
                loadMoreEmotions();
            } else {
                getEmotionalVerse(emotion);
            }
        };
        if (emotion === t('otherSituation') || 
           emotion === '我有其他狀況' || 
           emotion === '我有其他状况' || 
           emotion === 'I have another situation' ||
           emotion === '他の状況があります' ||
           emotion === '다른 상황이 있어요') {
            btn.style.backgroundColor = '#2196F3';
        }
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
        
        document.getElementById('mainEmotions').innerHTML = t('loadingEmotions');
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
    label.textContent = t('customEmotionLabel');
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
    submitBtn.textContent = t('submitButton');
    submitBtn.style.backgroundColor = '#2196F3';
    submitBtn.onclick = submitCustomEmotion;
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = t('resetButton');
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

// 使用AI一次性選擇最適合情緒的語音和語音指令
async function getVoiceAndInstructions(emotion, prayerText = '') {
    try {
        if (!apiKey) {
            console.warn('API金鑰未設置，使用默認語音Alloy');
            return { voice: 'alloy', instructions: '' };
        }
        
        // 定義給AI的內容，根據是否有禱告文調整提示
        let content = '';
        if (prayerText) {
            // 如果有禱告文，生成音色選擇和語音指令
            content = `基於用戶情緒「${emotion}」及以下禱告文，請執行兩項任務：

1. 從以下六個OpenAI TTS語音中選擇最適合的一個：
   - Alloy: 平衡的聲音，適合一般用途，提供清晰度和溫暖感
   - Echo: 更動態的聲音，可以為通知增添興奮感
   - Fable: 講故事的聲音，非常適合讀睡前故事或敘述內容
   - Onyx: 深沉且豐富的聲音，適合權威性指令
   - Nova: 明亮且歡快的聲音，適合友好的互動
   - Shimmer: 柔和且舒緩的聲音，適合平靜的環境

2. 為這段禱告文生成適合的TTS指令：
"""
${prayerText}
"""

請按照以下格式回答：

VOICE: [選擇的語音名稱，小寫]

INSTRUCTIONS:
Voice Affect: [聲音情感描述]
Tone: [語調描述]
Pacing: [速度描述]
Emotions: [情緒描述]
Pronunciation: [發音重點描述]
Pauses: [停頓描述]`;
        } else {
            // 如果沒有禱告文，只選擇音色
            content = `基於用戶的情緒「${emotion}」，請從以下六個OpenAI TTS語音中選擇最適合的一個:
Alloy: 平衡的聲音，適合一般用途，提供清晰度和溫暖感
Echo: 更動態的聲音，可以為通知增添興奮感
Fable: 講故事的聲音，非常適合讀睡前故事或敘述內容
Onyx: 深沉且豐富的聲音，適合權威性指令
Nova: 明亮且歡快的聲音，適合友好的互動
Shimmer: 柔和且舒緩的聲音，適合平靜的環境

請按照以下格式回答：
VOICE: [選擇的語音名稱，小寫]`;
        }
        
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
                    content: content
                }],
                max_tokens: prayerText ? 350 : 20,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.choices?.[0]?.message?.content) {
            throw new Error('Invalid API response structure');
        }

        // 解析回應
        const responseText = data.choices[0].message.content.trim();
        
        // 提取語音名稱
        const voiceMatch = responseText.match(/VOICE:\s*(\w+)/i);
        let voice = 'alloy'; // 默認值
        
        if (voiceMatch && voiceMatch[1]) {
            const extractedVoice = voiceMatch[1].toLowerCase().trim();
            // 確保回傳的是有效的語音選項
            const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
            if (validVoices.includes(extractedVoice)) {
                voice = extractedVoice;
            } else {
                console.warn('API返回了無效的語音名稱:', extractedVoice);
            }
        }
        
        // 提取指令（如果有）
        let instructions = '';
        if (prayerText) {
            const instructionsMatch = responseText.match(/INSTRUCTIONS:\s*([\s\S]+)/i);
            if (instructionsMatch && instructionsMatch[1]) {
                instructions = instructionsMatch[1].trim();
            }
        }
        
        return { voice, instructions };
    } catch (error) {
        console.error('獲取語音建議及指令失敗:', error);
        return { voice: 'alloy', instructions: '' }; // 出錯時使用默認語音
    }
}

// 修改後的獲取經文函數
// 倒數計時器變數
let countdownInterval = null;
let countdownSeconds = 0;

async function getEmotionalVerse(emotion) {
    if (!apiKey) {
        document.getElementById('verse').innerHTML = t('apiKeyNotSet');
        return;
    }
    
    // 初始時先設置默認語音，稍後會根據禱告文內容再做選擇
    let voiceData = { voice: 'alloy', instructions: '' };
    
    try {
        const verseElement = document.getElementById('verse');
        
        // 開始倒數計時
        countdownSeconds = 0;
        verseElement.innerHTML = `${t('loadingVerse')} <span id="countdown-timer">(0)</span>`;
        verseElement.classList.add('loading-verse');
        
        // 設置倒數計時器
        clearInterval(countdownInterval); // 清除之前的計時器
        countdownInterval = setInterval(() => {
            countdownSeconds++;
            const timerElement = document.getElementById('countdown-timer');
            if (timerElement) {
                timerElement.textContent = `(${countdownSeconds})`;
            }
        }, 1000);
        
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
                    1. 提供合適聖經經文(格式：『經文』書名 章:節)${currentLanguage === 'en' || currentLanguage === 'ja' || currentLanguage === 'ko' ? '只需' + (currentLanguage === 'en' ? '英文' : currentLanguage === 'ja' ? '日文' : '韓文') : '同時提出中英文'}
                    2. 簡明的解說，50字內，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
                    3. 禱告詞，100字以上，你是一個資深慈愛的牧師，同情用戶的狀態，深情地為用戶禱告，為用戶設身處地思考，祈求上帝給用戶安慰和力量，用華麗的辭藻，用詩歌般的語言，用最真摯的情感，寫出最感人的禱告詞，激發用戶的感受，讓靈性灌注與降臨，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
                    請用以下格式回應：
                    【${t('scripture').replace('：', '')}】{內容}
                    【${t('explanation').replace('：', '')}】{解說}
                    【${t('prayer').replace('：', '')}】{禱告詞}`
                }],
                max_tokens: 1000,
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
        
        // 使用多行匹配，根據當前語言調整匹配模式
        const scriptureKey = t('scripture').replace('：', '');
        const explanationKey = t('explanation').replace('：', '');
        const prayerKey = t('prayer').replace('：', '');
        
        const verseMatch = responseText.match(new RegExp(`【${scriptureKey}】([\\s\\S]+?)\\n【${explanationKey}】`));
        const comfortMatch = responseText.match(new RegExp(`【${explanationKey}】([\\s\\S]+?)\\n【${prayerKey}】`));
        const prayerMatch = responseText.match(new RegExp(`【${prayerKey}】([\\s\\S]+)`));

        if (verseMatch && comfortMatch && prayerMatch) {
            const formatText = (text) => text.replace(/\n/g, '<br>');
            const prayerText = prayerMatch[1].trim();
            
            // 根據情緒和禱告文選擇適合的聲音和生成指令
            try {
                voiceData = await getVoiceAndInstructions(emotion, prayerText);
            } catch (error) {
                console.error('選擇語音時出錯，使用默認語音:', error);
            }
            
            const selectedVoice = voiceData.voice;
            const voiceInstructions = voiceData.instructions;
            
            // 清除倒數計時器
            clearInterval(countdownInterval);
            
            const verseElement = document.getElementById('verse');
            verseElement.classList.remove('loading-verse');
            verseElement.innerHTML = `
                <div style="text-align: left; max-width: 600px; margin: 20px auto;">
                    <h3 style="color: #2c3e50;">${t('verseForEmotion', { emotion })}</h3>
                    <p style="font-size: 1.1em;">
                        <strong>${t('scripture')}</strong><br>
                        ${formatText(verseMatch[1].trim())}
                    </p>
                    <p style="color: #27ae60; margin-top: 20px;">
                        <strong>${t('explanation')}</strong><br>
                        ${formatText(comfortMatch[1].trim())}
                    </p>
                    <div id="audio-player" style="margin: 15px 0;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <button onclick="playPrayer('${encodeURIComponent(prayerText)}', '${encodeURIComponent(voiceInstructions)}')" id="play-button">
                                <span id="play-text">${t('playPrayer')}</span>
                                <span id="loading-spinner" style="display: none;">${t('generatingAudio')}</span>
                            </button>
                            <div style="margin-left: 15px; display: flex; align-items: center;">
                                <span id="voice-selector-label" style="margin-right: 5px;">${t('voiceSelector')}:</span>
                                <select id="voice-selector" style="padding: 5px; border-radius: 5px;">
                                    <option value="alloy" ${selectedVoice === 'alloy' ? 'selected' : ''}>${t('alloy')}</option>
                                    <option value="echo" ${selectedVoice === 'echo' ? 'selected' : ''}>${t('echo')}</option>
                                    <option value="fable" ${selectedVoice === 'fable' ? 'selected' : ''}>${t('fable')}</option>
                                    <option value="onyx" ${selectedVoice === 'onyx' ? 'selected' : ''}>${t('onyx')}</option>
                                    <option value="nova" ${selectedVoice === 'nova' ? 'selected' : ''}>${t('nova')}</option>
                                    <option value="shimmer" ${selectedVoice === 'shimmer' ? 'selected' : ''}>${t('shimmer')}</option>
                                </select>
                            </div>
                        </div>
                        <audio id="prayer-audio" controls style="display: none; margin-top: 10px; width: 100%;"></audio>
                    </div>
                    <p style="color: #2980b9; margin-top: 20px; line-height: 1.6;">
                        <strong>${t('prayer')}</strong><br>
                        ${formatText(prayerText)}
                    </p>
                </div>
            `;
        } else {
            // 清除倒數計時器
            clearInterval(countdownInterval);
            
            const verseElement = document.getElementById('verse');
            verseElement.classList.remove('loading-verse');
            verseElement.innerHTML = `${t('parseError')}<br>${responseText}`;
        }
    } catch (error) {
        console.error('錯誤：', error);
        // 清除倒數計時器
        clearInterval(countdownInterval);
        
        const verseElement = document.getElementById('verse');
        verseElement.classList.remove('loading-verse');
        verseElement.innerHTML = t('errorGettingVerse');
    }
}

// 修改playPrayer函數
async function playPrayer(encodedText, encodedInstructions = '') {
    if (!apiKey) {
        alert(t('apiKeyNotSetAudio'));
        return;
    }
    
    const button = document.getElementById('play-button');
    const spinner = document.getElementById('loading-spinner');
    const playText = document.getElementById('play-text');
    const voiceSelector = document.getElementById('voice-selector');
    const selectedVoice = voiceSelector ? voiceSelector.value : 'alloy';
    
    // 記錄音頻生成事件
    await recordAudioGeneration(currentLanguage);
    
    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';
        
        const text = decodeURIComponent(encodedText);
        const instructions = encodedInstructions ? decodeURIComponent(encodedInstructions) : '';
        
        // 準備API請求體
        const requestBody = {
            model: "gpt-4o-mini-tts",
            voice: selectedVoice,
            input: text,
            response_format: "mp3"
        };
        
        // 如果有語音指令，添加到請求中
        if (instructions) {
            requestBody.instructions = instructions;
        }
        
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg'
            },
            body: JSON.stringify(requestBody)
        });

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
        const audioElement = document.getElementById('prayer-audio');
        audioElement.src = audioUrl;
        audioElement.style.display = 'block';
        audioElement.play();
    } catch (error) {
        console.error('播放失敗:', error);
        alert(t('audioPlayError'));
    } finally {
        button.disabled = false;
        playText.style.display = 'inline';
        spinner.style.display = 'none';
    }
} // Add missing closing brace for playPrayer function

// 檢查API端點是否可用，如果不可用，則禁用計數器功能
async function checkCounterEndpoint() {
    // 如果功能已被禁用，則不再進行檢查
    if (counterFunctionalityDisabled) return;

    try {
        console.log(`檢查 API 路徑: ${counterApiPath}`);
        const apiUrl = `${window.location.origin}${counterApiPath}`;
        const response = await fetch(apiUrl, { method: 'GET' });

        if (response.ok) {
            console.log(`計數器 API 可用: ${counterApiPath}`);
            counterFunctionalityDisabled = false; // Ensure it's enabled if check passes
        } else {
            console.warn(`計數器 API 路徑不可用，狀態碼: ${response.status}`);
            console.warn('禁用計數器功能');
            counterFunctionalityDisabled = true;
        }
    } catch (error) {
        console.warn(`檢查計數器 API 時出錯: ${error.message}`);
        console.warn('禁用計數器功能');
        counterFunctionalityDisabled = true;
    }
}

// 初始化
window.onload = async function() {
    // 先檢查計數器API是否可用
    await checkCounterEndpoint();
    // 初始化情緒按鈕
    await initEmotions();
};
