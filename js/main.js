// 檢查API配置
let apiConfigured = false;
let currentLanguage = '';

// 檢查API配置
async function checkApiConfiguration() {
    try {
        // 使用 env-config.js 中的 checkApiConfig 函數
        apiConfigured = await window.checkApiConfig();
        if (!apiConfigured) {
            console.error('API金鑰未配置');
        } else {
            console.log('API金鑰已配置');
        }
    } catch (error) {
        console.error('無法檢查API配置:', error);
        apiConfigured = false; // 設置為 false，將使用備用情緒列表
    }
    
    // 獲取當前語言
    currentLanguage = getCurrentLanguage();
}

let emotionHistory = []; // 用於記錄情緒列表歷史
let usedEmotions = new Set(); // 記錄已使用過的情緒
let otherSituationClickCount = 0; // 追蹤「我有其他狀況」按鈕點擊次數

// 初始化獲取首頁情緒
async function initEmotions() {
    await checkApiConfiguration();
    
    // 創建語言選擇器
    createLanguageSelector();
    
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
        setCurrentLanguage(this.value);
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
    if (!apiConfigured) {
        console.warn('API金鑰未配置，使用備用情緒列表');
        
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
        console.log('使用服務器API生成情緒列表');
        
        // 準備請求數據
        const requestData = {
            context: context,
            currentLanguage: currentLanguage,
            otherSituation: t('otherSituation')
        };
        
        console.log('發送請求到服務器API...');
        
        // 使用服務器端API而不是直接調用OpenAI
        const response = await fetch(`${window.location.origin}/api/emotions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API錯誤:', response.status, errorText);
            throw new Error(`API錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.emotions || !Array.isArray(data.emotions)) {
            throw new Error('無效的API響應結構');
        }

        // 過濾已使用過的情緒
        const newEmotions = data.emotions.filter(e => !usedEmotions.has(e));
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

// 修改後的獲取經文函數
async function getEmotionalVerse(emotion) {
    if (!apiConfigured) {
        document.getElementById('verse').innerHTML = t('apiKeyNotSet');
        return;
    }
    
    try {
        const verseContainer = document.getElementById('verse');
        verseContainer.innerHTML = t('loadingVerse');
        verseContainer.classList.add('loading-verse');
        
        console.log('使用服務器API獲取經文');
        
        // 準備請求數據
        const requestData = {
            emotion: emotion,
            currentLanguage: currentLanguage,
            scriptureKey: t('scripture').replace('：', ''),
            explanationKey: t('explanation').replace('：', ''),
            prayerKey: t('prayer').replace('：', '')
        };
        
        console.log('發送請求到服務器API獲取經文...');
        
        // 使用服務器端API而不是直接調用OpenAI
        const response = await fetch(`${window.location.origin}/api/verses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API錯誤:', response.status, errorText);
            throw new Error(`API錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.scripture || !data?.explanation || !data?.prayer) {
            throw new Error('無效的API響應結構');
        }

        const formatText = (text) => text.replace(/\n/g, '<br>');
        const prayerText = data.prayer.trim();
        
        const verseElement = document.getElementById('verse');
        verseElement.classList.remove('loading-verse');
        verseElement.innerHTML = `
            <div style="text-align: left; max-width: 600px; margin: 20px auto;">
                <h3 style="color: #2c3e50;">${t('verseForEmotion', { emotion })}</h3>
                <p style="font-size: 1.1em;">
                    <strong>${t('scripture')}</strong><br>
                    ${formatText(data.scripture.trim())}
                </p>
                <p style="color: #27ae60; margin-top: 20px;">
                    <strong>${t('explanation')}</strong><br>
                    ${formatText(data.explanation.trim())}
                </p>
                <div id="audio-player" style="margin: 15px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <button onclick="playPrayer('${encodeURIComponent(prayerText)}')" id="play-button">
                            <span id="play-text">${t('playPrayer')}</span>
                            <span id="loading-spinner" style="display: none;">${t('generatingAudio')}</span>
                        </button>
                        <div style="margin-left: 15px; display: flex; align-items: center;">
                            <span id="voice-selector-label" style="margin-right: 5px;">${t('voiceSelector')}:</span>
                            <select id="voice-selector" style="padding: 5px; border-radius: 5px;">
                                <option value="alloy">${t('alloy')}</option>
                                <option value="echo">${t('echo')}</option>
                                <option value="fable">${t('fable')}</option>
                                <option value="onyx">${t('onyx')}</option>
                                <option value="nova">${t('nova')}</option>
                                <option value="shimmer">${t('shimmer')}</option>
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
    } catch (error) {
        console.error('錯誤：', error);
        const verseElement = document.getElementById('verse');
        verseElement.classList.remove('loading-verse');
        verseElement.innerHTML = t('errorGettingVerse');
    }
}

// 修改playPrayer函數
async function playPrayer(encodedText) {
    if (!apiConfigured) {
        alert(t('apiKeyNotSetAudio'));
        return;
    }
    
    const button = document.getElementById('play-button');
    const spinner = document.getElementById('loading-spinner');
    const playText = document.getElementById('play-text');
    const voiceSelector = document.getElementById('voice-selector');
    const selectedVoice = voiceSelector ? voiceSelector.value : 'alloy';
    
    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';
        
        const text = decodeURIComponent(encodedText);
        
        console.log('使用服務器API生成音頻');
        console.log('使用語音模型:', selectedVoice);
        
        // 準備請求數據
        const requestData = {
            text: text,
            voice: selectedVoice
        };
        
        console.log('發送請求到服務器API生成音頻...');
        
        // 使用服務器端API而不是直接調用OpenAI
        // 注意：這裡我們直接獲取音頻數據，而不是JSON
        const response = await fetch(`${window.location.origin}/api/audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('音頻生成錯誤:', response.status, errorText);
            throw new Error(`音頻生成錯誤: ${response.status}`);
        }

        // 獲取音頻數據並創建URL
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
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
}

// 初始化按鈕
window.onload = initEmotions;
