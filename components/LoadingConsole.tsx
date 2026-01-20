import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Network, Database, Code2, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { text: "Initializing neural link...", icon: Terminal },
  { text: "Analyzing semantic context...", icon: Network },
  { text: "Retrieving historical patterns...", icon: Database },
  { text: "Synthesizing code examples...", icon: Code2 },
  { text: "Optimizing learning path...", icon: Cpu },
];

export const LoadingConsole: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 800); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mt-20 animate-fade-in">
      <div className="bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-5 py-3 border-b border-white/5 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-xs font-mono text-white/30 ml-auto">processing</span>
        </div>
        
        <div className="p-8 space-y-5 font-mono text-sm">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            const isPending = idx > currentStep;

            return (
              <div 
                key={idx} 
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isPending ? 'opacity-20 blur-[1px]' : 'opacity-100'
                }`}
              >
                <div className={`w-6 flex justify-center ${isActive ? 'animate-pulse text-blue-400' : isDone ? 'text-green-400' : 'text-gray-600'}`}>
                   {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span className={`${isActive ? 'text-white' : isDone ? 'text-white/50' : 'text-white/20'}`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
