import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  X,
  Bot,
  Settings,
  Lightbulb,
  Radio,
  CheckCircle2,
  Cpu,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Terminal,
  Server,
} from 'lucide-react';
import {
  processAiMessage,
  getOllamaHost,
  setOllamaHost,
  getOllamaModel,
  setOllamaModel,
  checkOllamaConnection,
  DEFAULT_OLLAMA_HOST,
  DEFAULT_OLLAMA_MODEL,
} from '../services/aiService';

export const AiAssistant = ({
  slots = [],
  systemStatus = [],
  activities = [],
  onSetLight,
  onSetSensor,
  darkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hostInput, setHostInput] = useState(getOllamaHost());
  const [modelInput, setModelInput] = useState(getOllamaModel());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [installedModels, setInstalledModels] = useState([]);
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `👋 **สวัสดีครับ! ผมคือ Smart Parking AI Assistant**\n\nผมพร้อมช่วยควบคุมอุปกรณ์ฮาร์ดแวร์ IoT ให้คุณ โดยทำงานบนคอมพิวเตอร์ของคุณเอง 100% ไม่ต้องต่อเน็ต:\n- 💡 **เปิด/ปิดไฟส่องสว่าง:** *"เปิดไฟช่อง 1"*, *"ปิดไฟทุกช่อง"*\n- 📡 **เปิด/ปิดเซนเซอร์ Ultrasonic:** *"ปิด Ultrasonic ช่อง 1"*, *"เปิด Ultrasonic ทั้งหมด"*\n- 🚗 **เช็คความว่าง:** *"มีที่จอดว่างไหม"*\n- 📋 **เช็คสถิติ & ประวัติ:** *"มีรถเข้ากี่คัน"*, *"ประวัติล่าสุด"*\n\nสามารถพิมพ์สั่งงานหรือกดปุ่มไมค์เพื่อสั่งด้วยเสียงได้เลยครับ!`,
      time: 'Just now',
      actions: [],
    },
  ]);

  // Check Ollama connection on mount
  useEffect(() => {
    checkOllamaConnection(getOllamaHost()).then((res) => {
      const hasModels = res.success && res.models && res.models.length > 0;
      setOllamaOnline(hasModels);
      if (hasModels) {
        setInstalledModels(res.models);
        const currentSaved = getOllamaModel();
        if (!res.models.includes(currentSaved)) {
          setModelInput(res.models[0]);
          setOllamaModel(res.models[0]);
        }
      }
    });
  }, []);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'th-TH';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Toggle Voice Input
  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับระบบสั่งการด้วยเสียง กรุณาใช้ Chrome หรือ Edge ครับ');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Dispatch action to app / hardware
  const handleExecuteAction = async ({ type, slotId, value }) => {
    if (type === 'light' && onSetLight) {
      await onSetLight(slotId, value);
    } else if (type === 'sensor' && onSetSensor) {
      await onSetSensor(slotId, value);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const userPrompt = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!userPrompt || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userPrompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await processAiMessage(
        userPrompt,
        { slots, systemStatus, activities },
        handleExecuteAction
      );

      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions || [],
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Error processing AI message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'เกิดข้อผิดพลาดในการประมวลผลคำสั่ง กรุณาลองใหม่อีกครั้งครับ',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Test Ollama connection
  const handleTestOllama = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await checkOllamaConnection(hostInput);
      setTestResult(result);
      const hasModels = result.success && result.models && result.models.length > 0;
      setOllamaOnline(hasModels);
      if (hasModels) {
        setInstalledModels(result.models);
        if (!result.models.includes(modelInput)) {
          setModelInput(result.models[0]);
          setOllamaModel(result.models[0]);
        }
      }
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      setOllamaOnline(false);
    } finally {
      setIsTesting(false);
    }
  };

  // Save Ollama settings
  const handleSaveSettings = () => {
    setOllamaHost(hostInput);
    setOllamaModel(modelInput);
    setShowSettings(false);
  };

  const quickPrompts = [
    { label: '💡 เปิดไฟช่อง 1', prompt: 'เปิดไฟช่อง 1' },
    { label: '🌑 ปิดไฟทุกช่อง', prompt: 'ปิดไฟทุกช่อง' },
    { label: '📡 ปิด Ultrasonic 1', prompt: 'ปิด Ultrasonic ช่อง 1' },
    { label: '📡 เปิด Ultrasonic ทั้งหมด', prompt: 'เปิด Ultrasonic ทั้งหมด' },
    { label: '🚗 เช็คช่องจอดว่าง', prompt: 'มีที่จอดว่างไหม' },
    { label: '📋 รถเข้ากี่คันแล้ว', prompt: 'วันนี้มีรถเข้ากี่คัน' },
  ];

  const currentModel = getOllamaModel();
  const activeLabel = ollamaOnline
    ? `Ollama: ${currentModel}`
    : 'Local Smart Engine (ในเครื่อง)';

  return (
    <>
      {/* 1. FLOATING CHAT BUTTON */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-5 md:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 shadow-float hover:scale-105 active:scale-95 transition-all duration-300 group border border-neutral-700/40 dark:border-neutral-200"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 dark:text-amber-500 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-neutral-900 dark:ring-white"></span>
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight">
            AI Assistant
          </span>
        </button>
      )}

      {/* 2. CHAT ASSISTANT MODAL WINDOW */}
      {isOpen && (
        <div
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[85vh] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-850/60">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 flex items-center justify-center text-white dark:text-neutral-900 shadow-soft-sm">
                <Cpu className="w-5 h-5" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${ollamaOnline ? 'bg-emerald-500' : 'bg-blue-500'} ring-2 ring-white dark:ring-neutral-900`}></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                    AI Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/60">
                    100% Local
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full ${ollamaOnline ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                  <span>{activeLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowSettings(!showSettings);
                  setTestResult(null);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  showSettings
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Ollama Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-Panel (Ollama Configuration) */}
          {showSettings && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-850 border-b border-neutral-200/60 dark:border-neutral-700 space-y-3 transition-all text-xs overflow-y-auto max-h-[340px]">
              <div className="flex items-center justify-between font-bold text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  การตั้งค่า Ollama (Local AI ในเครื่อง)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  ปิด
                </button>
              </div>

              {/* Status info */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  💻 รัน AI บนคอมพิวเตอร์ของคุณเอง 100%
                </p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed">
                  ไม่ต้องใช้ API Key จากค่ายใดๆ, ฟรีตลอดชีพ, ข้อมูลไม่หลุดออกนอกเครื่อง และไม่ต้องใช้อินเทอร์เน็ต
                </p>
              </div>

              {/* Ollama Endpoint */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                  Ollama Host URL:
                </label>
                <input
                  type="text"
                  value={hostInput}
                  onChange={(e) => setHostInput(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
                />
              </div>

              {/* Model Selection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    ชื่อโมเดล Ollama:
                  </label>
                  <a
                    href="https://ollama.com/library"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    ดูโมเดลทั้งหมด <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                {installedModels.length > 0 ? (
                  <select
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-400"
                  >
                    {installedModels.map((m, idx) => (
                      <option key={idx} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={modelInput}
                    onChange={(e) => setModelInput(e.target.value)}
                    placeholder="deepseek-r1:1.5b หรือ qwen2.5:3b"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
                  />
                )}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['deepseek-r1:1.5b', 'qwen2.5:3b', 'llama3.2:1b'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelInput(m)}
                      className={`px-2 py-0.5 rounded-md text-[10px] border transition-colors ${
                        modelInput === m
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent font-bold'
                          : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Test & Save */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestOllama}
                  disabled={isTesting}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-650 text-neutral-800 dark:text-neutral-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    '🔍 ตรวจสอบการเชื่อมต่อ Ollama'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="py-1.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs transition-opacity shadow-soft-sm"
                >
                  บันทึก
                </button>
              </div>

              {/* Connection Status Box */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border animate-in fade-in duration-200 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-bold">
                      {testResult.success ? 'เชื่อมต่อ Ollama สำเร็จ!' : 'ยังไม่ได้เปิด Ollama ในเครื่อง'}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {testResult.success
                        ? `พบโมเดลในเครื่อง: ${testResult.models.join(', ') || modelInput}`
                        : 'ระบบจะสลับไปใช้ Local Smart Engine ภายในเว็บอัตโนมัติ ซึ่งสามารถสั่งเปิด/ปิดไฟและเซนเซอร์ได้ 100%'}
                    </p>
                  </div>
                </div>
              )}

              {/* 3-Step Setup Guide */}
              <div className="p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1.5">
                <p className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  วิธีติดตั้ง & เปิดใช้งาน Ollama ในเครื่อง:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
                  <li>ดาวน์โหลดและติดตั้ง: <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">ollama.com</a></li>
                  <li>เปิด PowerShell แล้วรันคำสั่ง: <br/><code className="text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-neutral-900 px-1 py-0.5 rounded">ollama run deepseek-r1:1.5b</code></li>
                  <li>กลับมากดปุ่ม "ตรวจสอบการเชื่อมต่อ" ด้านบน</li>
                </ol>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-[13px] leading-relaxed">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-soft-sm ${
                      isAi
                        ? 'bg-neutral-100/90 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-sm border border-neutral-200/50 dark:border-neutral-700/50'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-tr-sm font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-line break-words space-y-1">
                      {msg.text}
                    </div>

                    {/* Action Execution Badges */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 dark:bg-neutral-900/80 text-[10px] font-bold border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {act.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-neutral-400 p-2">
                <div className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-neutral-500 animate-bounce" />
                </div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {quickPrompts.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isTyping}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 shadow-soft-sm active:scale-95 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isTyping}
                className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-100 dark:ring-rose-950/50'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/70 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-750'
                }`}
                title={speechSupported ? (isListening ? 'กำลังฟังเสียง...' : 'กดเพื่อสั่งด้วยเสียง (ภาษาไทย)') : 'เบราว์เซอร์ไม่รองรับ Web Speech API'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? 'กำลังฟังเสียงพูดของคุณ...'
                    : "พิมพ์คำสั่ง เช่น 'เปิดไฟช่อง 1' หรือ 'มีรถเข้ากี่คัน'..."
                }
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft-sm"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
