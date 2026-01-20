
import React from 'react';
import { Layers, Activity, Clock, Sparkles, CheckCircle, AlertTriangle, Flame, ArrowRight, MessageCircleQuestion, GraduationCap, Award, TrendingUp } from 'lucide-react';
import { LessonData, ExpertiseLevel } from '../types';
import { MermaidDiagram } from './MermaidDiagram';
import { DynamicIcon } from './Icons';
import { CodePlayground } from './CodePlayground';
import { QuizCard } from './QuizCard';
import { RelatedTopicsCarousel } from './RelatedTopicsCarousel';
import { ScrollReveal } from './ScrollReveal';
import { TTSPlayer } from './TTSPlayer';

interface LessonViewProps {
  data: LessonData;
  onSearch: (topic: string) => void;
  onOpenPrepGuide: () => void;
  onOpenInterview: () => void;
  onFollowUpClick: (question: string) => void;
  loadingRelated?: boolean;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  data, 
  onSearch, 
  onOpenPrepGuide, 
  onOpenInterview,
  onFollowUpClick,
  loadingRelated 
}) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 pb-32">
      
      {/* 1. HEADER SECTION - VisionOS Style */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-8 pb-6 border-b border-white/10">
          <div className="flex-1">
             <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4 drop-shadow-lg leading-tight">
              {data.topic}
             </h1>
             <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-3xl tracking-wide">
               {data.summary}
             </p>
             
             {/* Metadata Pills */}
             <div className="flex flex-wrap items-center gap-3 mt-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-md border shadow-sm ${
                  data.expertiseLevel === ExpertiseLevel.EL5 ? 'bg-pink-500/20 text-pink-100 border-pink-500/30' :
                  data.expertiseLevel === ExpertiseLevel.JUNIOR ? 'bg-blue-500/20 text-blue-100 border-blue-500/30' :
                  data.expertiseLevel === ExpertiseLevel.SENIOR ? 'bg-purple-500/20 text-purple-100 border-purple-500/30' :
                  'bg-amber-500/20 text-amber-100 border-amber-500/30'
                }`}>
                  {data.expertiseLevel}
                </span>
                <span className="px-4 py-1.5 bg-white/10 text-white/70 text-xs font-semibold rounded-full border border-white/10 uppercase tracking-wide flex items-center gap-1.5 shadow-sm">
                   <TrendingUp size={14} /> {data.popularity}
                </span>
                <TTSPlayer text={data.summary} className="ml-2" />
             </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={onOpenPrepGuide}
              className="group relative bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-xl shadow-lg"
            >
              <GraduationCap size={16} className="text-blue-300" />
              <span>Mastery Guide</span>
            </button>
            <button 
              onClick={onOpenInterview}
              className="group relative bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-xl shadow-lg"
            >
              <Award size={16} className="text-green-300" />
              <span>Mock Interview</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. MAIN GRID - Cards as Glass Panes */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-12 gap-6 auto-rows-min">
        
        {/* ROW 1: Diagram (Main Visual) & History/Context */}
        
        {/* Diagram Area - Spans 8 cols on XL */}
        <div className="md:col-span-3 xl:col-span-8">
          <ScrollReveal delay={100} className="h-full">
            <div className="glass-card rounded-[32px] overflow-hidden flex flex-col min-h-[450px] h-full">
              <div className="px-8 py-5 border-b border-white/10 flex items-center gap-2 bg-white/5">
                 <Layers size={18} className="text-white/50" />
                 <span className="text-xs font-bold text-white/50 tracking-widest uppercase">System Architecture</span>
              </div>
              <div className="p-4 bg-black/20 grow flex items-center justify-center">
                <MermaidDiagram chart={data.diagramMermaid} />
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Context & Real World - Spans 4 cols on XL */}
        <div className="md:col-span-3 xl:col-span-4 flex flex-col gap-6">
           {/* History Card */}
           <ScrollReveal delay={200} className="grow">
             <div className="glass-card rounded-[32px] p-8 h-full flex flex-col">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2 text-white/50">
                   <Clock size={18} />
                   <span className="text-xs font-bold uppercase tracking-widest">Origin Story</span>
                 </div>
                 <TTSPlayer text={data.historicalContext} />
               </div>
               <p className="text-white/80 leading-loose text-base md:text-lg font-light grow">
                 {data.historicalContext}
               </p>
             </div>
           </ScrollReveal>
           
           {/* Real World Card */}
           <ScrollReveal delay={300} className="grow">
             <div className="glass-card rounded-[32px] p-8 h-full relative overflow-hidden group flex flex-col">
                <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                  <Activity size={140} className="text-emerald-400" />
                </div>
                <div className="flex items-center justify-between mb-4 text-emerald-300 relative z-10">
                   <div className="flex items-center gap-2">
                     <Sparkles size={18} />
                     <span className="text-xs font-bold uppercase tracking-widest">Real World</span>
                   </div>
                   <TTSPlayer text={data.realWorldExample} />
               </div>
               <p className="text-white/90 font-normal leading-loose relative z-10 text-lg md:text-xl grow">
                 {data.realWorldExample}
               </p>
             </div>
           </ScrollReveal>
        </div>


        {/* ROW 2: Core Concepts */}
        <div className="md:col-span-3 lg:col-span-4 xl:col-span-12 mt-8">
           <ScrollReveal>
              <h2 className="text-3xl font-semibold text-white mb-8 tracking-tight">Core Concepts</h2>
           </ScrollReveal>
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {data.coreConcepts.map((concept, idx) => (
              <ScrollReveal key={idx} delay={100 + (idx * 100)}>
                <div className="glass-card rounded-[32px] overflow-hidden flex flex-col h-full">
                  <div className="p-10 border-b border-white/5 flex items-start gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white border border-white/10 shadow-inner shrink-0">
                       <DynamicIcon name={concept.icon} className="w-8 h-8" />
                     </div>
                     <div className="w-full">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{concept.title}</h3>
                          <TTSPlayer text={`${concept.title}. ${concept.content}`} />
                        </div>
                        
                        {/* Enhanced ProseMirror / Content Block */}
                        <div className="prose prose-invert max-w-none 
                          prose-p:text-lg md:prose-p:text-xl prose-p:text-white/80 prose-p:font-light prose-p:leading-9
                          prose-headings:text-white/90 prose-headings:font-semibold
                          prose-strong:text-white prose-strong:font-medium
                          prose-ul:text-white/80 prose-li:marker:text-white/40 prose-li:my-2
                          prose-code:text-blue-200 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none">
                            <div dangerouslySetInnerHTML={{ __html: concept.content }} />
                        </div>
                     </div>
                  </div>
                  
                  {concept.codeSnippet && (
                     <div className="p-2 bg-black/20 mt-auto">
                       <CodePlayground 
                          initialCode={concept.codeSnippet.code} 
                          language={concept.codeSnippet.language} 
                        />
                     </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ROW 3: Secondary Info */}
        <div className="md:col-span-3 xl:col-span-12 grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
            {/* Use Cases */}
            <ScrollReveal delay={100} className="h-full">
              <div className="glass-card rounded-[32px] p-8 h-full">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <CheckCircle className="text-blue-400 fill-blue-400/20" size={24} /> Use Cases
                </h3>
                <div className="space-y-4">
                  {data.commonUseCases.map((uc, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                      <span className="text-white/80 text-lg font-medium">{uc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Pitfalls */}
            <ScrollReveal delay={200} className="h-full">
              <div className="glass-card rounded-[32px] p-8 h-full">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <AlertTriangle className="text-red-400 fill-red-400/20" size={24} /> Anti-Patterns
                </h3>
                <div className="space-y-4">
                  {data.pitfalls.map((pf, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-red-400 font-mono text-xs mt-1.5 opacity-70">0{i+1}</span>
                      <span className="text-white/80 text-lg font-light">{pf}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Hot Take */}
            <ScrollReveal delay={300} className="h-full">
              <div className="glass-card rounded-[32px] p-8 relative overflow-hidden flex flex-col h-full">
                 <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Flame size={150} />
                 </div>
                <div className="flex items-center gap-2 mb-4 text-orange-300">
                  <Flame size={20} className="fill-orange-400/20" />
                  <span className="text-xs font-bold uppercase tracking-widest">Hot Take</span>
                </div>
                <p className="text-xl md:text-2xl text-white/95 italic font-light leading-relaxed relative z-10 my-auto">
                  "{data.hotTake}"
                </p>
                <div className="mt-4 relative z-10">
                   <TTSPlayer text={data.hotTake} />
                </div>
             </div>
           </ScrollReveal>
        </div>

        {/* Quiz Section */}
        <div className="md:col-span-3 xl:col-span-12 mt-8">
           <ScrollReveal>
             <QuizCard quiz={data.quiz} />
           </ScrollReveal>
        </div>

        {/* ROW 4: Footer Navigation */}
        <div className="md:col-span-3 xl:col-span-12 pt-10 border-t border-white/10 mt-12">
           <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Follow Up Questions Sidebar */}
              <div className="xl:col-span-1 flex flex-col">
                 <ScrollReveal>
                   <div className="flex items-center gap-3 mb-6">
                      <MessageCircleQuestion size={24} className="text-white/50" />
                      <h3 className="text-xl font-semibold text-white tracking-tight">Deepen Knowledge</h3>
                   </div>
                   
                   <div className="space-y-3">
                     {data.followUpSuggestions.map((question, i) => (
                       <button
                        key={i}
                        onClick={() => onFollowUpClick(question)}
                        className="w-full text-left bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group backdrop-blur-sm"
                       >
                         <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors leading-snug">
                           "{question}"
                         </p>
                       </button>
                     ))}
                   </div>
                 </ScrollReveal>
              </div>

              {/* Carousel */}
              <div className="xl:col-span-3">
                 <ScrollReveal delay={200}>
                   <RelatedTopicsCarousel 
                     topics={data.rabbitHoles} 
                     onSelect={onSearch}
                     loading={loadingRelated} 
                   />
                 </ScrollReveal>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
