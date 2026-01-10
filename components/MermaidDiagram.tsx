import React, { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

declare global {
  interface Window {
    mermaid: any;
  }
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.mermaid && containerRef.current) {
      window.mermaid.initialize({ 
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'JetBrains Mono',
        logLevel: 'error',
      });
      
      const renderDiagram = async () => {
        try {
          // Sanitize input to fix common LLM mistakes
          let cleanChart = chart
            .replace(/```mermaid/g, '')
            .replace(/```/g, '')
            // Fix capitalization that breaks parser (e.g. Subgraph -> subgraph)
            .replace(/\bSubgraph\b/g, 'subgraph')
            .replace(/\bGraph\b/g, 'graph')
            .replace(/\bEnd\b/g, 'end')
            // Fix direction casing (graph td -> graph TD) which causes lexical errors in some versions
            .replace(/graph\s+td\b/i, 'graph TD')
            .replace(/graph\s+lr\b/i, 'graph LR')
            .replace(/graph\s+tb\b/i, 'graph TB')
            .replace(/graph\s+bt\b/i, 'graph BT')
            .replace(/graph\s+rl\b/i, 'graph RL')
             // Ensure graph direction has space if missing (e.g., graphTD)
            .replace(/^graph([A-Z])/, 'graph $1')
            .trim();

          // Unique ID for each render to avoid conflicts
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // Clear previous content
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
          
          const { svg } = await window.mermaid.render(id, cleanChart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid render error for chart:', chart, error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="text-red-400 text-xs font-mono p-2 border border-red-900 bg-red-900/10 rounded overflow-auto">
              Failed to render diagram structure.
            </div>`;
          }
        }
      };

      renderDiagram();
    }
  }, [chart]);

  return (
    <div className="w-full overflow-x-auto p-4 bg-dark-bg/50 rounded-lg border border-brand-900/50 flex justify-center">
      <div ref={containerRef} className="mermaid-container w-full flex justify-center" />
    </div>
  );
};