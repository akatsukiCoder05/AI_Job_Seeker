import { useState, useEffect, useRef } from "react";
import api from "../lib/axios";
import { X, Sparkles, User, Loader2, ArrowRight } from "lucide-react";
import useAuthStore from "../store/auth.store";

// Custom inline SVGs to bypass missing lucide-react typings
const MessageSquare = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const Send = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AiChatbot = () => {
  const { user } = useAuthStore();
  const userId = user?._id || "guest";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage when user changes
  useEffect(() => {
    const savedChat = sessionStorage.getItem(`ai_career_chat_${userId}`);
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse saved chat history:", e);
      }
    } else {
      // Default welcome message
      setMessages([
        {
          role: "assistant",
          content: "Hello! I am your AI Career Coach. 🎓 How can I help you optimize your resume, prepare for interviews, or check your skill gaps today?"
        }
      ]);
    }
  }, [userId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    sessionStorage.setItem(`ai_career_chat_${userId}`, JSON.stringify(updatedMessagesWithUser));
    setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8); // Keep last 8 messages for context
      const response = await api.post("/ai/chat", {
        message: textToSend,
        history: historyPayload
      });

      const reply = response.data?.data?.reply || "I couldn't process that. Could you try asking again?";
      const updatedMessagesWithAssistant: Message[] = [...updatedMessagesWithUser, { role: "assistant", content: reply }];
      setMessages(updatedMessagesWithAssistant);
      sessionStorage.setItem(`ai_career_chat_${userId}`, JSON.stringify(updatedMessagesWithAssistant));
    } catch (err: any) {
      console.error("Chatbot API error:", err);
      const fallbackText = "I'm having trouble connecting to my servers right now. Please make sure the backend server is running and try again!";
      const updatedMessagesWithError: Message[] = [...updatedMessagesWithUser, { role: "assistant", content: fallbackText }];
      setMessages(updatedMessagesWithError);
      sessionStorage.setItem(`ai_career_chat_${userId}`, JSON.stringify(updatedMessagesWithError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const clearChat = () => {
    const defaultMsg: Message = {
      role: "assistant",
      content: "Hello! I am your AI Career Coach. 🎓 How can I help you optimize your resume, prepare for interviews, or check your skill gaps today?"
    };
    setMessages([defaultMsg]);
    sessionStorage.removeItem(`ai_career_chat_${userId}`);
  };

  // Simple formatter to convert markdown bold (**text**) and bullet points to elements
  const formatMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Check for bullet points
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed);
      if (isBullet) {
        trimmed = trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
      }

      // Handle bold tags (**text**)
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx} className="font-bold text-indigo">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm mt-1 text-ink">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed text-ink mt-1.5 first:mt-0">
          {formattedLine}
        </p>
      );
    });
  };

  const suggestions = [
    "How do I optimize my resume for ATS?",
    "What skills are needed for React jobs?",
    "Give me some mock interview questions",
    "How can I build a good project portfolio?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] rounded-card border border-border bg-surface shadow-card-hover overflow-hidden flex flex-col mb-4 glass-card transform scale-100 origin-bottom-right transition-all">
          {/* Header */}
          <div className="px-5 py-4 bg-indigo text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={16} className="text-white animate-pulse" />
              </span>
              <div>
                <h3 className="font-bold text-sm font-display tracking-wide">AI Career Coach</h3>
                <span className="text-[10px] text-indigo-tint/80 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-ping" /> Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="text-xs text-indigo-tint/80 hover:text-white font-medium hover:underline px-2 py-1 rounded"
              >
                Clear Chat
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-indigo-tint hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas/30">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <span className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                  msg.role === "user" 
                    ? "bg-indigo text-white" 
                    : "bg-ink-soft text-indigo-tint"
                }`}>
                  {msg.role === "user" ? <User size={12} /> : "AI"}
                </span>
                
                <div className={`p-3 rounded-card text-sm shadow-sm leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-indigo text-white rounded-tr-none" 
                    : "bg-surface text-ink border border-border/80 rounded-tl-none"
                }`}>
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{formatMessageContent(msg.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <span className="w-7 h-7 rounded-full bg-ink-soft text-indigo-tint shrink-0 flex items-center justify-center text-xs">
                  AI
                </span>
                <div className="p-3 bg-surface border border-border rounded-card rounded-tl-none shadow-sm flex items-center gap-2 text-text-muted text-xs">
                  <Loader2 size={14} className="animate-spin text-indigo" />
                  Coach is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompt List (if feed is relatively short or empty) */}
          {messages.length < 3 && !isLoading && (
            <div className="px-4 py-2 bg-canvas/50 border-t border-border/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">Suggested Topics</p>
              <div className="flex flex-col gap-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestClick(suggestion)}
                    className="text-left text-xs text-indigo hover:bg-indigo-tint/50 px-2.5 py-1.5 rounded-button border border-indigo/10 bg-surface/80 flex items-center justify-between group"
                  >
                    <span>{suggestion}</span>
                    <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 border-t border-border bg-surface flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask career advice..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-canvas border border-border rounded-button text-sm text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-indigo text-white rounded-button hover:bg-opacity-95 disabled:opacity-40 disabled:hover:bg-opacity-100 shrink-0 transition-all active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-indigo text-white rounded-full shadow-card hover:shadow-card-hover hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center relative group min-h-[52px] min-w-[52px]"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Glow halo */}
        <span className="absolute inset-0 rounded-full bg-indigo opacity-0 group-hover:opacity-20 animate-ping pointer-events-none" />
      </button>
    </div>
  );
};

export default AiChatbot;
