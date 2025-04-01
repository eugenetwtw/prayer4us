import { useState, useEffect, useRef } from 'react';
import Head from 'next/head'; // For setting page title and meta tags

// Translations (integrated directly for simplicity)
const translations = {
    // ... (translations object from js/translations.js) ...
    // Traditional Chinese (Default)
    'zh-Hant': {
        title: '我陪您禱告',
        backButton: '↩ 上一個情緒列表',
        loadingEmotions: '⏳ 正在尋找更多情緒...',
        customEmotionLabel: '請描述您目前的困難狀況：',
        submitButton: '提交',
        resetButton: '重新選擇情緒',
        otherSituation: '我有其他狀況',
        loadingVerse: '⏳ 正在尋找合適的經文...',
        verseForEmotion: '📖 給正在經歷「{emotion}」的你：',
        scripture: '經文：',
        explanation: '說明：',
        prayer: '禱告詞：',
        playPrayer: '▶ 播放禱告詞',
        generatingAudio: '⏳ 生成音頻中...',
        voiceSelector: '選擇聲音',
        alloy: 'Alloy (平衡)',
        echo: 'Echo (深沉)',
        fable: 'Fable (溫暖)',
        onyx: 'Onyx (強勁)',
        nova: 'Nova (友善)',
        shimmer: 'Shimmer (明亮)',
        apiKeyNotSet: '❌ API金鑰未設置，無法獲取經文',
        errorGettingVerse: '❌ 獲取經文時出錯，請稍後再試',
        audioPlayError: '無法播放音頻，請稍後再試',
        parseError: '⚠️ 未能解析回應，以下是原始內容：',
        apiKeyNotSetAudio: 'API金鑰未設置，無法播放音頻',
        languageSelector: '語言Language'
    },
    // Simplified Chinese
    'zh-Hans': {
        title: '我陪您祷告',
        backButton: '↩ 上一个情绪列表',
        loadingEmotions: '⏳ 正在寻找更多情绪...',
        customEmotionLabel: '请描述您目前的困难状况：',
        submitButton: '提交',
        resetButton: '重新选择情绪',
        otherSituation: '我有其他状况',
        loadingVerse: '⏳ 正在寻找合适的经文...',
        verseForEmotion: '📖 给正在经历「{emotion}」的你：',
        scripture: '经文：',
        explanation: '说明：',
        prayer: '祷告词：',
        playPrayer: '▶ 播放祷告词',
        generatingAudio: '⏳ 生成音频中...',
        voiceSelector: '选择声音',
        alloy: 'Alloy (平衡)',
        echo: 'Echo (深沉)',
        fable: 'Fable (温暖)',
        onyx: 'Onyx (强劲)',
        nova: 'Nova (友善)',
        shimmer: 'Shimmer (明亮)',
        apiKeyNotSet: '❌ API密钥未设置，无法获取经文',
        errorGettingVerse: '❌ 获取经文时出错，请稍后再试',
        audioPlayError: '无法播放音频，请稍后再试',
        parseError: '⚠️ 未能解析响应，以下是原始内容：',
        apiKeyNotSetAudio: 'API密钥未设置，无法播放音频',
        languageSelector: '语言Language'
    },
    // English
    'en': {
        title: 'I Pray With You',
        backButton: '↩ Previous Emotions',
        loadingEmotions: '⏳ Finding more emotions...',
        customEmotionLabel: 'Please describe your current situation:',
        submitButton: 'Submit',
        resetButton: 'Reset Emotion Selection',
        otherSituation: 'I have another situation',
        loadingVerse: '⏳ Finding appropriate scripture...',
        verseForEmotion: '📖 For those experiencing "{emotion}":',
        scripture: 'Scripture:',
        explanation: 'Explanation:',
        prayer: 'Prayer:',
        playPrayer: '▶ Play Prayer',
        generatingAudio: '⏳ Generating audio...',
        voiceSelector: 'Select Voice',
        alloy: 'Alloy (Balanced)',
        echo: 'Echo (Deep)',
        fable: 'Fable (Warm)',
        onyx: 'Onyx (Strong)',
        nova: 'Nova (Friendly)',
        shimmer: 'Shimmer (Bright)',
        apiKeyNotSet: '❌ API key not set, cannot retrieve scripture',
        errorGettingVerse: '❌ Error getting scripture, please try again later',
        audioPlayError: 'Cannot play audio, please try again later',
        parseError: '⚠️ Could not parse response, here is the original content:',
        apiKeyNotSetAudio: 'API key not set, cannot play audio',
        languageSelector: 'Language语言'
    },
    // Japanese
    'ja': {
        title: '一緒に祈りましょう',
        backButton: '↩ 前の感情リスト',
        loadingEmotions: '⏳ 感情を探しています...',
        customEmotionLabel: '現在の状況を説明してください：',
        submitButton: '送信',
        resetButton: '感情選択をリセット',
        otherSituation: '他の状況があります',
        loadingVerse: '⏳ 適切な聖書の言葉を探しています...',
        verseForEmotion: '📖 「{emotion}」を経験している方へ：',
        scripture: '聖書：',
        explanation: '説明：',
        prayer: '祈り：',
        playPrayer: '▶ 祈りを再生',
        generatingAudio: '⏳ 音声を生成中...',
        voiceSelector: '音声を選択',
        alloy: 'Alloy (バランス)',
        echo: 'Echo (深い)',
        fable: 'Fable (温かい)',
        onyx: 'Onyx (力強い)',
        nova: 'Nova (親しみやすい)',
        shimmer: 'Shimmer (明るい)',
        apiKeyNotSet: '❌ APIキーが設定されていません、聖書の言葉を取得できません',
        errorGettingVerse: '❌ 聖書の言葉の取得中にエラーが発生しました、後でもう一度お試しください',
        audioPlayError: '音声を再生できません、後でもう一度お試しください',
        parseError: '⚠️ 応答を解析できませんでした、以下は元のコンテンツです：',
        apiKeyNotSetAudio: 'APIキーが設定されていません、音声を再生できません',
        languageSelector: '言語Language'
    },
    // Korean
    'ko': {
        title: '함께 기도해요',
        backButton: '↩ 이전 감정 목록',
        loadingEmotions: '⏳ 감정을 찾는 중...',
        customEmotionLabel: '현재 상황을 설명해 주세요:',
        submitButton: '제출',
        resetButton: '감정 선택 초기화',
        otherSituation: '다른 상황이 있어요',
        loadingVerse: '⏳ 적절한 성경 구절을 찾는 중...',
        verseForEmotion: '📖 "{emotion}"을(를) 경험하고 있는 당신에게:',
        scripture: '성경 구절:',
        explanation: '설명:',
        prayer: '기도:',
        playPrayer: '▶ 기도 재생',
        generatingAudio: '⏳ 오디오 생성 중...',
        voiceSelector: '음성 선택',
        alloy: 'Alloy (균형)',
        echo: 'Echo (깊은)',
        fable: 'Fable (따뜻한)',
        onyx: 'Onyx (강한)',
        nova: 'Nova (친근한)',
        shimmer: 'Shimmer (밝은)',
        apiKeyNotSet: '❌ API 키가 설정되지 않았습니다. 성경 구절을 가져올 수 없습니다',
        errorGettingVerse: '❌ 성경 구절을 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요',
        audioPlayError: '오디오를 재생할 수 없습니다. 나중에 다시 시도해 주세요',
        parseError: '⚠️ 응답을 분석할 수 없습니다. 다음은 원본 내용입니다:',
        apiKeyNotSetAudio: 'API 키가 설정되지 않았습니다. 오디오를 재생할 수 없습니다',
        languageSelector: '언어Language'
    }
};

export default function Home() {
    const [currentLanguage, setCurrentLanguageState] = useState('zh-Hant');
    const [emotionHistory, setEmotionHistory] = useState([]);
    const [currentEmotions, setCurrentEmotions] = useState([]);
    const [usedEmotions, setUsedEmotions] = useState(new Set());
    const [otherSituationClickCount, setOtherSituationClickCount] = useState(0);
    const [verseContent, setVerseContent] = useState('');
    const [isLoadingEmotions, setIsLoadingEmotions] = useState(false);
    const [isLoadingVerse, setIsLoadingVerse] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customEmotionInput, setCustomEmotionInput] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

    const audioRef = useRef(null); // Ref for the audio element

    // Translation helper function
    const t = (key, replacements = {}) => {
        const lang = currentLanguage;
        const text = translations[lang]?.[key] || translations['zh-Hant']?.[key] || key;
        return Object.keys(replacements).reduce((str, placeholder) => {
            return str.replace(`{${placeholder}}`, replacements[placeholder]);
        }, text);
    };

    // Language handling
    useEffect(() => {
        const savedLang = localStorage.getItem('preferredLanguage') || 'zh-Hant';
        setCurrentLanguageState(savedLang);
    }, []);

    const handleLanguageChange = (event) => {
        const newLang = event.target.value;
        localStorage.setItem('preferredLanguage', newLang);
        setCurrentLanguageState(newLang);
        resetEmotionSelection(); // Reset when language changes
    };

    // Initial emotion loading
    useEffect(() => {
        if (currentLanguage) {
            initEmotions();
        }
    }, [currentLanguage]); // Re-run if language changes

    // --- Core Logic Functions (adapted for React) ---

    const initEmotions = async () => {
        setIsLoadingEmotions(true);
        setVerseContent('');
        setAudioUrl(null);
        setShowCustomInput(false);
        setOtherSituationClickCount(0);
        setUsedEmotions(new Set()); // Reset used emotions

        const promptByLang = {
            'zh-Hant': '首次訪問，請推薦5個常見的情緒狀態',
            'zh-Hans': '首次访问，请推荐5个常见的情绪状态',
            'en': 'First visit, please recommend 5 common emotional states',
            'ja': '初回訪問、一般的な感情状態を5つ推薦してください',
            'ko': '첫 방문, 일반적인 감정 상태 5가지를 추천해 주세요'
        };
        const prompt = promptByLang[currentLanguage] || promptByLang['zh-Hant'];
        const firstEmotions = await generateEmotions(prompt);
        setEmotionHistory([firstEmotions]);
        setCurrentEmotions(firstEmotions);
        setIsLoadingEmotions(false);
    };

    const generateEmotions = async (context) => {
        try {
            const response = await fetch(`/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Action': 'chat'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
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
                const errorData = await response.json();
                console.error("Proxy API Error (generateEmotions):", errorData);
                throw new Error(`Proxy API error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            if (!data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid API response structure');
            }

            const emotions = data.choices[0].message.content.split(' ').filter(e => e.trim() !== ''); // Filter empty strings

            // Filter out already used emotions, update used set
            const newUsedEmotions = new Set(usedEmotions);
            const uniqueNewEmotions = emotions.filter(e => !newUsedEmotions.has(e));
            uniqueNewEmotions.forEach(e => newUsedEmotions.add(e));
            setUsedEmotions(newUsedEmotions);

            let finalEmotions = uniqueNewEmotions.slice(0, 5);
            // Ensure 'otherSituation' is always present and last
            if (finalEmotions.includes(t('otherSituation'))) {
                finalEmotions = finalEmotions.filter(e => e !== t('otherSituation'));
            }
            finalEmotions = finalEmotions.slice(0, 5); // Ensure max 5 before adding 'other'
            finalEmotions.push(t('otherSituation'));

            return finalEmotions;

        } catch (error) {
            console.error("Error generating emotions:", error);
            // Fallback
            const fallbackEmotions = {
                'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', t('otherSituation')],
                'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', t('otherSituation')],
                'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', t('otherSituation')],
                'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', t('otherSituation')],
                'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', t('otherSituation')]
            };
            return fallbackEmotions[currentLanguage] || fallbackEmotions['zh-Hant'];
        }
    };

    const loadMoreEmotions = async () => {
        const newClickCount = otherSituationClickCount + 1;
        setOtherSituationClickCount(newClickCount);

        if (newClickCount >= 3) {
            setShowCustomInput(true);
            setCurrentEmotions([]); // Clear buttons
            return;
        }

        setIsLoadingEmotions(true);
        setCurrentEmotions([]); // Clear buttons while loading
        const newEmotions = await generateEmotions('需要不同於之前的情緒狀態');
        setEmotionHistory(prev => [...prev, newEmotions]);
        setCurrentEmotions(newEmotions);
        setIsLoadingEmotions(false);
    };

    const showPreviousEmotions = () => {
        if (emotionHistory.length > 1) {
            const newHistory = emotionHistory.slice(0, -1);
            setEmotionHistory(newHistory);
            setCurrentEmotions(newHistory[newHistory.length - 1]);
            setShowCustomInput(false); // Hide custom input if going back
            // Decrement click count unless we are back at the first list
            if (newHistory.length > 1) {
                 setOtherSituationClickCount(prev => Math.max(0, prev - 1));
            } else {
                 setOtherSituationClickCount(0); // Reset if back to initial list
            }
        }
    };

    const resetEmotionSelection = () => {
        initEmotions(); // Re-initialize everything
    };

    const submitCustomEmotion = () => {
        if (customEmotionInput.trim()) {
            getEmotionalVerse(customEmotionInput.trim());
        } else {
            alert('請輸入您的困難狀況'); // Consider using a less intrusive notification
        }
    };

    const getEmotionalVerse = async (emotion) => {
        setIsLoadingVerse(true);
        setVerseContent(''); // Clear previous verse
        setAudioUrl(null);    // Clear previous audio

        try {
            const response = await fetch(`/api/openai`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Action': 'chat'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `請針對「${emotion}」情緒：
                        1. 提供合適聖經經文，繁體中文時選用和合本的中譯聖經(格式：『經文』書名 章:節)${currentLanguage === 'en' || currentLanguage === 'ja' || currentLanguage === 'ko' ? '只需' + (currentLanguage === 'en' ? '英文' : currentLanguage === 'ja' ? '日文' : '韓文') : '同時提出中英文'}
                        2. 簡明的解說，50字內，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
                        3. 禱告詞，你是一個資深慈愛的牧師，同情用戶的狀態，深情地為用戶禱告，為用戶設身處地思考，祈求上帝給用戶安慰和力量，用華麗的辭藻，用詩歌般的語言，用最真摯的情感，寫出最感人的禱告詞，激發用戶的感受，讓靈性灌注與降臨，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
                        請用以下格式回應：
                        【${t('scripture').replace('：', '')}】{內容}
                        【${t('explanation').replace('：', '')}】{解說}
                        【${t('prayer').replace('：', '')}】{禱告詞}`
                    }],
                    max_tokens: 300, // Increased slightly for potentially longer prayers
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Proxy API Error (getEmotionalVerse):", errorData);
                throw new Error(`Proxy API error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            if (!data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid API response structure');
            }

            setVerseContent(data.choices[0].message.content.trim());

        } catch (error) {
            console.error("Error getting emotional verse:", error);
            setVerseContent(`error: ${t('errorGettingVerse')} - ${error.message}`);
        } finally {
            setIsLoadingVerse(false);
        }
    };

    const playPrayer = async (prayerText) => {
        if (!prayerText) return;
        setIsGeneratingAudio(true);
        setAudioUrl(null); // Clear previous audio

        try {
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Action': 'speech'
                },
                body: JSON.stringify({
                    model: "tts-1",
                    voice: selectedVoice,
                    input: prayerText,
                    response_format: "mp3"
                })
            });

            if (!response.ok) {
                let errorDetails = response.statusText;
                try {
                    // Try to parse JSON error first
                    const errorData = await response.json();
                    errorDetails = errorData.error || errorData.details || errorDetails;
                } catch (e) {
                    // If not JSON, try text
                    try {
                       errorDetails = await response.text();
                    } catch (e2) { /* Ignore */ }
                }
                console.error("Proxy API Error (Speech):", response.status, errorDetails);
                throw new Error(`Proxy API error! status: ${response.status} - ${errorDetails}`);
            }

            const audioBlob = await response.blob();
            const newAudioUrl = URL.createObjectURL(new Blob([audioBlob], { type: 'audio/mpeg' }));
            setAudioUrl(newAudioUrl);

        } catch (error) {
            console.error("Error playing prayer audio:", error);
            alert(t('audioPlayError') + `: ${error.message}`); // User feedback
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // Effect to play audio when URL changes
    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        // Cleanup function to revoke the object URL
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);


    // --- Render Logic ---

    const renderVerse = () => {
        if (isLoadingVerse) {
            return <p>{t('loadingVerse')}</p>;
        }
        if (!verseContent) {
            return null;
        }
        if (verseContent.startsWith('error:')) {
             return <p className="error-message">{verseContent.substring(7)}</p>
        }

        // Parse the structured response
        const scriptureKey = t('scripture').replace('：', '');
        const explanationKey = t('explanation').replace('：', '');
        const prayerKey = t('prayer').replace('：', '');

        const verseMatch = verseContent.match(new RegExp(`【${scriptureKey}】([\\s\\S]+?)\\n【${explanationKey}】`));
        const comfortMatch = verseContent.match(new RegExp(`【${explanationKey}】([\\s\\S]+?)\\n【${prayerKey}】`));
        const prayerMatch = verseContent.match(new RegExp(`【${prayerKey}】([\\s\\S]+)`));

        if (verseMatch && comfortMatch && prayerMatch) {
            const formatText = (text) => text.replace(/\n/g, '<br />'); // Use <br /> in React
            const scriptureText = verseMatch[1].trim();
            const explanationText = comfortMatch[1].trim();
            const prayerText = prayerMatch[1].trim();

            // Extract emotion from the original request context if possible, otherwise leave blank
            // This part is tricky as the original emotion isn't directly stored with verseContent
            // We might need to pass the emotion to this function or store it in state alongside verseContent
            const emotionPlaceholder = "..."; // Placeholder

            return (
                <div style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
                    <h3 style={{ color: '#2c3e50' }}>{t('verseForEmotion', { emotion: emotionPlaceholder })}</h3>
                    <p style={{ fontSize: '1.1em' }}>
                        <strong>{t('scripture')}</strong><br />
                        <span dangerouslySetInnerHTML={{ __html: formatText(scriptureText) }} />
                    </p>
                    <p style={{ color: '#27ae60', marginTop: '20px' }}>
                        <strong>{t('explanation')}</strong><br />
                        <span dangerouslySetInnerHTML={{ __html: formatText(explanationText) }} />
                    </p>
                    <div id="audio-player" style={{ margin: '15px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                            <button onClick={() => playPrayer(prayerText)} disabled={isGeneratingAudio}>
                                {isGeneratingAudio ? t('generatingAudio') : t('playPrayer')}
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '5px' }}>{t('voiceSelector')}:</span>
                                <select
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    style={{ padding: '5px', borderRadius: '5px' }}
                                    disabled={isGeneratingAudio}
                                >
                                    <option value="alloy">{t('alloy')}</option>
                                    <option value="echo">{t('echo')}</option>
                                    <option value="fable">{t('fable')}</option>
                                    <option value="onyx">{t('onyx')}</option>
                                    <option value="nova">{t('nova')}</option>
                                    <option value="shimmer">{t('shimmer')}</option>
                                </select>
                            </div>
                        </div>
                        {audioUrl && (
                            <audio ref={audioRef} controls src={audioUrl} style={{ marginTop: '10px', width: '100%' }} />
                        )}
                    </div>
                    <p style={{ color: '#2980b9', marginTop: '20px', lineHeight: '1.6' }}>
                        <strong>{t('prayer')}</strong><br />
                        <span dangerouslySetInnerHTML={{ __html: formatText(prayerText) }} />
                    </p>
                </div>
            );
        } else {
            // Fallback for unparsed content or errors during parsing
            return <p>{t('parseError')}<br /><span dangerouslySetInnerHTML={{ __html: verseContent.replace(/\n/g, '<br />') }} /></p>;
        }
    };


    return (
        <>
            <Head>
                <title>{t('title')}</title>
                <meta name="description" content="聖經經文情緒支持網站" />
                <link rel="icon" href="/favicon.ico" /> {/* Note: path might need adjustment */}
                 {/* We'll import styles globally or via CSS modules later */}
            </Head>

            {/* Language Selector */}
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span>{t('languageSelector')}: </span>
                <select value={currentLanguage} onChange={handleLanguageChange} style={{ padding: '5px', borderRadius: '5px' }}>
                    <option value="zh-Hant">繁體中文</option>
                    <option value="zh-Hans">简体中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                </select>
            </div>

            <main className="container"> {/* Use className for styling */}
                <h1>{t('title')}</h1>
                <div id="buttons">

                    {isLoadingEmotions && <p>{t('loadingEmotions')}</p>}

                    {!isLoadingEmotions && showCustomInput && (
                        <div style={{ margin: '20px auto', maxWidth: '500px' }}>
                            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>{t('customEmotionLabel')}</p>
                            <textarea
                                value={customEmotionInput}
                                onChange={(e) => setCustomEmotionInput(e.target.value)}
                                style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', fontFamily: 'inherit' }}
                            />
                            <button onClick={submitCustomEmotion} style={{ backgroundColor: '#2196F3', marginRight: '10px' }}>{t('submitButton')}</button>
                            <button onClick={resetEmotionSelection} style={{ backgroundColor: '#666' }}>{t('resetButton')}</button>
                        </div>
                    )}

                    {!isLoadingEmotions && !showCustomInput && currentEmotions.map(emotion => (
                        <button
                            key={emotion}
                            onClick={() => {
                                if (emotion === t('otherSituation')) {
                                    loadMoreEmotions();
                                } else {
                                    getEmotionalVerse(emotion);
                                }
                            }}
                            style={emotion === t('otherSituation') ? { backgroundColor: '#2196F3' } : {}}
                        >
                            {emotion}
                        </button>
                    ))}

                    {emotionHistory.length > 1 && (
                         <button onClick={showPreviousEmotions} style={{ backgroundColor: '#666', display: 'inline-block', marginTop: '10px' }}>
                             {t('backButton')}
                         </button>
                    )}

                    <div id="verse" style={{ marginTop: '30px' }}>
                        {renderVerse()}
                    </div>
                </div>
            </main>
        </>
    );
}
