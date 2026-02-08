import { useState, useEffect } from "react";

interface MagicScrollProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MagicScroll({ content, isOpen, onClose }: MagicScrollProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy to Clipboard");

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setCopyStatus("Copy to Clipboard");
    } else {
      const timer = setTimeout(() => setIsRendered(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        setCopyStatus("Copied! ✅");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (err) {
      console.warn("Clipboard API failed, using fallback:", err);
      // Fallback: execCommand('copy') with hidden textarea
      try {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyStatus("Copied! ✅");
      } catch (fallbackErr) {
        setCopyStatus("Select text manually ⚠️");
      }
    }
    setTimeout(() => setCopyStatus("Copy to Clipboard"), 2000);
  };

  // Simple Markdown-style link parser for [text](url)
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a 
            key={i} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 underline font-semibold hover:text-indigo-800 transition-colors"
          >
            {match[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        isOpen ? "bg-slate-900/60 backdrop-blur-sm opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <style jsx>{`
        @keyframes unroll {
          0% {
            transform: scaleY(0.1) rotateX(-90deg);
            opacity: 0;
            max-height: 50px;
          }
          40% {
            transform: scaleY(0.4) rotateX(-45deg);
            opacity: 0.8;
          }
          100% {
            transform: scaleY(1) rotateX(0deg);
            opacity: 1;
            max-height: 80vh;
          }
        }

        .scroll-paper {
          background: #fdf6e3;
          background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px);
          background-size: 100% 24px;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.2),
            0 10px 10px -6px rgba(0, 0, 0, 0.2),
            inset 0 0 100px rgba(0,0,0,0.05);
          position: relative;
          transform-origin: top center;
          animation: unroll 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          border-left: 1px solid rgba(0,0,0,0.1);
          border-right: 1px solid rgba(0,0,0,0.1);
        }

        .scroll-header, .scroll-footer {
          height: 16px;
          background: linear-gradient(to bottom, #8b4513, #654321);
          width: 104%;
          position: absolute;
          left: -2%;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          z-index: 10;
        }

        .scroll-header { top: -8px; }
        .scroll-footer { bottom: -8px; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b4513;
          border-radius: 10px;
        }
      `}</style>

      <div 
        className="w-full max-w-sm scroll-paper rounded-sm p-6 pt-8 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scroll-header" />
        
        <div className="flex items-center justify-between mb-4 border-b border-amber-900/10 pb-2">
          <h2 className="font-serif text-lg font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wide">
            🏰 Alexandria Library
          </h2>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-amber-900/5 text-amber-900 hover:bg-amber-900/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="prose prose-sm prose-amber whitespace-pre-wrap font-serif text-amber-950/80 leading-relaxed text-[13px]">
            {renderContent(content)}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleCopy}
            className="w-full bg-amber-900 text-amber-50 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            {copyStatus.includes("✅") ? "✨" : "📜"} {copyStatus}
          </button>
          <p className="text-[10px] text-center text-amber-900/40 italic">
            Copy text to your clipboard or click sources to read more.
          </p>
        </div>

        <div className="scroll-footer" />
      </div>
    </div>
  );
}
