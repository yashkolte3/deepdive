
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Award, RefreshCw, X, Mic, MicOff, MessageSquare, Radio, Activity } from 'lucide-react';
import { ExpertiseLevel } from '../types';
import { evaluateInterviewAnswer, startInterviewSession } from '../services/geminiService';
import { useLiveAPI } from '../hooks/useLiveAPI';

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
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  // Voice State
  const liveSession = useLiveAPI({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    systemInstruction: `You are a strict but fair technical interviewer at a top tech company. The topic is ${topic}. The candidate level is ${level}. Conduct a verbal interview. Start by briefly introducing yourself and asking the first technical question. Listen to the candidate's answer, provide brief, constructive feedback, and then ask the next question. Keep your responses concise and conversational.`,
    voiceName: 'Kore'
  });
  
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveSession.transcripts, liveSession.currentText]);

  const startTextSession = async () => {
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

  const handleTextSubmit = async () => {
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

  if (!started && mode === 'text') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 w-full max-w-md p-10 rounded-[32px] shadow-2xl text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <Award className="text-white" size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Mock Interview</h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Test your knowledge on <span className="text-white font-semibold">{topic}</span>
          </p>

          <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/5">
             <button 
               onClick={() => setMode('text')}
               className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 bg-white text-black shadow-md"
             >
               <MessageSquare size={16} /> Text
             </button>
             <button 
               onClick={() => {
                   setMode('voice');
                   setStarted(true);
               }}
               className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 text-white/50 hover:text-white"
             >
               <Mic size={16} /> Voice
             </button>
          </div>

          <button 
            onClick={startTextSession}
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {loading ? <RefreshCw className="animate-spin" /> : "Start Text Session"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 w-full max-w-3xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-white/5 ${mode === 'voice' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
                {mode === 'voice' ? <Radio size={20} className={liveSession.connected ? "animate-pulse" : ""} /> : <Bot size={20} />}
             </div>
             <div>
               <h3 className="text-white font-bold text-lg">{topic}</h3>
               <div className="flex items-center gap-2">
                 <p className="text-xs text-white/50 uppercase tracking-wider">{level}</p>
                 {mode === 'voice' && (
                    <span className={`w-2 h-2 rounded-full ${liveSession.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Mode Toggle in Header */}
             <div className="flex bg-black/20 p-1 rounded-lg border border-white/5 mr-2">
                 <button 
                   onClick={() => setMode('text')}
                   className={`p-2 rounded-md transition-all ${mode === 'text' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                   title="Text Mode"
                 >
                   <MessageSquare size={16} />
                 </button>
                 <button 
                   onClick={() => setMode('voice')}
                   className={`p-2 rounded-md transition-all ${mode === 'voice' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                   title="Voice Mode"
                 >
                   <Mic size={16} />
                 </button>
             </div>
             <button onClick={() => {
                liveSession.disconnect();
                onClose();
             }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* --- VOICE MODE UI --- */}
        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
             
             {/* Live Transcript Overlay */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
                {liveSession.transcripts.length === 0 && liveSession.connected && !liveSession.currentText && (
                  <div className="text-center mt-20 text-white/30 animate-pulse">
                    Listening for interviewer...
                  </div>
                )}
                {liveSession.transcripts.map((t) => (
                   <div key={t.id} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                         t.role === 'user' 
                          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-br-sm'
                          : 'bg-white/5 border border-white/5 text-white/80 rounded-bl-sm'
                      }`}>
                        {t.text}
                      </div>
                   </div>
                ))}
                
                {/* Real-time Transcription Display */}
                {liveSession.currentText && (
                   <div className="flex justify-center">
                      <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed bg-white/10 border border-white/10 text-white/60 animate-pulse">
                        {liveSession.currentText}
                      </div>
                   </div>
                )}
                
                <div ref={transcriptEndRef} />
             </div>

             {/* Voice Controls / Visualizer */}
             <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col items-center justify-center gap-6">
                
                {liveSession.connected && (
                   <div className="h-16 flex items-center justify-center gap-1.5">
                      {/* Audio Visualizer Bars */}
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-red-500/80 rounded-full transition-all duration-75"
                          style={{ 
                            height: Math.max(8, liveSession.isVolume * 60 * (Math.random() * 0.5 + 0.5)) + 'px',
                            opacity: 0.5 + liveSession.isVolume 
                          }}
                        />
                      ))}
                   </div>
                )}

                {!liveSession.connected ? (
                   <button 
                     onClick={liveSession.connect}
                     className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                   >
                     <Mic size={24} /> Start Interview
                   </button>
                ) : (
                   <button 
                     onClick={liveSession.disconnect}
                     className="bg-red-500/20 text-red-400 border border-red-500/50 px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 hover:bg-red-500/30 transition-all"
                   >
                     <MicOff size={24} /> End Session
                   </button>
                )}
             </div>
          </div>
        ) : (
          /* --- TEXT MODE UI --- */
          <>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* History */}
              {turns.map((turn) => (
                <div key={turn.id} className="space-y-6 border-b border-white/5 pb-8 last:border-0">
                  {/* Question */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/5 backdrop-blur-sm">
                      <p className="text-white/90 leading-relaxed">{turn.question}</p>
                    </div>
                  </div>

                  {/* User Answer */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                    <div className="bg-blue-600/20 p-5 rounded-2xl rounded-tr-none border border-blue-500/20 max-w-[85%] backdrop-blur-sm">
                      <p className="text-blue-100 leading-relaxed">{turn.userAnswer}</p>
                    </div>
                  </div>

                  {/* Feedback Card */}
                  {turn.feedback && (
                    <div className="ml-12 bg-white/5 border border-white/5 rounded-2xl p-5 animate-fade-in backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${turn.feedback.rating >= 7 ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            Score: {turn.feedback.rating}/10
                          </span>
                          <span className="text-xs text-white/40 uppercase tracking-wider">AI Feedback</span>
                      </div>
                      <p className="text-sm text-white/80 mb-3 leading-relaxed"><span className="text-white font-semibold">Critique:</span> {turn.feedback.critique}</p>
                      <div className="text-sm text-white/60 bg-black/20 p-4 rounded-xl border border-white/5 italic">
                        <span className="text-white/40 not-italic text-xs font-bold uppercase block mb-2">Ideal Answer</span>
                        {turn.feedback.betterAnswer}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Current Loading State or New Question */}
              {loading && (
                <div className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                    <div className="h-20 bg-white/5 w-2/3 rounded-2xl" />
                </div>
              )}

              {!loading && currentQuestion && (
                <div className="flex gap-4 animate-slide-up">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl rounded-tl-none border border-white/5 w-full backdrop-blur-sm">
                      <p className="text-white text-lg font-medium leading-relaxed">{currentQuestion}</p>
                    </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-black/20">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextSubmit();
                    }
                  }}
                  placeholder="Type your answer here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-white focus:outline-none focus:border-white/20 focus:bg-white/10 min-h-[60px] resize-none transition-all"
                />
                <button 
                  onClick={handleTextSubmit}
                  disabled={loading || !input.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
