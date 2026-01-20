
import React from 'react';
import { RabbitHole } from '../types';
import { ArrowRight, Sparkles, Compass, Loader2 } from 'lucide-react';

interface RelatedTopicsCarouselProps {
  topics: RabbitHole[];
  onSelect: (topic: string) => void;
  loading?: boolean;
}

export const RelatedTopicsCarousel: React.FC<RelatedTopicsCarouselProps> = ({ topics, onSelect, loading = false }) => {
  if (!topics || topics.length === 0) return null;

  // Type-based styling with proper fallback
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Deep Dive':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'Related':
        return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
      case 'Prerequisite':
        return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
      case 'Similar':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
      default:
        // Fallback for deprecated 'Tangent' or unknown types
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="w-full animate-fade-in">
       <div className="flex items-center gap-3 mb-6">
         <Compass className="text-white/50" size={24} />
         <h3 className="text-xl font-semibold text-white tracking-tight">
           Continue Your Journey
         </h3>
       </div>
       
       <div className="flex gap-5 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
         {topics.map((topic, idx) => (
           <button 
             key={idx}
             onClick={() => !loading && onSelect(topic.topic)}
             disabled={loading}
             className={`glass-card min-w-[320px] max-w-[320px] rounded-[32px] p-8 text-left transition-all group snap-center flex flex-col justify-between relative overflow-hidden
               ${loading 
                 ? 'opacity-50 cursor-wait' 
                 : 'hover:border-white/20 cursor-pointer'
               }`}
           >
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={64} />
             </div>

             <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-4 inline-block border ${getBadgeStyle(topic.type)}`}>
                  {topic.type}
                </span>
                <h4 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-blue-200 transition-colors">
                  {topic.hook}
                </h4>
             </div>
             
             <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-xs text-white/50 font-mono group-hover:text-white/80 transition-colors">
                 {topic.topic}
               </span>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  {loading ? (
                    <Loader2 size={14} className="text-white/40 animate-spin" />
                  ) : (
                    <ArrowRight size={14} className="text-white/40 group-hover:text-white transition-colors" />
                  )}
               </div>
             </div>
           </button>
         ))}
       </div>
    </div>
  );
};
