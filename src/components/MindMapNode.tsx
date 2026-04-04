'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ChevronRight, Link2 } from 'lucide-react';

interface MindMapNodeData {
  label: string;
  summary: string;
  details: string;
  isDerivative?: boolean;
}

function MindMapNodeComponent({ data }: NodeProps) {
  const { label, summary, isDerivative } = data as unknown as MindMapNodeData;

  return (
    <div
      className={`group relative px-4 py-3 rounded-xl border-2 backdrop-blur-sm shadow-lg min-w-[160px] max-w-[240px] cursor-pointer transition-all duration-200 hover:scale-[1.03] ${
        isDerivative
          ? 'border-amber-400/80 bg-gradient-to-br from-amber-950/90 to-slate-900/90 shadow-amber-500/20 hover:border-amber-300 hover:shadow-amber-500/40'
          : 'border-purple-400/80 bg-gradient-to-br from-purple-950/90 to-slate-900/90 shadow-purple-500/20 hover:border-purple-300 hover:shadow-purple-500/40'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 !border-2 !border-slate-800 !-left-[6px] !top-1/2 !-translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDerivative ? '!bg-amber-400' : '!bg-purple-400'
        }`}
      />
      {/* Derivative badge */}
      {isDerivative && (
        <div className="flex items-center gap-1 mb-1">
          <Link2 className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Synthesized</span>
        </div>
      )}
      <div className={`font-bold text-sm mb-1 ${isDerivative ? 'text-amber-200' : 'text-purple-200'}`}>
        {label}
      </div>
      {summary && (
        <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
      )}
      {/* Click hint */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-400/60 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Click for details</span>
        <ChevronRight className="h-3 w-3" />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !border-2 !border-slate-800 !-right-[6px] !top-1/2 !-translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDerivative ? '!bg-amber-400' : '!bg-purple-400'
        }`}
      />
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);
