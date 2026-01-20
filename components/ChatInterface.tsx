
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Bot, Maximize2, Minimize2, Trash2, RefreshCw } from 'lucide-react';
import { ChatMessage, ExpertiseLevel } from '../types';
import { generateFollowUpAnswer } from '../services/geminiService';

interface ChatInterfaceProps {
  topic: string;
  level: ExpertiseLevel;
  triggerQuestion?: string | null;
  onTriggerHandled?: () => void;
}

// Simple Markdown Formatter Component
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  // 1. Split by code blocks first
  const parts = text.split(/```/);

  return (
    <div className="text-sm leading-relaxed space-y-2">
      {parts.map((part, i) => {
        // Odd indices are code blocks (implied by split)
        if (i % 2 === 1) {
          return (
            <pre key={i} className="bg-black/30 p-3 rounded-lg text-xs font-mono my-2 overflow-x-auto border border-white/5 text-blue-200">
              {part.trim()}
            </pre>
          );
        }

        // Even indices are regular text (potentially containing inline markdown)
        // We use a simple regex replacer for bold and inline code.
        // Note: This is a lightweight parser. For production, use 'react-markdown'.
        const htmlContent = part
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') // Bold
          .replace(/`([^`]+)`/g, '<code class="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs text-yellow-200">$1</code>') // Inline Code
          .replace(/\n/g, '<br/>'); // Newlines

        return (
          <span 
            key={i} 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
          />
        );
      })}
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ topic, level, triggerQuestion, onTriggerHandled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Handle Topic Changes (Clear History)
  useEffect(() => {
    setMessages([
      { 
        role: 'model', 
        text: `Hi! I'm your mentor for **${topic}**. Ask me anything about the internals, implementation details, or trade-offs!`, 
        timestamp: Date.now() 
      }
    ]);
  }, [topic]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isExpanded]);

  // Handle external trigger question
  useEffect(() => {
    if (triggerQuestion && !isLoading) {
      setIsOpen(true);
      // Immediately send the triggered question
      handleSend(triggerQuestion);
      if (onTriggerHandled) onTriggerHandled();
    }
  }, [triggerQuestion]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Convert internal message format to simpler history for API
    const apiHistory = messages.map(m => ({ role: m.role, text: m.text }));

    const answer = await generateFollowUpAnswer(topic, apiHistory, userMsg.text, level);
    
    setMessages(prev => [...prev, { role: 'model', text: answer, timestamp: Date.now() }]);
    setIsLoading(false);
  };

  const handleClear = () => {
     setMessages([
      { 
        role: 'model', 
        text: `Chat cleared. What else would you like to know about **${topic}**?`, 
        timestamp: Date.now() 
      }
    ]);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl group ${
          isOpen ? 'bg-red-500/80 text-white rotate-90' : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        title={isOpen ? "Close Chat" : "Open Mentor AI"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bg-[#1c1c1e]/90 backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col z-40 transition-all duration-300 transform origin-bottom-right
        ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none translate-y-10'}
        ${isExpanded 
          ? 'inset-4 md:inset-10 rounded-[24px]' // Maximized state
          : 'bottom-28 right-8 w-[400px] max-w-[90vw] h-[600px] max-h-[70vh] rounded-[32px]' // Widget state
        }
      `}>
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/5 bg-white/5 backdrop-blur-md flex justify-between items-center rounded-t-[inherit]">
          <div>
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Bot size={20} className="text-blue-400" />
              Mentor AI
            </h3>
            <p className="text-xs text-white/40 mt-0.5 max-w-[200px] truncate">Context: {topic}</p>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={handleClear}
               className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
               title="Clear History"
             >
               <Trash2 size={16} />
             </button>
             <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
               title={isExpanded ? "Minimize" : "Maximize"}
             >
               {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-sm' 
                  : 'bg-white/10 text-white/90 rounded-bl-sm border border-white/5'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 rounded-bl-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-white/5 bg-black/10 rounded-b-[inherit]">
          <div className="flex gap-2 relative">
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a follow-up..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all placeholder-white/30 pr-12"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 transition-colors aspect-square flex items-center justify-center"
            >
              <Send size={16} className={isLoading ? "opacity-0" : "opacity-100"} />
              {isLoading && <RefreshCw size={16} className="absolute animate-spin text-white/50" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
