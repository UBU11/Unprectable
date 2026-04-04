'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ChevronRight } from 'lucide-react';

interface MindMapNodeData {
  label: string;
  summary: string;
  details: string;
}

function MindMapNodeComponent({ data }: NodeProps) {
  const { label, summary } = data as unknown as MindMapNodeData;

  return (
    <div className="group relative px-4 py-3 rounded-xl border-2 border-purple-400/80 bg-gradient-to-br from-purple-950/90 to-slate-900/90 backdrop-blur-sm shadow-lg shadow-purple-500/20 min-w-[160px] max-w-[240px] cursor-pointer transition-all duration-200 hover:border-purple-300 hover:shadow-purple-500/40 hover:scale-[1.03]">
      <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-2 !h-2" />
      <div className="font-bold text-sm text-purple-200 mb-1">{label}</div>
      {summary && (
        <p className="text-xs text-slate-300 leading-relaxed">{summary}</p>
      )}
      {/* Click hint */}
      <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-400/60 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Click for details</span>
        <ChevronRight className="h-3 w-3" />
      </div>
      <Handle type="source" position={Position.Right} className="!bg-purple-400 !w-2 !h-2" />
    </div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);
