import React, { useState } from 'react';
import { Play, RotateCcw, Terminal, Code2 } from 'lucide-react';
import { executeCodeSnippet } from '../services/geminiService';

interface CodePlaygroundProps {
  initialCode: string;
  language: string;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({ initialCode, language }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const result = await executeCodeSnippet(code, language);
      setOutput(result);
    } catch (e) {
      setOutput("Error: Could not execute code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
  };

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <Code2 size={14} className="text-white/40" />
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider">{language}</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleReset}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Code"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={handleRun}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 border border-white/5"
          >
            <Play size={12} className="fill-current" />
            {loading ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative group">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-48 bg-transparent text-blue-100 font-mono text-sm p-5 focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
        <div className="absolute top-0 right-0 pointer-events-none p-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-white/20 font-mono">Editable</span>
        </div>
      </div>

      {/* Output Terminal */}
      {(output || loading) && (
        <div className="border-t border-white/10 bg-black/50">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/5">
            <Terminal size={12} className="text-white/40" />
            <span className="text-[10px] text-white/40 font-mono uppercase">Console Output</span>
          </div>
          <pre className="p-5 text-sm font-mono text-green-400/90 overflow-x-auto whitespace-pre-wrap">
            {loading ? (
              <span className="animate-pulse text-white/40">Executing...</span>
            ) : (
              output
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
