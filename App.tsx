import React, { useState } from 'react';
import { Search, Activity, ArrowRight, Sparkles, Layers, Flame, Clock, Zap, Rabbit, AlertTriangle, TrendingUp, Award, CheckCircle, GraduationCap } from 'lucide-react';
import { generateLesson } from './services/geminiService';
import { ExpertiseLevel, LessonData } from './types';
import { MermaidDiagram } from './components/MermaidDiagram';
import { DynamicIcon } from './components/Icons';
import { ChatInterface } from './components/ChatInterface';
import { QuizCard } from './components/QuizCard';
import { InterviewSession } from './components/InterviewSession';
import { CodePlayground } from './components/CodePlayground';
import { InterviewPrepGuide } from './components/InterviewPrepGuide';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<ExpertiseLevel>(ExpertiseLevel.JUNIOR);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LessonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const [showPrepGuide, setShowPrepGuide] = useState(false);

  const performSearch = async (searchTopic: string) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setTopic(searchTopic); // Update input field if called from suggestions

    try {
      const result = await generateLesson(searchTopic, level);
      setData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to generate the lesson plan. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') performSearch(topic);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-brand-500/30">
      
      {/* Hero / Search Section */}
      <div className={`transition-all duration-700 ease-in-out ${data ? 'h-auto py-8 border-b border-dark-border' : 'h-screen flex items-center justify-center'}`}>
        <div className={`w-full max-w-4xl px-4 ${data ? '' : '-mt-20'}`}>
          
          <div className="text-center mb-8">
            <h1 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-600 transition-all duration-500 ${data ? 'text-3xl' : 'text-5xl md:text-7xl mb-4'}`}>
              DeepDive
            </h1>
            {!data && (
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                Master any software engineering concept. From simplified analogies to architectural internals.
              </p>
            )}
          </div>

          <div className="bg-dark-card border border-dark-border p-2 rounded-2xl shadow-2xl shadow-brand-900/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center bg-dark-bg rounded-xl px-4 border border-transparent focus-within:border-brand-500/50 transition-colors">
                <Search className="text-gray-500" />
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What do you want to learn? (e.g. Rate Limiting, Kafka, OAuth)"
                  className="w-full bg-transparent border-none p-4 text-white focus:ring-0 placeholder-gray-600"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-dark-bg rounded-xl p-2 md:w-auto w-full">
                 <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                  className="w-full md:w-48 bg-transparent text-sm font-medium text-gray-300 focus:outline-none p-2 cursor-pointer"
                >
                  {Object.values(ExpertiseLevel).map((l) => (
                    <option key={l} value={l} className="bg-dark-card text-white">
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => performSearch(topic)}
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Activity className="animate-spin" />
                ) : (
                  <>Dive In <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </div>

          {/* Suggested Topics (Only shown when no data) */}
          {!data && !loading && (
            <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in">
              {['Load Balancing', 'Docker Internals', 'React Fiber', 'B-Trees', 'gRPC vs REST'].map((t) => (
                <button 
                  key={t}
                  onClick={() => performSearch(t)}
                  className="px-4 py-2 bg-dark-card border border-dark-border rounded-full text-sm text-gray-400 hover:text-white hover:border-brand-500/50 transition-all hover:-translate-y-1"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content View */}
      {data && (
        <main className="max-w-6xl mx-auto px-4 py-12 animate-slide-up pb-32">
          
          {/* Header Summary */}
          <div className="mb-12 relative">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-brand-900/30 text-brand-300 text-xs font-mono rounded border border-brand-800/50 uppercase tracking-wider">
                {data.expertiseLevel}
              </span>
              <span className="px-3 py-1 bg-purple-900/30 text-purple-300 text-xs font-mono rounded border border-purple-800/50 uppercase tracking-wider flex items-center gap-1">
                 <TrendingUp size={12} /> {data.popularity}
              </span>
              <span className="h-px flex-1 bg-dark-border"></span>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPrepGuide(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <GraduationCap size={16} /> Mastery Guide
                </button>
                <button 
                  onClick={() => setShowInterview(true)}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                >
                  <Award size={16} /> Mock Interview
                </button>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">{data.topic}</h2>
            <p className="text-xl text-gray-300 leading-relaxed border-l-4 border-brand-500 pl-6">
              {data.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (Content) */}
            <div className="lg:col-span-8 space-y-12">
               {/* Diagram */}
               <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
                <div className="bg-dark-bg/50 p-4 border-b border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Layers size={18} className="text-brand-400"/>
                    <span>Visualization</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">Mermaid.js</span>
                </div>
                <div className="p-1">
                  <MermaidDiagram chart={data.diagramMermaid} />
                </div>
              </div>

              {/* Concepts List */}
              <div className="space-y-8">
                {data.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-900/20 flex items-center justify-center border border-brand-800/30 group-hover:border-brand-500/50 transition-colors">
                        <DynamicIcon name={concept.icon} className="text-brand-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-100">{concept.title}</h3>
                    </div>
                    <div className="prose prose-invert prose-brand max-w-none text-gray-400 bg-dark-card/50 p-6 rounded-xl border border-transparent hover:border-dark-border transition-all">
                      <div dangerouslySetInnerHTML={{ __html: concept.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-200">$1</strong>') }} />
                      
                      {/* Code Snippet Playground */}
                      {concept.codeSnippet && (
                        <CodePlayground 
                          initialCode={concept.codeSnippet.code} 
                          language={concept.codeSnippet.language} 
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

               {/* Use Cases Grid */}
               <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-brand-400" /> Common Use Cases
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {data.commonUseCases.map((useCase, i) => (
                       <div key={i} className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                          <span className="text-gray-300">{useCase}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Pitfalls Section */}
               <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" /> Common Pitfalls
                  </h3>
                  <div className="space-y-3">
                     {data.pitfalls.map((pitfall, i) => (
                       <div key={i} className="flex items-start gap-3">
                          <span className="text-red-500/50 font-mono mt-1">0{i+1}</span>
                          <p className="text-gray-300">{pitfall}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Quiz Section */}
               <QuizCard quiz={data.quiz} />

               {/* Hot Take Section */}
               <div className="bg-orange-900/10 border border-orange-500/30 p-6 rounded-2xl flex gap-4 items-start">
                  <div className="bg-orange-500/20 p-3 rounded-full shrink-0">
                    <Flame className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-orange-400 font-bold text-lg mb-2">Engineering Hot Take</h3>
                    <p className="text-gray-300 italic text-lg leading-relaxed">
                      "{data.hotTake}"
                    </p>
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN (Sidebar) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Context Card */}
              <div className="bg-dark-card p-6 rounded-2xl border border-dark-border">
                <div className="flex items-center gap-2 mb-4 text-brand-400">
                  <Clock size={20} />
                  <h3 className="font-bold">History</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {data.historicalContext}
                </p>
              </div>

               {/* Real World Application */}
               <div className="bg-gradient-to-br from-brand-900/20 to-dark-card border border-brand-900/30 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={80} />
                </div>
                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="text-green-400" size={18} />
                  Real World Use
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                  {data.realWorldExample}
                </p>
              </div>

              {/* Rabbit Holes (Infinite Scroll) */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-white mb-2 pt-4 border-t border-dark-border">
                    <Rabbit size={20} className="text-purple-400" />
                    <h3 className="font-bold">Down the Rabbit Hole</h3>
                 </div>
                 {data.rabbitHoles.map((hole, i) => (
                   <button
                    key={i}
                    onClick={() => performSearch(hole.topic)}
                    className="w-full text-left bg-dark-card hover:bg-dark-card/80 p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all group relative overflow-hidden"
                   >
                     <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
                     <span className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1 block">{hole.type}</span>
                     <h4 className="text-white font-medium mb-1 group-hover:text-purple-200 transition-colors">{hole.hook}</h4>
                     <div className="text-xs text-gray-500 flex items-center gap-1">
                       <ArrowRight size={12} /> {hole.topic}
                     </div>
                   </button>
                 ))}
              </div>

            </div>
          </div>
        </main>
      )}

      {/* Floating Chat */}
      {data && <ChatInterface topic={data.topic} level={data.expertiseLevel} />}

      {/* Interview Modal */}
      {showInterview && data && (
        <InterviewSession 
          topic={data.topic} 
          level={data.expertiseLevel} 
          onClose={() => setShowInterview(false)} 
        />
      )}

      {/* Interview Mastery Guide */}
      {showPrepGuide && data && (
        <InterviewPrepGuide
          topic={data.topic}
          level={data.expertiseLevel}
          onClose={() => setShowPrepGuide(false)}
        />
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full py-2 bg-dark-bg/80 backdrop-blur text-center text-xs text-gray-600 border-t border-dark-border z-30 pointer-events-none">
        <span className="pointer-events-auto">DeepDive © 2024 • Powered by Gemini</span>
      </footer>
    </div>
  );
};

export default App;
