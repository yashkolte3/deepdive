
import React, { useState, useRef } from 'react';
import { Search, ChevronLeft, Sparkles, Command, Swords, ArrowRightLeft, TrendingUp, ChevronDown, RefreshCw, Linkedin, Github } from 'lucide-react';
import { generateLesson, generateComparison, generateTrendingTopics } from './services/geminiService';
import { ExpertiseLevel, LessonData, ComparisonData } from './types';
import { ChatInterface } from './components/ChatInterface';
import { InterviewSession } from './components/InterviewSession';
import { InterviewPrepGuide } from './components/InterviewPrepGuide';
import { LoadingConsole } from './components/LoadingConsole';
import { LessonView } from './components/LessonView';
import { ComparisonView } from './components/ComparisonView';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [mode, setMode] = useState<'learn' | 'compare'>('learn');
  
  // Learn Mode State
  const [topic, setTopic] = useState('');
  const [lessonHistory, setLessonHistory] = useState<LessonData[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  
  // Compare Mode State
  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  // Trending State
  const [trendingDomain, setTrendingDomain] = useState("General Tech");
  const [trendingTopics, setTrendingTopics] = useState([
    'System Design', 'LLM Architecture', 'Rust vs Go', 
    'Kubernetes Internals', 'React Server Components', 
    'Event-Driven Architecture', 'Database Sharding'
  ]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Shared State
  const [level, setLevel] = useState<ExpertiseLevel>(ExpertiseLevel.JUNIOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Overlays
  const [showInterview, setShowInterview] = useState(false);
  const [showPrepGuide, setShowPrepGuide] = useState(false);
  const [triggerChatQuestion, setTriggerChatQuestion] = useState<string | null>(null);
  
  const isSearchingRef = useRef(false);

  // Active Data Derivation
  const activeLesson = currentHistoryIndex >= 0 ? lessonHistory[currentHistoryIndex] : null;
  const isContentActive = (mode === 'learn' && activeLesson) || (mode === 'compare' && comparisonData);

  const performSearch = async (searchTopic: string, overrideLevel?: ExpertiseLevel) => {
    if (!searchTopic.trim() || isSearchingRef.current) return;
    
    isSearchingRef.current = true;
    setLoading(true);
    setError(null);
    setTopic(searchTopic);
    
    // Use override level if provided, otherwise current state
    const searchLevel = overrideLevel || level;

    try {
      const result = await generateLesson(searchTopic, searchLevel);
      
      setLessonHistory(prev => {
        const currentPath = prev.slice(0, currentHistoryIndex + 1);
        return [...currentPath, result];
      });
      setCurrentHistoryIndex(prev => prev + 1);
      setMode('learn');
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to generate the lesson plan. Please check your API key or try again.");
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  const performComparison = async (overrideLevel?: ExpertiseLevel) => {
    if (!topicA.trim() || !topicB.trim() || isSearchingRef.current) return;
    
    isSearchingRef.current = true;
    setLoading(true);
    setError(null);

    const searchLevel = overrideLevel || level;

    try {
      const result = await generateComparison(topicA, topicB, searchLevel);
      setComparisonData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to generate comparison.");
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  const handleTrendingRefresh = async () => {
    if(!trendingDomain.trim() || loadingTrending) return;
    setLoadingTrending(true);
    try {
        const topics = await generateTrendingTopics(trendingDomain);
        setTrendingTopics(topics);
    } catch(e) {
        console.error(e);
    } finally {
        setLoadingTrending(false);
    }
  };

  const handleLevelChange = (newLevel: ExpertiseLevel) => {
    setLevel(newLevel);
    
    // If we are currently viewing content, regenerate it with the new level
    if (!loading) {
      if (mode === 'learn' && activeLesson) {
        performSearch(activeLesson.topic, newLevel);
      } else if (mode === 'compare' && comparisonData) {
        performComparison(newLevel);
      }
    }
  };

  const handleBack = () => {
    if (mode === 'learn' && currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (mode === 'compare') {
       setComparisonData(null);
       setTopicA('');
       setTopicB('');
    }
  };

  const handleGoHome = () => {
    setTopic('');
    setTopicA('');
    setTopicB('');
    setLessonHistory([]);
    setComparisonData(null);
    setCurrentHistoryIndex(-1);
    setMode('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action();
  };

  const handleFollowUpClick = (question: string) => {
    setTriggerChatQuestion(question);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/20 selection:text-blue-900 flex flex-col relative overflow-hidden">
      
      {/* Background Decor Elements - Dark Mode */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[160px]" />
      </div>

      {/* Glass Header */}
      <div className={`sticky top-0 z-40 transition-all duration-500 glass-panel ${isContentActive ? 'py-4' : 'py-0 h-0 overflow-hidden border-none'}`}>
        <div className="max-w-[1600px] mx-auto px-6 flex items-center gap-4">
           {((mode === 'learn' && currentHistoryIndex > 0) || (mode === 'compare')) && (
              <button 
                onClick={handleBack}
                disabled={loading}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30"
                title="Go Back"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <button 
              onClick={handleGoHome}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" />
            </button>

            {mode === 'learn' ? (
                <div className="flex-1 max-w-xl flex items-center bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-3 transition-colors group">
                    <Search className="text-white/40 group-focus-within:text-white/80 transition-colors" size={16} />
                    <input 
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, () => performSearch(topic))}
                      disabled={loading}
                      placeholder="Search concepts..."
                      className="w-full bg-transparent border-none p-2 text-sm text-white focus:ring-0 placeholder-white/30 disabled:opacity-50"
                    />
                </div>
            ) : (
                <div className="flex-1 max-w-xl flex items-center justify-center text-white/50 text-sm font-medium">
                   <Swords size={14} className="mr-2 opacity-50" />
                   Comparing <span className="text-white mx-1">{topicA}</span> vs <span className="text-white mx-1">{topicB}</span>
                </div>
            )}
             
             <div className="hidden md:block">
               <select 
                  value={level}
                  onChange={(e) => handleLevelChange(e.target.value as ExpertiseLevel)}
                  disabled={loading}
                  className="bg-white/5 border border-white/10 text-xs font-medium text-white/80 rounded-lg p-2 focus:outline-none cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  {Object.values(ExpertiseLevel).map((l) => (
                    <option key={l} value={l} className="bg-[#1c1c1e] text-white">{l}</option>
                  ))}
                </select>
             </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grow flex flex-col relative z-10">
        
        {/* LANDING STATE */}
        {!isContentActive && !loading && (
          <div className="grow flex flex-col items-center justify-center p-6 -mt-20 relative">
             <div className="w-full max-w-3xl text-center space-y-10 animate-fade-in flex flex-col items-center">
                
                <div className="space-y-6 flex flex-col items-center">
                  <Logo size="xl" />
                  
                  <p className="text-xl md:text-2xl text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
                    From high-level concepts to <span className="text-white/90 font-medium">system internals</span> in seconds.
                  </p>
                </div>

                {/* MODE TOGGLE TABS */}
                <div className="flex justify-center mb-4 mt-4">
                   <div className="bg-white/5 p-1 rounded-full flex gap-1 border border-white/10 shadow-inner">
                      <button 
                        onClick={() => setMode('learn')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'learn' ? 'bg-white text-black shadow-md border border-transparent' : 'text-white/50 hover:text-white'}`}
                      >
                        Learn
                      </button>
                      <button 
                         onClick={() => setMode('compare')}
                         className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'compare' ? 'bg-white text-black shadow-md border border-transparent' : 'text-white/50 hover:text-white'}`}
                      >
                        <Swords size={14} /> Compare
                      </button>
                   </div>
                </div>

                {/* SEARCH INPUTS */}
                <div className="relative group max-w-2xl mx-auto w-full transition-all duration-500">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  
                  {mode === 'learn' ? (
                      <div className="relative flex flex-col md:flex-row gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 shadow-2xl animate-fade-in ring-1 ring-white/5">
                        <div className="flex-1 flex items-center px-4">
                          <Search className="text-white/40" />
                          <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, () => performSearch(topic))}
                            placeholder="What do you want to learn today?"
                            className="w-full bg-transparent border-none p-4 text-white focus:ring-0 placeholder-white/30 text-lg"
                            autoFocus
                          />
                        </div>

                        {/* Level Selector */}
                        <div className="hidden md:flex items-center border-l border-white/10 px-4 relative group/select">
                          <select 
                            value={level}
                            onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                            className="appearance-none bg-transparent text-sm font-medium text-white/50 focus:outline-none cursor-pointer hover:text-white transition-colors pr-8 py-2"
                          >
                            {Object.values(ExpertiseLevel).map((l) => (
                              <option key={l} value={l} className="bg-[#1c1c1e] text-white">{l}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 text-white/30 pointer-events-none group-hover/select:text-white transition-colors" />
                        </div>

                        {/* Mobile Level Selector */}
                        <div className="md:hidden border-t border-white/10 p-2">
                           <select 
                             value={level}
                             onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                             className="w-full bg-white/5 text-white/80 font-medium text-sm focus:outline-none rounded-lg p-2"
                           >
                             {Object.values(ExpertiseLevel).map((l) => (
                               <option key={l} value={l} className="bg-[#1c1c1e] text-white">{l}</option>
                             ))}
                           </select>
                        </div>

                        <button 
                          onClick={() => performSearch(topic)}
                          className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-[20px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          Start
                        </button>
                      </div>
                  ) : (
                      <div className="relative flex flex-col gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[24px] p-2 shadow-2xl animate-fade-in ring-1 ring-white/5">
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="flex-1 flex items-center px-4 w-full bg-white/5 rounded-xl border border-white/10 focus-within:bg-white/10 focus-within:border-blue-400/50 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold mr-2 border border-blue-500/30">A</div>
                              <input 
                                  type="text"
                                  value={topicA}
                                  onChange={(e) => setTopicA(e.target.value)}
                                  placeholder="First Topic"
                                  className="w-full bg-transparent border-none p-3 text-white focus:ring-0 placeholder-white/30"
                                />
                            </div>
                            
                            <div className="text-white/30 px-2 flex items-center justify-center"><Swords size={20} /></div>

                            <div className="flex-1 flex items-center px-4 w-full bg-white/5 rounded-xl border border-white/10 focus-within:bg-white/10 focus-within:border-red-400/50 transition-colors">
                              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold mr-2 border border-red-500/30">B</div>
                              <input 
                                  type="text"
                                  value={topicB}
                                  onChange={(e) => setTopicB(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, () => performComparison())}
                                  placeholder="Second Topic"
                                  className="w-full bg-transparent border-none p-3 text-white focus:ring-0 placeholder-white/30"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 mt-1">
                           <div className="relative flex-1 md:flex-none flex items-center justify-center md:justify-start bg-white/5 rounded-xl border border-white/10 px-4 min-w-[200px]">
                                <select 
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value as ExpertiseLevel)}
                                    className="appearance-none bg-transparent text-white/70 font-medium text-sm focus:outline-none cursor-pointer w-full text-center md:text-left py-3 md:py-0"
                                >
                                    {Object.values(ExpertiseLevel).map((l) => (
                                    <option key={l} value={l} className="bg-[#1c1c1e] text-white">{l}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 text-white/30 pointer-events-none" />
                           </div>

                           <button 
                             onClick={() => performComparison()}
                             className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-[20px] font-semibold transition-all flex items-center justify-center gap-2 shadow-lg flex-1 md:flex-none"
                           >
                             Compare
                           </button>
                        </div>
                      </div>
                  )}
                </div>

                <div className="mt-12 w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in delay-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 text-white/40">
                          <TrendingUp size={16} />
                          <span className="text-xs font-bold uppercase tracking-widest">Trending in</span>
                        </div>
                        
                        <div className="relative group">
                          <input 
                            type="text" 
                            value={trendingDomain}
                            onChange={(e) => setTrendingDomain(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTrendingRefresh()}
                            className="bg-transparent border-b border-white/20 text-white text-sm font-medium px-1 py-0.5 w-[120px] focus:w-[180px] focus:outline-none focus:border-blue-500 transition-all text-center placeholder-white/20"
                            placeholder="Domain..."
                          />
                        </div>
                        
                        <button 
                          onClick={handleTrendingRefresh}
                          disabled={loadingTrending}
                          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${loadingTrending ? 'animate-spin text-white/40' : 'text-white/40 hover:text-white'}`}
                        >
                           <RefreshCw size={12} />
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 min-h-[50px]">
                        {loadingTrending ? (
                           [1,2,3,4,5].map(i => (
                             <div key={i} className="h-10 w-32 bg-white/10 rounded-full animate-pulse" />
                           ))
                        ) : (
                          trendingTopics.map((t) => (
                          <button 
                              key={t}
                              onClick={() => {
                                  if (mode === 'learn') {
                                      performSearch(t);
                                  } else {
                                      if (!topicA) setTopicA(t);
                                      else if (!topicB) setTopicB(t);
                                  }
                              }}
                              className="group relative px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full transition-all shadow-sm hover:shadow-md overflow-hidden"
                          >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative text-sm text-white/60 group-hover:text-white transition-colors">{t}</span>
                          </button>
                          ))
                        )}
                    </div>
                </div>
             </div>
             
             {/* Creator Badge - Subtle & Fixed Bottom */}
             <div className="fixed bottom-8 left-0 w-full flex justify-center pointer-events-none z-50 animate-fade-in delay-700">
                <div className="pointer-events-auto bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 rounded-full px-4 py-2 flex items-center gap-3 transition-transform hover:scale-105 hover:bg-white/10 cursor-default">
                  <span className="text-xs font-medium text-white/50">Built by <span className="text-white/90 font-semibold">Your Name</span></span>
                  <div className="h-3 w-px bg-white/20"></div>
                  <div className="flex gap-2">
                     <a href="#" className="text-white/40 hover:text-[#0077b5] transition-colors" title="LinkedIn"><Linkedin size={14} /></a>
                     <a href="#" className="text-white/40 hover:text-white transition-colors" title="GitHub"><Github size={14} /></a>
                  </div>
                </div>
             </div>

          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
           <div className="grow flex flex-col items-center justify-center">
             <LoadingConsole />
           </div>
        )}

        {/* LEARN VIEW */}
        {mode === 'learn' && activeLesson && !loading && (
           <LessonView 
             data={activeLesson}
             onSearch={performSearch}
             onOpenInterview={() => setShowInterview(true)}
             onOpenPrepGuide={() => setShowPrepGuide(true)}
             onFollowUpClick={handleFollowUpClick}
             loadingRelated={loading}
           />
        )}

        {/* COMPARE VIEW */}
        {mode === 'compare' && comparisonData && !loading && (
           <ComparisonView 
              data={comparisonData}
              onClose={() => setComparisonData(null)}
           />
        )}
      </div>

      {/* GLOBAL OVERLAYS (Only active in Learn Mode usually, but Chat could be global) */}
      {mode === 'learn' && activeLesson && (
        <ChatInterface 
          topic={activeLesson.topic} 
          level={activeLesson.expertiseLevel} 
          triggerQuestion={triggerChatQuestion}
          onTriggerHandled={() => setTriggerChatQuestion(null)}
        />
      )}

      {showInterview && activeLesson && (
        <InterviewSession 
          topic={activeLesson.topic} 
          level={activeLesson.expertiseLevel} 
          onClose={() => setShowInterview(false)} 
        />
      )}

      {showPrepGuide && activeLesson && (
        <InterviewPrepGuide
          topic={activeLesson.topic}
          level={activeLesson.expertiseLevel}
          onClose={() => setShowPrepGuide(false)}
        />
      )}
    </div>
  );
};

export default App;
