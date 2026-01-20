import React, { useState, useEffect } from 'react';
import { BookOpen, Briefcase, Check, ChevronDown, ChevronUp, FileText, Layers, Loader2, X, Star } from 'lucide-react';
import { generateInterviewPrep } from '../services/geminiService';
import { ExpertiseLevel, InterviewPrepData } from '../types';

interface InterviewPrepGuideProps {
  topic: string;
  level: ExpertiseLevel;
  onClose: () => void;
}

export const InterviewPrepGuide: React.FC<InterviewPrepGuideProps> = ({ topic, level, onClose }) => {
  const [data, setData] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tech' | 'system' | 'behavioral'>('tech');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await generateInterviewPrep(topic, level);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [topic, level]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-white/50 animate-spin mx-auto" />
          <p className="text-white/60 font-medium">Generating your mastery guide...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="text-white/80" size={24} />
              <h2 className="text-2xl font-bold text-white">Interview Mastery: {data.topic}</h2>
            </div>
            <p className="text-white/40 text-sm">Target Level: {level}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-8 gap-4 pt-4">
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tech' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <BookOpen size={16} /> Technical Q&A
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'system' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Layers size={16} /> System Design
          </button>
          <button
            onClick={() => setActiveTab('behavioral')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'behavioral' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Star size={16} /> Resume & Behavioral
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-black/10">
          
          {/* TECHNICAL TAB */}
          {activeTab === 'tech' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <p className="text-white/40 mb-6 italic text-sm">
                Master these questions. They represent 80% of what is asked in technical screens.
              </p>
              {data.technicalQuestions.map((q, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                    className="w-full text-left p-6 flex justify-between items-center hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-white/90 pr-4 text-lg">Q{idx+1}: {q.question}</span>
                    {expandedQuestion === idx ? <ChevronUp size={20} className="text-white/60" /> : <ChevronDown size={20} className="text-white/30" />}
                  </button>
                  
                  {expandedQuestion === idx && (
                    <div className="p-6 border-t border-white/5 bg-black/20">
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Gold Standard Answer</h4>
                        <p className="text-white/80 leading-loose text-lg font-light">{q.answer}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-green-400/80 uppercase tracking-wider mb-3">Keywords to Hit</h4>
                        <div className="flex flex-wrap gap-2">
                          {q.keyPoints.map((kp, i) => (
                            <span key={i} className="px-3 py-1 bg-green-500/10 text-green-300 text-xs rounded-lg border border-green-500/20">
                              {kp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* SYSTEM DESIGN TAB */}
          {activeTab === 'system' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-purple-500/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-2">The Challenge</h3>
                <p className="text-lg text-purple-200/80 mb-6 font-light leading-relaxed">{data.systemDesignChallenge.scenario}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {data.systemDesignChallenge.constraints.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-black/40 text-white/70 rounded-full text-sm border border-white/10">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="bg-black/20 rounded-2xl p-8 border border-white/5">
                  <h4 className="text-white/90 font-bold mb-4 flex items-center gap-2">
                    <Layers size={18} /> Recommended Approach
                  </h4>
                  <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-p:leading-8 prose-p:font-light prose-strong:text-white">
                    <div dangerouslySetInnerHTML={{ __html: data.systemDesignChallenge.approach.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BEHAVIORAL TAB */}
          {activeTab === 'behavioral' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Resume Section */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="text-white/60" /> Resume Power-Ups
                </h3>
                <p className="text-sm text-white/40 mb-6">Copy-paste these bullets if they match your experience:</p>
                <div className="space-y-4">
                  {data.resumeBulletPoints.map((bp, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                      <div className="mt-0.5"><Check size={16} className="text-green-400" /></div>
                      <p className="text-white/80 text-sm leading-relaxed">{bp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAR Example */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="text-yellow-400" /> STAR Method Example
                </h3>
                <div className="space-y-6 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10"></div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-[#1c1c1e] rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">S</div>
                    <h4 className="font-bold text-white/90 mb-1">Situation</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{data.starExample.situation}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-[#1c1c1e] rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">T</div>
                    <h4 className="font-bold text-white/90 mb-1">Task</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{data.starExample.task}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-[#1c1c1e] rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">A</div>
                    <h4 className="font-bold text-white/90 mb-1">Action</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{data.starExample.action}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-[#1c1c1e] rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">R</div>
                    <h4 className="font-bold text-white/90 mb-1">Result</h4>
                    <p className="text-sm text-white/60 leading-relaxed">{data.starExample.result}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};