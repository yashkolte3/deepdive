import React, { useState } from 'react';
import { Trophy, XCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Quiz } from '../types';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (isRevealed) return;
    setSelected(idx);
    setIsRevealed(true);
  };

  return (
    <div className="glass-card rounded-[32px] overflow-hidden">
      <div className="bg-white/5 p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-bold">
          <Trophy className="text-yellow-400 fill-yellow-400/20" size={24} />
          <span className="text-lg">Knowledge Check</span>
        </div>
        <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full font-medium">Interactive</span>
      </div>
      
      <div className="p-8">
        <h4 className="text-xl text-white font-medium mb-8 leading-relaxed max-w-3xl">{quiz.question}</h4>
        
        <div className="space-y-3">
          {quiz.options.map((option, idx) => {
            let stateClass = "border-white/10 bg-white/5 hover:bg-white/10";
            let icon = <div className="w-5 h-5 rounded-full border border-white/30" />;

            if (isRevealed) {
              if (idx === quiz.correctIndex) {
                stateClass = "border-green-500/50 bg-green-500/20";
                icon = <CheckCircle className="text-green-400" size={20} />;
              } else if (idx === selected) {
                stateClass = "border-red-500/50 bg-red-500/20";
                icon = <XCircle className="text-red-400" size={20} />;
              } else {
                stateClass = "border-white/5 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4 ${stateClass}`}
              >
                {icon}
                <span className="text-white/90 text-lg">{option}</span>
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl animate-fade-in">
            <div className="flex items-start gap-4">
              <HelpCircle className="text-blue-400 shrink-0 mt-1" size={24} />
              <div>
                <p className="font-bold text-white text-lg mb-2">
                  {selected === quiz.correctIndex ? "Correct!" : "Not quite right."}
                </p>
                <p className="text-white/70 text-base leading-relaxed">
                  {quiz.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
