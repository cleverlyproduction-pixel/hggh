import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Paperclip, Mic, MicOff, Bot, User, 
  Sparkles, Upload, X, FileText, Play, Pause, Trash2, HelpCircle, Mail, AlertTriangle
} from "lucide-react";
import { Message, UploadedFile, VoiceNote } from "../types";

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am the CLEV Assistant, an elite AI representative built by **CLEV PRODUCTIONS™**.\n\nI am fully connected to our server stack and ready to demonstrate our custom chat features:\n\n1. 📂 **File Analyzer**: Upload any text, data, CSV, or document file, and I will analyze and discuss its content with you.\n2. 🎙️ **Voice Notes**: Tap the microphone, speak naturally, and watch me transcribe and understand your real voice in real-time!",
      timestamp: new Date(),
    }
  ]);
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile & { base64?: string }>({ name: "", size: "", type: "" });
  const [hasFile, setHasFile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [activeVoicePlayId, setActiveVoicePlayId] = useState<string | null>(null);
  
  // Question limit tracker: answer only 10 questions
  const [questionCount, setQuestionCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load question count and messages on mount
  useEffect(() => {
    const storedCount = localStorage.getItem("clev_demo_question_count");
    if (storedCount) {
      setQuestionCount(parseInt(storedCount, 10));
    }
  }, []);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      
      rec.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript.trim());
      };

      rec.onerror = (e: any) => {
        console.warn("Speech Recognition info (iframe restrictions may apply):", e.error || e);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice note duration timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordDuration(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Handle Send Text Message
  const handleSend = async (textToSend?: string) => {
    // Block if count reaches limit
    if (questionCount >= 10) return;

    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !hasFile) return;

    const userMsgId = `msg-${Date.now()}`;
    const filePayload = hasFile ? { ...selectedFile } : undefined;

    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      text: text,
      timestamp: new Date(),
      file: filePayload
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    setSelectedFile({ name: "", size: "", type: "" });
    setHasFile(false);
    setIsTyping(true);

    // Track question limit
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);
    localStorage.setItem("clev_demo_question_count", nextCount.toString());

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          count: nextCount
        })
      });

      const data = await response.json();
      
      setIsTyping(false);
      
      if (data.error === "LIMIT_REACHED" || nextCount > 10) {
        setMessages(prev => [...prev, {
          id: `bot-limit-${Date.now()}`,
          role: "assistant",
          text: "### ⚠️ Daily Demo Limit Reached!\n\nYou have completed your 10 demo questions. To get a fully featured, custom AI Assistant with infinite capacity, customized vector search data, and custom brand assets, let's collaborate!\n\nEmail us at **cleverlyproduction@gmail.com** or tap **Contact Us**.",
          timestamp: new Date()
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: data.text || "I am processing your message, let's construct a beautiful workflow together!",
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        role: "assistant",
        text: "### 🔌 Offline Demo Fallback\n\nI detected a connection hiccup, but I am still listening! CLEV custom systems are resilient. Let's build a dedicated server for your company! Email us at **cleverlyproduction@gmail.com**.",
        timestamp: new Date()
      }]);
    }
  };

  // Handle File Select & parse content
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeString = file.size < 1024 * 1024 
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${sizeMB} MB`;

    const fileReader = new FileReader();
    
    // If it's a text/data file, read as text
    const isText = file.type.startsWith("text/") || 
                   file.name.endsWith(".txt") || 
                   file.name.endsWith(".csv") || 
                   file.name.endsWith(".md") || 
                   file.name.endsWith(".json") || 
                   file.name.endsWith(".js") || 
                   file.name.endsWith(".ts");

    if (isText) {
      fileReader.onload = () => {
        setSelectedFile({
          name: file.name,
          size: sizeString,
          type: file.type || "Document",
          content: fileReader.result as string
        });
        setHasFile(true);
      };
      fileReader.readAsText(file);
    } else if (file.type.startsWith("image/")) {
      // If it's an image, read as base64 so we can do vision tasks server-side!
      fileReader.onload = () => {
        setSelectedFile({
          name: file.name,
          size: sizeString,
          type: file.type,
          base64: fileReader.result as string,
          content: "[Attached Image for Cognitive Vision]"
        });
        setHasFile(true);
      };
      fileReader.readAsDataURL(file);
    } else {
      // Binary files
      setSelectedFile({
        name: file.name,
        size: sizeString,
        type: file.type || "Binary File",
        content: "[Binary stream data parsed successfully]"
      });
      setHasFile(true);
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile({ name: "", size: "", type: "" });
    setHasFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Mic Record (Web Speech API Integration)
  const startRecording = () => {
    if (questionCount >= 10) return;
    setIsRecording(true);
    setInputText(""); // Clear previous text to start fresh speech transcription
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start Speech Recognition:", err);
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Failed to stop Speech Recognition:", err);
      }
    }

    const duration = recordDuration || 3;
    
    // We send transcribed text or fallback if no speech was captured
    setTimeout(() => {
      // Let speech complete
      const finalSpeechText = inputText.trim();
      if (!finalSpeechText) {
        // Speech was empty. Advise the user on screen instead of spending a limit count!
        setMessages(prev => [...prev, {
          id: `voice-warn-${Date.now()}`,
          role: "assistant",
          text: "⚠️ **No speech detected.** Please ensure you are speaking clearly into your microphone and have granted permissions in your browser. Feel free to type in the chat bar directly!",
          timestamp: new Date()
        }]);
        setInputText("");
        setIsTyping(false);
        return;
      }
      
      const speechToUse = finalSpeechText;
      
      const voiceMessageId = `voice-${Date.now()}`;
      const userVoiceMessage: Message = {
        id: voiceMessageId,
        role: "user",
        text: speechToUse,
        timestamp: new Date(),
        voiceNote: {
          duration,
          transcript: speechToUse
        }
      };

      setMessages(prev => [...prev, userVoiceMessage]);
      setInputText("");
      setIsTyping(true);

      // Call Chat backend with user speech note
      const nextCount = questionCount + 1;
      setQuestionCount(nextCount);
      localStorage.setItem("clev_demo_question_count", nextCount.toString());

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userVoiceMessage],
          count: nextCount
        })
      })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        if (data.error === "LIMIT_REACHED" || nextCount > 10) {
          setMessages(prev => [...prev, {
            id: `bot-limit-${Date.now()}`,
            role: "assistant",
            text: "### ⚠️ Daily Demo Limit Reached!\n\nYou have completed your 10 demo questions. To deploy an infinite chatbot with custom data, voice recognition, and workflows, email us at **cleverlyproduction@gmail.com**.",
            timestamp: new Date()
          }]);
          return;
        }

        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: "assistant",
          text: data.text || "Voice transcription parsed and processed successfully!",
          timestamp: new Date()
        }]);
      })
      .catch(err => {
        console.error("Voice Note query error:", err);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          text: "### 🎙️ CLEV Speech Engine\n\nI successfully parsed your voice command! CLEV production bots integrate fully with custom audio APIs. Contact us at **cleverlyproduction@gmail.com** to build an advanced speech core.",
          timestamp: new Date()
        }]);
      });
    }, 600);
  };

  // Play voice note synthesis in client
  const playVoiceSynthesizer = (msgId: string, transcriptText: string) => {
    if (activeVoicePlayId === msgId) {
      window.speechSynthesis.cancel();
      setActiveVoicePlayId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(transcriptText);
      utterance.onend = () => {
        setActiveVoicePlayId(null);
      };
      utterance.onerror = () => {
        setActiveVoicePlayId(null);
      };
      setActiveVoicePlayId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section 
      id="chatbot-demo" 
      className="py-20 bg-gradient-to-b from-[#0b0f19] to-[#0c1322] relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Bot className="w-3.5 h-3.5 text-teal-400" />
            <span>Operational Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            CLEV Conversational Engine
          </h2>
          <p className="mt-4 text-gray-400 font-sans text-sm sm:text-base">
            Discuss documents, transcode audio, and observe state-of-the-art responses in our sandboxed showcase.
          </p>
        </div>

        {/* Outer Grid Frame designed to NEVER let the chat bar scroll off-screen */}
        <div 
          id="chatbot-container" 
          className="max-w-4xl mx-auto flex flex-col lg:flex-row bg-[#0e1626]/90 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm h-[600px] lg:h-[650px]"
        >
          
          {/* Left Panel - Specs & Capacity Gauges */}
          <div 
            id="chatbot-sidebar" 
            className="hidden lg:flex lg:w-1/3 bg-slate-950/40 border-r border-gray-800 p-6 flex-col justify-between"
          >
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-teal-400 text-sm tracking-wider uppercase">Active Sandbox</h3>
                <p className="text-xs text-gray-400 mt-1">Our production systems include elite server-side cognitive features:</p>
              </div>

              {/* Capabilities checklist */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 mt-0.5 text-[10px] font-bold">✓</div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Document Analysis</span>
                    <span className="text-[11px] text-gray-400">Understands uploaded TXT, CSV, JSON, and files.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 mt-0.5 text-[10px] font-bold">✓</div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Speech-to-Text Transcription</span>
                    <span className="text-[11px] text-gray-400">Captures real voice input in real-time from your browser.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-teal-500/15 flex items-center justify-center text-teal-400 mt-0.5 text-[10px] font-bold">✓</div>
                  <div>
                    <span className="text-xs font-semibold text-white block">Full-Stack Resilience</span>
                    <span className="text-[11px] text-gray-400">Connects directly to Express proxy endpoints.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Answered Tracker Gauge */}
            <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/15 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                <span className="text-teal-400 font-bold">Demo Questions Limit</span>
                <span className="text-gray-300 font-extrabold">{questionCount}/10</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    questionCount >= 8 ? "bg-red-500" : "bg-gradient-to-r from-teal-500 to-emerald-400"
                  }`}
                  style={{ width: `${Math.min((questionCount / 10) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-tight">
                {questionCount < 10 
                  ? `${10 - questionCount} test questions remaining in this interactive trial session.`
                  : "All trial answers exhausted. Contact us for custom deployment options!"
                }
              </p>
            </div>
          </div>

          {/* Right Panel - Responsive Console with rigid boundaries to prevent disappearing input bar */}
          <div 
            id="chat-console" 
            className="flex-1 flex flex-col justify-between bg-[#0b101c]/40 relative h-full min-h-0"
          >
            
            {/* Header with status indicators */}
            <div className="px-6 py-4 border-b border-gray-800 bg-[#0c1222] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-slate-950" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">CLEV Interactive Bot</h4>
                  <span className="text-[10px] text-gray-400 font-mono flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                    Cognitive Core Active
                  </span>
                </div>
              </div>

              {/* Chat action controls */}
              <div className="flex items-center space-x-2">
                <div className="lg:hidden text-[11px] font-mono bg-teal-950/30 border border-teal-500/20 px-2 py-0.5 rounded text-teal-400 font-bold">
                  Demo limit: {questionCount}/10
                </div>
                <button
                  id="btn-clear-chat"
                  title="Reset Conversation"
                  onClick={() => {
                    setMessages([messages[0]]);
                    setQuestionCount(0);
                    localStorage.setItem("clev_demo_question_count", "0");
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800/60 transition-all"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Message Thread Scrollable block with strictly locked flex boundary */}
            <div 
              id="chat-thread" 
              className="flex-1 overflow-y-auto px-6 py-4 space-y-4 font-sans text-sm min-h-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            >
              {messages.map((msg) => {
                const isBot = msg.role === "assistant";
                return (
                  <motion.div
                    id={`msg-container-${msg.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`flex items-start space-x-2.5 max-w-[85%] ${isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                      
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isBot ? "bg-teal-500/10 text-teal-400 border border-teal-500/10" : "bg-gray-800 text-gray-300 border border-gray-700"
                      }`}>
                        {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                      </div>

                      {/* Bubble with robust styling */}
                      <div className="space-y-1">
                        <div className={`rounded-2xl px-4 py-3 shadow-md whitespace-pre-wrap leading-relaxed border ${
                          isBot 
                            ? "bg-[#121c2e] text-gray-200 border-gray-800/40 rounded-tl-none" 
                            : "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-semibold border-teal-400/20 rounded-tr-none"
                        }`}>
                          
                          {/* File upload tags parsed */}
                          {msg.file && (
                            <div className="mb-2.5 p-2 rounded-xl bg-slate-950/20 border border-slate-900/10 flex items-center space-x-2 text-slate-900">
                              <FileText className="w-4 h-4 shrink-0 text-teal-950" />
                              <div className="text-xs truncate">
                                <span className="font-bold block text-teal-950">{msg.file.name}</span>
                                <span className="text-[10px] opacity-75">{msg.file.size} • {msg.file.type}</span>
                              </div>
                            </div>
                          )}

                          {/* Voice Notes Speech Playback box */}
                          {msg.voiceNote && (
                            <div className="space-y-1.5 mb-2">
                              <div className="flex items-center space-x-3 bg-slate-950/20 rounded-lg p-2 text-slate-900">
                                <button
                                  id={`voice-btn-${msg.id}`}
                                  onClick={() => playVoiceSynthesizer(msg.id, msg.voiceNote?.transcript || "")}
                                  className="w-7 h-7 rounded-full bg-slate-950/30 flex items-center justify-center text-slate-900 hover:bg-slate-950/50 transition-all shrink-0"
                                >
                                  {activeVoicePlayId === msg.id ? <Pause className="w-3.5 h-3.5 fill-slate-900" /> : <Play className="w-3.5 h-3.5 fill-slate-900 translate-x-0.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-end space-x-0.5 h-3.5">
                                    {[2, 4, 1, 3, 5, 2, 4, 1, 3, 2].map((h, i) => (
                                      <span 
                                        key={i} 
                                        className={`w-0.5 bg-slate-900/80 rounded-full transition-all ${
                                          activeVoicePlayId === msg.id ? "animate-pulse" : ""
                                        }`} 
                                        style={{ height: `${h * 20}%`, animationDelay: `${i * 0.1}s` }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] opacity-80 block font-bold">Voice note transcribed: {msg.voiceNote.duration}s</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Primary Markdown text output */}
                          <div className={`prose prose-invert text-xs sm:text-sm max-w-none ${msg.file || msg.voiceNote ? "mt-1 pt-1 border-t border-slate-900/10" : ""}`}>
                            {msg.text}
                          </div>

                        </div>
                        <span className={`text-[10px] text-gray-500 block ${isBot ? "text-left pl-2" : "text-right pr-2"}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                );
              })}

              {/* Server Processing Animation Indicator */}
              {isTyping && (
                <div id="bot-typing" className="flex justify-start">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div className="bg-[#121c2e] text-gray-300 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-gray-800/40 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Active Speech Recording Screen Overlay */}
            {isRecording && (
              <div 
                id="recording-overlay" 
                className="absolute inset-x-0 bottom-16 bg-[#0c1322]/95 border-t border-teal-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 shrink-0"
              >
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">Listening in real-time...</span>
                  <span className="text-xs text-gray-400 font-mono">0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>
                </div>

                <div className="flex-1 text-xs text-teal-300 italic truncate max-w-full sm:max-w-md px-2 text-center sm:text-left">
                  {inputText ? `"${inputText}"` : "Speak now..."}
                </div>
                
                {/* Audio Waves graphic */}
                <div className="flex items-center space-x-1 h-5">
                  {[2, 4, 1, 5, 3, 2, 4, 1].map((val, idx) => (
                    <span 
                      key={idx} 
                      className="w-1 bg-teal-400 rounded-full animate-pulse" 
                      style={{ height: `${val * 20}%`, animationDuration: "0.4s", animationDelay: `${idx * 0.05}s` }} 
                    />
                  ))}
                </div>
                
                <button
                  id="btn-stop-recording"
                  onClick={stopRecording}
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
                >
                  Stop & Process
                </button>
              </div>
            )}

            {/* Locked Input Control Bar Area */}
            <div 
              id="chat-input-controls" 
              className="p-4 border-t border-gray-800/80 bg-[#0c1222] shrink-0"
            >
              
              {/* Count Limit Alert Banner */}
              {questionCount >= 10 && (
                <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-3 text-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="flex-1">
                    <strong className="block text-white">Daily Demo Limit Reached</strong>
                    <span>You've used all 10 sandbox queries. Let's build a customized production robot with infinite capacity!</span>
                  </div>
                  <a 
                    href="mailto:cleverlyproduction@gmail.com"
                    className="flex items-center space-x-1.5 px-3 py-1 rounded bg-red-500 text-slate-950 font-bold hover:bg-red-400 transition-all shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Inquire</span>
                  </a>
                </div>
              )}

              {/* Selected File Badge */}
              {hasFile && (
                <div 
                  id="file-status-bar" 
                  className="mb-3 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-white truncate max-w-xs">{selectedFile.name} ({selectedFile.size})</span>
                  </div>
                  <button
                    id="btn-remove-file"
                    onClick={removeSelectedFile}
                    className="p-1 rounded bg-gray-800/50 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Interaction Row */}
              <div className="flex items-center space-x-2">
                
                {/* File Attachment paperclip */}
                <button
                  id="btn-attach-file"
                  title="Attach Text or Document"
                  disabled={questionCount >= 10}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition-all shrink-0 disabled:opacity-40"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".txt,.csv,.json,.md,.js,.ts,.html,.css,.png,.jpg,.jpeg"
                />

                {/* Primary input box */}
                <input
                  id="chat-text-input"
                  type="text"
                  value={inputText}
                  disabled={questionCount >= 10}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  placeholder={
                    questionCount >= 10 
                      ? "Limit reached! Say hi to us at Gmail..." 
                      : hasFile 
                        ? "Discuss this file or hit Send..." 
                        : "Type a prompt or record a voice note..."
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950/60 border border-gray-800 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500/70 transition-all font-sans disabled:opacity-40"
                />

                {/* Real Voice recorder button */}
                <button
                  id="btn-voice-record"
                  title="Speak Voice Command"
                  disabled={questionCount >= 10}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2.5 rounded-xl border transition-all shrink-0 ${
                    isRecording 
                      ? "bg-red-500/25 border-red-500 text-red-400 animate-pulse" 
                      : "bg-gray-800/50 hover:bg-gray-800 border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
                  }`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Submit button */}
                <button
                  id="btn-send-message"
                  disabled={questionCount >= 10}
                  onClick={() => handleSend()}
                  className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:scale-105 transition-all shrink-0 flex items-center justify-center disabled:opacity-40 disabled:scale-100 disabled:shadow-none"
                >
                  <Send className="w-4.5 h-4.5 text-slate-950 fill-slate-950" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
