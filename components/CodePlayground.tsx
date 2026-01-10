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
    <div className="mt-4 rounded-xl overflow-hidden border border-brand-900/50 bg-[#0d1117] shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-brand-900/30">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-brand-400" />
          <span className="text-xs font-mono text-gray-400 uppercase">{language} snippet</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleReset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Code"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={handleRun}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
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
          className="w-full h-48 bg-[#0d1117] text-gray-300 font-mono text-sm p-4 focus:outline-none resize-y"
          spellCheck={false}
        />
        <div className="absolute top-0 right-0 pointer-events-none p-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-gray-600 font-mono">Editable</span>
        </div>
      </div>

      {/* Output Terminal */}
      {(output || loading) && (
        <div className="border-t border-brand-900/30 bg-[#010409]">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/5">
            <Terminal size={12} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono uppercase">Console Output</span>
          </div>
          <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
            {loading ? (
              <span className="animate-pulse text-gray-500">Executing...</span>
            ) : (
              output
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
