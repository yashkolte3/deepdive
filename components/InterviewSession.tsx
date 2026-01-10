import React, { useState } from 'react';
import { Bot, Send, User, Award, ArrowRight, RefreshCw, X } from 'lucide-react';
import { ExpertiseLevel } from '../types';
import { evaluateInterviewAnswer, startInterviewSession } from '../services/geminiService';

interface InterviewSessionProps {
  topic: string;
  level: ExpertiseLevel;
  onClose: () => void;
}

interface Turn {
  id: number;
  question: string;
  userAnswer: string;
  feedback?: {
    rating: number;
    critique: string;
    betterAnswer: string;
  };
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ topic, level, onClose }) => {
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [input, setInput] = useState("");

  const start = async () => {
    setLoading(true);
    try {
      const q = await startInterviewSession(topic, level);
      setCurrentQuestion(q);
      setStarted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const answer = input;
    setInput("");
    setLoading(true);

    try {
      const result = await evaluateInterviewAnswer(topic, currentQuestion, answer);
      
      const newTurn: Turn = {
        id: Date.now(),
        question: currentQuestion,
        userAnswer: answer,
        feedback: result.feedback
      };

      setTurns(prev => [...prev, newTurn]);
      setCurrentQuestion(result.nextQuestion);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!started) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-dark-card border border-brand-700 w-full max-w-md p-8 rounded-2xl shadow-2xl text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
            <X size={24} />
          </button>
          <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
            <Award className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Mock Interview</h2>
          <p className="text-gray-400 mb-8">
            Test your knowledge on <span className="text-brand-300 font-semibold">{topic}</span> at a <span className="text-brand-300 font-semibold">{level}</span> level. 
            The AI will rate your answers and provide feedback.
          </p>
          <button 
            onClick={start}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" /> : "Start Session"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-dark-bg border border-brand-900/50 w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-brand-900/50 bg-brand-900/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Bot size={18} className="text-white" />
             </div>
             <div>
               <h3 className="text-white font-bold">Interview: {topic}</h3>
               <p className="text-xs text-brand-300">Level: {level}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* History */}
          {turns.map((turn) => (
            <div key={turn.id} className="space-y-4 border-b border-brand-900/30 pb-8 last:border-0">
              {/* Question */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center shrink-0 border border-brand-700">
                  <Bot size={14} className="text-brand-400" />
                </div>
                <div className="bg-brand-900/10 p-4 rounded-xl rounded-tl-none border border-brand-900/30">
                   <p className="text-gray-200">{turn.question}</p>
                </div>
              </div>

              {/* User Answer */}
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                  <User size={14} className="text-gray-300" />
                </div>
                <div className="bg-dark-card p-4 rounded-xl rounded-tr-none border border-dark-border max-w-[80%]">
                   <p className="text-gray-300 text-sm">{turn.userAnswer}</p>
                </div>
              </div>

              {/* Feedback Card */}
              {turn.feedback && (
                <div className="ml-12 bg-gradient-to-r from-brand-900/20 to-transparent border-l-2 border-brand-500 pl-4 py-2 animate-fade-in">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${turn.feedback.rating >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        Score: {turn.feedback.rating}/10
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Feedback</span>
                   </div>
                   <p className="text-sm text-gray-300 mb-2"><span className="text-brand-400 font-medium">Critique:</span> {turn.feedback.critique}</p>
                   <p className="text-sm text-gray-400 italic bg-black/20 p-3 rounded border border-white/5">
                     <span className="text-brand-300 not-italic font-medium block mb-1">Better Answer:</span>
                     {turn.feedback.betterAnswer}
                   </p>
                </div>
              )}
            </div>
          ))}

          {/* Current Loading State or New Question */}
          {loading && (
             <div className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-brand-900/50 shrink-0" />
                <div className="h-12 bg-brand-900/20 w-1/2 rounded-xl" />
             </div>
          )}

          {!loading && currentQuestion && (
             <div className="flex gap-4 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center shrink-0 border border-brand-700">
                  <Bot size={14} className="text-brand-400" />
                </div>
                <div className="bg-brand-900/10 p-4 rounded-xl rounded-tl-none border border-brand-900/30 w-full">
                   <p className="text-white font-medium text-lg">{currentQuestion}</p>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark-card border-t border-brand-900/50">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type your answer here..."
              className="w-full bg-dark-bg border border-brand-900/50 rounded-xl p-4 pr-14 text-white focus:outline-none focus:border-brand-500 min-h-[80px] resize-none"
            />
            <button 
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">Press Enter to submit</p>
        </div>
      </div>
    </div>
  );
};
