
import React from 'react';
import { ComparisonData } from '../types';
import { ScrollReveal } from './ScrollReveal';
import { Swords, Scale, GitMerge, CheckCircle, XCircle } from 'lucide-react';

interface ComparisonViewProps {
  data: ComparisonData;
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ data, onClose }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 pb-32">
      
      {/* HEADER */}
      <ScrollReveal>
        <div className="flex flex-col items-center justify-center mb-16 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
           
           <div className="flex items-center gap-6 md:gap-12 relative z-10">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter text-center max-w-[300px] leading-tight">
                {data.topicA}
              </h1>
              <div className="flex flex-col items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] border border-white/20">
                    <Swords className="text-white" size={32} />
                 </div>
                 <span className="font-mono text-white/50 text-xs mt-2 tracking-widest uppercase">Versus</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter text-center max-w-[300px] leading-tight">
                {data.topicB}
              </h1>
           </div>

           <p className="mt-8 text-xl text-white/70 max-w-3xl text-center font-light leading-relaxed">
             {data.overview}
           </p>
        </div>
      </ScrollReveal>

      {/* VERDICT CARD */}
      <ScrollReveal delay={100}>
        <div className="glass-card rounded-[32px] p-8 md:p-12 mb-12 border-l-4 border-l-blue-500">
           <h3 className="flex items-center gap-3 text-2xl font-bold text-white mb-4">
             <Scale className="text-blue-400" size={28} />
             The Verdict
           </h3>
           <p className="text-lg md:text-xl text-white/90 font-light leading-loose">
             {data.verdict}
           </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* SHARED DNA (Similarities) */}
        <div className="xl:col-span-4">
           <ScrollReveal delay={200} className="h-full">
             <div className="glass-card rounded-[32px] p-8 h-full bg-gradient-to-b from-white/5 to-transparent">
               <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-8">
                 <GitMerge className="text-emerald-400" size={24} />
                 Shared DNA
               </h3>
               <div className="space-y-4">
                 {data.similarities.map((sim, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                     <CheckCircle className="text-emerald-400/80 shrink-0 mt-0.5" size={18} />
                     <p className="text-white/80 text-sm leading-relaxed">{sim}</p>
                   </div>
                 ))}
               </div>
             </div>
           </ScrollReveal>
        </div>

        {/* HEAD TO HEAD (Differences) */}
        <div className="xl:col-span-8">
          <ScrollReveal delay={300} className="h-full">
            <div className="glass-card rounded-[32px] overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-white/10 bg-white/5">
                <h3 className="text-xl font-bold text-white">Head-to-Head</h3>
              </div>
              <div className="grow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-black/20">
                      <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-wider w-1/4">Feature</th>
                      <th className="p-6 text-sm font-bold text-white/90 w-1/3">{data.topicA}</th>
                      <th className="p-6 text-sm font-bold text-white/90 w-1/3 border-l border-white/5">{data.topicB}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.differences.map((diff, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6 text-sm font-medium text-blue-200/80 align-top">{diff.feature}</td>
                        <td className="p-6 text-sm text-white/70 leading-relaxed align-top">{diff.topicAValue}</td>
                        <td className="p-6 text-sm text-white/70 leading-relaxed border-l border-white/5 align-top">{diff.topicBValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* USE CASE BATTLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
         <ScrollReveal delay={400}>
            <div className="glass-card rounded-[32px] p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <h2 className="text-8xl font-bold text-white">{data.topicA[0]}</h2>
               </div>
               <h3 className="text-lg font-bold text-white mb-6">When to use {data.topicA}</h3>
               <ul className="space-y-3">
                 {data.topicAUseCases.map((uc, i) => (
                   <li key={i} className="flex items-center gap-3 text-white/70">
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                     {uc}
                   </li>
                 ))}
               </ul>
            </div>
         </ScrollReveal>

         <ScrollReveal delay={500}>
            <div className="glass-card rounded-[32px] p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <h2 className="text-8xl font-bold text-white">{data.topicB[0]}</h2>
               </div>
               <h3 className="text-lg font-bold text-white mb-6">When to use {data.topicB}</h3>
                <ul className="space-y-3">
                 {data.topicBUseCases.map((uc, i) => (
                   <li key={i} className="flex items-center gap-3 text-white/70">
                     <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0" />
                     {uc}
                   </li>
                 ))}
               </ul>
            </div>
         </ScrollReveal>
      </div>

    </div>
  );
};
