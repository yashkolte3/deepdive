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
    <div className="bg-dark-card rounded-2xl border border-brand-900/50 overflow-hidden shadow-xl">
      <div className="bg-gradient-to-r from-brand-900/50 to-dark-bg p-4 border-b border-brand-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold">
          <Trophy className="text-yellow-400" size={20} />
          <span>Knowledge Check</span>
        </div>
        <span className="text-xs text-brand-300 bg-brand-900/50 px-2 py-1 rounded">Interactive</span>
      </div>
      
      <div className="p-6">
        <h4 className="text-lg text-gray-100 font-medium mb-6">{quiz.question}</h4>
        
        <div className="space-y-3">
          {quiz.options.map((option, idx) => {
            let stateClass = "border-dark-border hover:border-brand-500 hover:bg-dark-bg/80";
            let icon = <div className="w-5 h-5 rounded-full border border-gray-500" />;

            if (isRevealed) {
              if (idx === quiz.correctIndex) {
                stateClass = "border-green-500 bg-green-900/20";
                icon = <CheckCircle className="text-green-500" size={20} />;
              } else if (idx === selected) {
                stateClass = "border-red-500 bg-red-900/20";
                icon = <XCircle className="text-red-500" size={20} />;
              } else {
                stateClass = "border-dark-border opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${stateClass}`}
              >
                {icon}
                <span className="text-gray-200">{option}</span>
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="mt-6 p-4 bg-brand-900/20 border border-brand-500/30 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-brand-400 shrink-0 mt-1" size={20} />
              <div>
                <p className="font-bold text-brand-300 mb-1">
                  {selected === quiz.correctIndex ? "Correct!" : "Not quite right."}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
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
