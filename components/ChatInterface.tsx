import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Bot } from 'lucide-react';
import { ChatMessage, ExpertiseLevel } from '../types';
import { generateFollowUpAnswer } from '../services/geminiService';

interface ChatInterfaceProps {
  topic: string;
  level: ExpertiseLevel;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ topic, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi! I'm ready to answer any specific questions you have about ${topic}.`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Convert internal message format to simpler history for API
    const apiHistory = messages.map(m => ({ role: m.role, text: m.text }));

    const answer = await generateFollowUpAnswer(topic, apiHistory, userMsg.text, level);
    
    setMessages(prev => [...prev, { role: 'model', text: answer, timestamp: Date.now() }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-brand-600 hover:bg-brand-500'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageSquare className="text-white" />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] max-h-[60vh] bg-dark-card border border-brand-800/50 rounded-2xl shadow-2xl flex flex-col z-40 transition-all duration-300 transform origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-brand-900/50 bg-brand-900/20 rounded-t-2xl">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Bot size={18} className="text-brand-400" />
            DeepDive Mentor
          </h3>
          <p className="text-xs text-brand-200 mt-1">Context: {topic} ({level})</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-dark-bg border border-brand-900 text-gray-200 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dark-bg border border-brand-900 rounded-lg p-3 rounded-bl-none flex gap-1">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-brand-900/50">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a follow-up..."
              className="flex-1 bg-dark-bg border border-brand-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 p-2 rounded-lg text-white hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
