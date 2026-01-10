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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
          <p className="text-brand-200 font-medium">Generating your mastery guide...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-dark-bg border border-brand-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-brand-900/50 bg-brand-900/20 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="text-brand-400" size={20} />
              <h2 className="text-2xl font-bold text-white">Interview Mastery: {data.topic}</h2>
            </div>
            <p className="text-gray-400 text-sm">Target Level: {level}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-900/50 bg-dark-card/50 px-6">
          <button
            onClick={() => setActiveTab('tech')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tech' ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen size={16} /> Technical Q&A
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'system' ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers size={16} /> System Design
          </button>
          <button
            onClick={() => setActiveTab('behavioral')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'behavioral' ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Star size={16} /> Resume & Behavioral
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-dark-bg/50">
          
          {/* TECHNICAL TAB */}
          {activeTab === 'tech' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <p className="text-gray-400 mb-4 italic">
                Master these questions. They represent 80% of what is asked in technical screens for this topic.
              </p>
              {data.technicalQuestions.map((q, idx) => (
                <div key={idx} className="bg-dark-card border border-brand-900/30 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium text-gray-200 pr-4">Q{idx+1}: {q.question}</span>
                    {expandedQuestion === idx ? <ChevronUp size={20} className="text-brand-400" /> : <ChevronDown size={20} className="text-gray-500" />}
                  </button>
                  
                  {expandedQuestion === idx && (
                    <div className="p-5 border-t border-brand-900/30 bg-brand-900/5">
                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">Gold Standard Answer</h4>
                        <p className="text-gray-300 leading-relaxed">{q.answer}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Keywords to Hit</h4>
                        <div className="flex flex-wrap gap-2">
                          {q.keyPoints.map((kp, i) => (
                            <span key={i} className="px-2 py-1 bg-green-900/20 text-green-300 text-xs rounded border border-green-800/30">
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
              <div className="bg-gradient-to-br from-purple-900/20 to-dark-card border border-purple-500/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-2">The Challenge</h3>
                <p className="text-lg text-purple-200 mb-6">{data.systemDesignChallenge.scenario}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {data.systemDesignChallenge.constraints.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-black/40 text-gray-300 rounded-full text-sm border border-white/10">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="bg-dark-bg/80 rounded-xl p-6 border border-white/5">
                  <h4 className="text-brand-400 font-bold mb-4 flex items-center gap-2">
                    <Layers size={18} /> Recommended Approach
                  </h4>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300">
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
              <div className="bg-dark-card border border-brand-900/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="text-brand-400" /> Resume Power-Ups
                </h3>
                <p className="text-sm text-gray-400 mb-4">Copy-paste these bullets if they match your experience:</p>
                <div className="space-y-4">
                  {data.resumeBulletPoints.map((bp, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-dark-bg/50 rounded-lg border border-white/5 group hover:border-brand-500/30 transition-colors">
                      <div className="mt-1"><Check size={16} className="text-green-500" /></div>
                      <p className="text-gray-300 text-sm">{bp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAR Example */}
              <div className="bg-dark-card border border-brand-900/30 rounded-2xl p-6">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="text-yellow-400" /> STAR Method Example
                </h3>
                <div className="space-y-4 relative">
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-brand-900/50"></div>
                  
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center text-xs font-bold text-brand-400 border border-brand-700">S</div>
                    <h4 className="font-bold text-gray-200">Situation</h4>
                    <p className="text-sm text-gray-400">{data.starExample.situation}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center text-xs font-bold text-brand-400 border border-brand-700">T</div>
                    <h4 className="font-bold text-gray-200">Task</h4>
                    <p className="text-sm text-gray-400">{data.starExample.task}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center text-xs font-bold text-brand-400 border border-brand-700">A</div>
                    <h4 className="font-bold text-gray-200">Action</h4>
                    <p className="text-sm text-gray-400">{data.starExample.action}</p>
                  </div>
                   <div className="relative pl-10">
                    <div className="absolute left-0 top-0 w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center text-xs font-bold text-brand-400 border border-brand-700">R</div>
                    <h4 className="font-bold text-gray-200">Result</h4>
                    <p className="text-sm text-gray-400">{data.starExample.result}</p>
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
