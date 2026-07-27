import React from 'react';
import { Bot, Cpu, Sparkles } from 'lucide-react';
import { BorderBeam } from './ui/BorderBeam';
import { DecryptedText } from './ui/DecryptedText';

interface AiReviewTerminalProps {
  summary?: string;
  score?: number;
}

export const AiReviewTerminal: React.FC<AiReviewTerminalProps> = ({
  summary = 'Prompt structure complete, input constraints satisfied, generated code has no high-risk logic vulnerabilities.',
  score = 95,
}) => {
  return (
    <div className="relative my-6 rounded-xl border border-vibe-purple/40 bg-vibe-card/90 overflow-hidden p-0.5">
      <BorderBeam size={250} duration={6} colorFrom="#06B6D4" colorTo="#A855F7" />
      <div className="bg-vibe-bg/95 rounded-[10px] p-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-vibe-border pb-2.5 mb-3">
          <span className="text-vibe-purple font-semibold flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            <DecryptedText text="AI Co-Pilot Automated Review System" speed={30} />
          </span>
          <span className="text-vibe-emerald flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Score: {score}/100
          </span>
        </div>
        <div className="p-3 rounded bg-vibe-surface border border-vibe-border text-slate-300">
          <p className="text-vibe-cyan mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> [Analysis Output]
          </p>
          <p className="text-slate-400">{summary}</p>
        </div>
      </div>
    </div>
  );
};
