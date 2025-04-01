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
    // 臨時解決方案：始終使用備用情緒列表
    console.log('使用備用情緒列表');
    
    // 根據語言返回不同的備用情緒列表
    const fallbackEmotions = {
        'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', t('otherSituation')],
        'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', t('otherSituation')],
        'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', t('otherSituation')],
        'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', t('otherSituation')],
        'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', t('otherSituation')]
    };
    
    return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
    
    /* 原始代碼，暫時注釋掉
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
    */
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
    // 顯示加載中
    const verseContainer = document.getElementById('verse');
    verseContainer.innerHTML = t('loadingVerse');
    verseContainer.classList.add('loading-verse');
    
    // 延遲一下，模擬加載過程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 使用備用經文
    const formatText = (text) => text.replace(/\n/g, '<br>');
    
    // 根據語言和情緒選擇不同的備用經文
    let scripture, explanation, prayer;
    
    if (currentLanguage === 'en') {
        scripture = "\"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.\" Philippians 4:6-7";
        explanation = "God invites us to bring our worries to Him through prayer, promising a peace that defies human understanding.";
        prayer = "Heavenly Father, I come before You with the weight of my emotions. You see my heart and know my struggles. Grant me Your perfect peace that surpasses all understanding. Help me to trust in Your timing and Your plan. Fill me with Your strength when I am weak, and remind me of Your constant presence. Thank You for Your unfailing love and care. In Jesus' name, Amen.";
    } else if (currentLanguage === 'zh-Hans') {
        scripture = "「应当一无挂虑，只要凡事借着祷告、祈求和感谢，将你们所要的告诉神。神所赐出人意外的平安，必在基督耶稣里，保守你们的心怀意念。」腓立比书 4:6-7";
        explanation = "神邀请我们通过祷告将忧虑带到祂面前，应许赐下超越人类理解的平安。";
        prayer = "天父，我带着我的情绪重担来到你面前。你看透我的心，知道我的挣扎。求你赐给我那超越理解的完美平安。帮助我信靠你的时间和计划。当我软弱时，用你的力量充满我，提醒我你始终与我同在。感谢你不变的爱和关怀。奉耶稣的名祷告，阿们。";
    } else if (currentLanguage === 'ja') {
        scripture = "「何も思い煩わないで、あらゆる場合に、感謝をもってささげる祈りと願いによって、あなたがたの願い事を神に知っていただきなさい。そうすれば、人のすべての考えにまさる神の平安が、あなたがたの心と思いをキリスト・イエスにあって守ってくれます。」ピリピ人への手紙 4:6-7";
        explanation = "神様は私たちが祈りを通して心配事を持ってくるよう招いておられ、人間の理解を超える平安を約束されています。";
        prayer = "天の父よ、私は感情の重荷を抱えてあなたの前に来ました。あなたは私の心をご覧になり、私の苦しみをご存知です。すべての理解を超えるあなたの完全な平安を与えてください。あなたのタイミングとご計画を信頼できるよう助けてください。私が弱い時、あなたの力で満たし、あなたの絶え間ない存在を思い出させてください。あなたの変わらぬ愛と配慮に感謝します。イエスの御名によって、アーメン。";
    } else if (currentLanguage === 'ko') {
        scripture = "\"아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라. 그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라.\" 빌립보서 4:6-7";
        explanation = "하나님은 우리가 기도를 통해 걱정을 그분께 가져오도록 초대하시며, 인간의 이해를 초월하는 평안을 약속하십니다.";
        prayer = "하늘에 계신 아버지, 저는 제 감정의 무게를 안고 당신 앞에 섭니다. 당신은 제 마음을 보시고 제 고통을 아십니다. 모든 이해를 초월하는 당신의 완전한 평안을 저에게 허락하소서. 당신의 때와 계획을 신뢰할 수 있도록 도와주소서. 제가 약할 때 당신의 힘으로 채워주시고, 당신의 지속적인 존재를 상기시켜 주소서. 당신의 변함없는 사랑과 돌봄에 감사드립니다. 예수님의 이름으로 기도합니다, 아멘.";
    } else {
        scripture = "「應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。神所賜出人意外的平安，必在基督耶穌裡，保守你們的心懷意念。」腓立比書 4:6-7";
        explanation = "神邀請我們透過禱告將憂慮帶到祂面前，應許賜下超越人類理解的平安。";
        prayer = "天父，我帶著我的情緒重擔來到你面前。你看透我的心，知道我的掙扎。求你賜給我那超越理解的完美平安。幫助我信靠你的時間和計劃。當我軟弱時，用你的力量充滿我，提醒我你始終與我同在。感謝你不變的愛和關懷。奉耶穌的名禱告，阿們。";
    }
    
    const prayerText = prayer;
    
    const verseElement = document.getElementById('verse');
    verseElement.classList.remove('loading-verse');
    verseElement.innerHTML = `
        <div style="text-align: left; max-width: 600px; margin: 20px auto;">
            <h3 style="color: #2c3e50;">${t('verseForEmotion', { emotion })}</h3>
            <p style="font-size: 1.1em;">
                <strong>${t('scripture')}</strong><br>
                ${formatText(scripture)}
            </p>
            <p style="color: #27ae60; margin-top: 20px;">
                <strong>${t('explanation')}</strong><br>
                ${formatText(explanation)}
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
    
    /* 原始代碼，暫時注釋掉
    if (!apiConfigured) {
        document.getElementById('verse').innerHTML = t('loadingVerse');
        document.getElementById('verse').classList.add('loading-verse');
        setTimeout(() => {
            document.getElementById('verse').innerHTML = t('errorGettingVerse');
            document.getElementById('verse').classList.remove('loading-verse');
        }, 1000);
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
    */
}

// 修改playPrayer函數
async function playPrayer(encodedText) {
    const button = document.getElementById('play-button');
    const spinner = document.getElementById('loading-spinner');
    const playText = document.getElementById('play-text');
    const voiceSelector = document.getElementById('voice-selector');
    const selectedVoice = voiceSelector ? voiceSelector.value : 'alloy';
    
    try {
        button.disabled = true;
        playText.style.display = 'none';
        spinner.style.display = 'inline';
        
        // 模擬加載過程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 顯示提示訊息
        alert(t('audioPlayError') + ' (暫時無法使用音頻功能)');
        
    } catch (error) {
        console.error('播放失敗:', error);
        alert(t('audioPlayError'));
    } finally {
        button.disabled = false;
        playText.style.display = 'inline';
        spinner.style.display = 'none';
    }
    
    /* 原始代碼，暫時注釋掉
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
    */
}

// 初始化按鈕
window.onload = initEmotions;
