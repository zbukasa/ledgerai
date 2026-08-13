
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Transaction, ParsedTransaction, VoiceCommand } from '../types';
import { useCategories } from '../contexts/CategoryContext';
import { useNotification } from '../contexts/NotificationContext';
import { encode } from '../services/audioService';
import { useLanguage } from '../contexts/LanguageContext';
import { aiService } from '../services/apiService';
import { useCurrency } from '../contexts/CurrencyContext';

type RecordingState = 'idle' | 'connecting' | 'recording' | 'processing' | 'confirming' | 'error';

export const useVoiceProcessor = () => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcription, setTranscription] = useState('');
    const [intent, setIntent] = useState<VoiceCommand | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { categories, findCategoryByName, subCategories } = useCategories();
    const { allCurrencies } = useCurrency();
    const { addToast } = useNotification();
    const { t, language } = useLanguage();

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const transcriptionRef = useRef('');
    const isProcessingOrDoneRef = useRef(false);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Stop the microphone hardware and release the audio context. Safe to call repeatedly.
    const releaseMedia = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
    }, []);

    // Ensure the mic is released if the component using this hook unmounts mid-session.
    useEffect(() => releaseMedia, [releaseMedia]);

    const processIntent = useCallback((name: string, args: any) => {
        if (isProcessingOrDoneRef.current) return;
        isProcessingOrDoneRef.current = true;
        setRecordingState('processing');

        try {
            switch (name) {
                case 'createTransaction':
                    const parsed = args as unknown as ParsedTransaction;
                    const foundCategory = findCategoryByName(parsed.category) || findCategoryByName('Other');
                    const categoryId = foundCategory!.id;
                    let subCategoryId: string | undefined = undefined;
                    if (parsed.subCategory) {
                        const foundSub = subCategories.find(sc => sc.categoryId === categoryId && sc.name.toLowerCase() === parsed.subCategory?.toLowerCase());
                        if (foundSub) subCategoryId = foundSub.id;
                    }
                    setIntent({
                        type: 'create',
                        data: {
                            type: parsed.transactionType,
                            amount: parsed.amount,
                            currency: parsed.currency,
                            date: new Date(),
                            item: parsed.item,
                            quantity: parsed.quantity,
                            categoryId: categoryId,
                            subCategoryId: subCategoryId,
                            kilometers: parsed.kilometers,
                            usageType: parsed.usageType
                        }
                    });
                    break;
                case 'editTransaction':
                    setIntent({ type: 'edit', data: args as any });
                    break;
                case 'applyFilter':
                    setIntent({ type: 'filter', data: args as any });
                    break;
                case 'tripTracking':
                    setIntent({ type: 'trip', data: args as any });
                    break;
                case 'changeCurrency':
                    setIntent({ type: 'currency', data: args as any });
                    break;
                case 'changeLanguage':
                    setIntent({ type: 'language', data: args as any });
                    break;
                case 'trackProduction':
                    setIntent({ type: 'production', data: args as any });
                    break;
                case 'recordSale':
                    setIntent({ type: 'sale', data: args as any });
                    break;
                case 'recordUsage':
                    setIntent({ type: 'usage', data: args as any });
                    break;
                case 'adjustStock':
                    setIntent({ type: 'stock_adjust', data: args as any });
                    break;
                default:
                    throw new Error(`Unknown function call: ${name}`);
            }
            setRecordingState('confirming');
        } catch (e) {
            console.error('Error processing intent:', e);
            setError(t('voiceEntry.couldNotUnderstand'));
            setRecordingState('error');
        }
    }, [findCategoryByName, subCategories, t]);

    const stopRecording = useCallback(() => {
        if(sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(() => {});
            sessionPromiseRef.current = null;
        }
        releaseMedia();
    }, [releaseMedia]);

    const startRecording = useCallback(async () => {
        if (recordingState === 'recording') return;
        transcriptionRef.current = '';
        isProcessingOrDoneRef.current = false;
        setTranscription('');
        setIntent(null);
        setError(null);
        setRecordingState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            // Fetch a short-lived ephemeral token from our server; the long-lived Gemini key
            // never reaches the client. This call also meters voice usage server-side.
            const { token } = await aiService.liveToken();
            const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;

            const categoryNames = categories.map(c => c.name);
            const languageMap: { [key: string]: string } = { en: 'English', fr: 'French', ln: 'Lingala', sw: 'Swahili', es: 'Spanish', pt: 'Portuguese' };
            const selectedLanguageName = languageMap[language] || 'English';

            const tools = [
                {
                    functionDeclarations: [
                        {
                            name: 'createTransaction',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Create a new financial transaction.',
                                properties: {
                                    transactionType: { type: Type.STRING, enum: ['income', 'expense'], description: "The type of transaction." },
                                    amount: { type: Type.NUMBER, description: 'The numeric total amount.' },
                                    currency: { type: Type.STRING, enum: allCurrencies, description: 'The currency code.' },
                                    item: { type: Type.STRING, description: "A concise description of the item or service." },
                                    quantity: { type: Type.STRING, description: "The quantity of the item (e.g., '5 bags', '2 workers')." },
                                    category: { type: Type.STRING, enum: categoryNames, description: 'The financial category.' },
                                    subCategory: { type: Type.STRING, description: 'A more specific sub-category.' },
                                    kilometers: { type: Type.NUMBER, description: "Odometer reading in KM (for fuel expenses)." },
                                    usageType: { type: Type.STRING, enum: ['business', 'personal', 'none'], description: "Usage type." }
                                },
                                required: ['transactionType', 'amount', 'currency', 'item', 'category']
                            }
                        },
                        {
                            name: 'editTransaction',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Edit an existing transaction.',
                                properties: {
                                    target: { type: Type.STRING, enum: ['last'], description: "Which transaction to edit." },
                                    updates: {
                                        type: Type.OBJECT,
                                        properties: {
                                            amount: { type: Type.NUMBER },
                                            currency: { type: Type.STRING, enum: allCurrencies },
                                            item: { type: Type.STRING },
                                            category: { type: Type.STRING, enum: categoryNames },
                                            usageType: { type: Type.STRING, enum: ['business', 'personal', 'none'] }
                                        }
                                    }
                                },
                                required: ['target']
                            }
                        },
                        {
                            name: 'applyFilter',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Filter and view transactions or calculate totals.',
                                properties: {
                                    transactionType: { type: Type.STRING, enum: ['income', 'expense'] },
                                    categoryName: { type: Type.STRING, enum: categoryNames },
                                    dateRange: { type: Type.STRING, enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month'] },
                                    calculateTotal: { type: Type.BOOLEAN }
                                },
                            }
                        },
                        {
                            name: 'tripTracking',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Start or stop tracking vehicle kilometers.',
                                properties: {
                                    action: { type: Type.STRING, enum: ['start', 'stop'] }
                                },
                                required: ['action']
                            }
                        },
                        {
                            name: 'changeCurrency',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Change the preferred currency of the application.',
                                properties: {
                                    currency: { type: Type.STRING, enum: allCurrencies, description: 'The new currency code to use.' }
                                },
                                required: ['currency']
                            }
                        },
                        {
                            name: 'changeLanguage',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Change the application display language.',
                                properties: {
                                    language: { type: Type.STRING, enum: ['en', 'fr', 'ln', 'sw', 'es', 'pt'], description: 'The new language code (en, fr, ln, sw, es, pt).' }
                                },
                                required: ['language']
                            }
                        },
                        {
                            name: 'trackProduction',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Record a new production batch of an inventory item.',
                                properties: {
                                    productType: { type: Type.STRING, description: 'The name/type of product produced (e.g., "23cm", "demi-block").' },
                                    quantity: { type: Type.NUMBER, description: 'Number of items produced.' },
                                    cementBags: { type: Type.NUMBER, description: 'Number of cement bags used (optional, mainly for blocks).' }
                                },
                                required: ['productType', 'quantity']
                            }
                        },
                        {
                            name: 'recordSale',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Record a sale of an inventory item and deduct from stock.',
                                properties: {
                                    productType: { type: Type.STRING, description: 'The name/type of product sold.' },
                                    quantity: { type: Type.NUMBER, description: 'Number of items sold.' },
                                    price: { type: Type.NUMBER, description: 'Price per unit (optional).' },
                                    currency: { type: Type.STRING, enum: allCurrencies, description: 'Currency code for the sale.' }
                                },
                                required: ['productType', 'quantity']
                            }
                        },
                        {
                            name: 'recordUsage',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Record internal usage of an inventory item (deducts from stock).',
                                properties: {
                                    productType: { type: Type.STRING, description: 'The name/type of product used.' },
                                    quantity: { type: Type.NUMBER, description: 'Number of items used.' }
                                },
                                required: ['productType', 'quantity']
                            }
                        },
                        {
                            name: 'adjustStock',
                            parameters: {
                                type: Type.OBJECT,
                                description: 'Manually adjust the stock level of an inventory item.',
                                properties: {
                                    productType: { type: Type.STRING, description: 'The name/type of product.' },
                                    quantity: { type: Type.NUMBER, description: 'The new total quantity.' }
                                },
                                required: ['productType', 'quantity']
                            }
                        }
                    ]
                }
            ];

            const systemInstruction = `
                You are a high-performance voice assistant for a financial and inventory app in the DRC.
                The user is speaking ${selectedLanguageName}, but may mix in French, Lingala, Swahili, or English.
                
                Your goal is to accurately identify the user's financial or production intent and call the correct tool immediately.
                Be extremely precise with numbers, currencies, and categories.
                
                Categories: ${categories.map(c => c.name).join(', ')}.
                Currencies: ${allCurrencies.join(', ')}.
                
                If the user says something like "I spent 50 dollars on fuel", call createTransaction with amount=50, currency=USD, category=Fuel.
                If the user asks "how much did I spend today", call applyFilter with dateRange=today and calculateTotal=true.
                If the user says "change currency to Euro" or "use Euro", call changeCurrency with currency=EUR.
                If the user says "change language to French" or "switch to French", call changeLanguage with language=fr.
                If the user says "cambiar a español" or "switch to Spanish", call changeLanguage with language=es.
                If the user says "mudar para português" or "switch to Portuguese", call changeLanguage with language=pt.
                If the user says "Produced 560 blocks of 23cm on 12 bags", call trackProduction with productType="23cm", quantity=560, cementBags=12.
                If the user says "Produced 1000 units of gravel", call trackProduction with productType="gravel", quantity=1000.
                If the user says "Sold 400 blocks of 23cm at 1.5 dollars each", call recordSale with productType="23cm", quantity=400, price=1.5, currency=USD.
                If the user says "Used 50 blocks for the wall", call recordUsage with productType="23cm", quantity=50.
                If the user says "Set stock of 23cm blocks to 5000", call adjustStock with productType="23cm", quantity=5000.
                
                Respond ONLY by calling a tool. Do not provide verbal confirmation.
            `;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setRecordingState('recording');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(2048, 1, 1);
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            if (isProcessingOrDoneRef.current) return;
                            
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
                            }
                            
                            const bytes = new Uint8Array(pcmData.buffer);
                            sessionPromiseRef.current?.then((session) => {
                                if (isProcessingOrDoneRef.current) return;
                                session.sendRealtimeInput({ 
                                    media: { 
                                        data: encode(bytes), 
                                        mimeType: 'audio/pcm;rate=16000' 
                                    } 
                                });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        // Real-time transcription feedback
                        if (message.serverContent?.inputTranscription) {
                            const newText = message.serverContent.inputTranscription.text;
                            if (newText && newText !== transcriptionRef.current) {
                                transcriptionRef.current = newText;
                                setTranscription(newText);
                            }
                        }

                        // Direct tool call from audio model
                        const toolCall = message.toolCall;
                        if (toolCall?.functionCalls?.[0]) {
                            const call = toolCall.functionCalls[0];
                            processIntent(call.name || '', call.args);
                            stopRecording();
                        }

                        if(message.serverContent?.turnComplete && !isProcessingOrDoneRef.current) {
                            isProcessingOrDoneRef.current = true;
                            // If turn is complete but no tool was called, we might need to fallback or show error
                            if (!transcriptionRef.current.trim()) {
                                setError(t('voiceEntry.noSpeechDetected'));
                                setRecordingState('error');
                            } else {
                                // Fallback: the model didn't call a tool but we have a transcription
                                // This shouldn't happen often with good system instructions
                                setError(t('voiceEntry.couldNotUnderstand'));
                                setRecordingState('error');
                            }
                            stopRecording();
                        }
                    },
                    onerror: (e) => { 
                        console.error('Live API Error:', e); 
                        setError(t('voiceEntry.connectionError')); 
                        setRecordingState('error'); 
                        stopRecording();
                    },
                    onclose: () => {
                        releaseMedia();
                    }
                },
                config: {
                    inputAudioTranscription: {},
                    responseModalities: [Modality.AUDIO],
                    systemInstruction,
                    tools: tools as any
                }
            });

        } catch (err) {
            console.error('Error starting recording:', err);
            // Release the mic if we acquired it before failing, so it doesn't stay hot.
            releaseMedia();
            setError(t('voiceEntry.micAccessDenied'));
            setRecordingState('error');
            addToast(t('notifications.micAccessDenied'), "error");
        }
    }, [recordingState, processIntent, stopRecording, releaseMedia, addToast, t, language, categories, allCurrencies]);
    
    const handleRetry = useCallback(() => {
        setRecordingState('idle');
        setError(null);
        setTranscription('');
        setIntent(null);
    }, []);

    return {
        recordingState,
        transcription,
        intent,
        error,
        startRecording,
        stopRecording,
        handleRetry,
    };
};
