'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Loader2 } from 'lucide-react';

function SynthesisSkeletonComponent({ data }: NodeProps) {
  const label = (data as Record<string, string>).label ?? 'Synthesizing';

  return (
    <div className="px-4 py-3 rounded-xl border-2 border-dashed border-amber-400/70 bg-gradient-to-br from-amber-950/60 to-slate-900/80 backdrop-blur-sm shadow-lg shadow-amber-500/20 min-w-[160px] max-w-[240px] animate-pulse">
      <Handle type="target" position={Position.Left} className="!bg-amber-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-amber-400 animate-spin shrink-0" />
        <div className="font-bold text-sm text-amber-300">{label}</div>
      </div>
      <p className="text-xs text-slate-400 mt-1">Synthesizing concepts...</p>
      <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-2 !h-2" />
    </div>
  );
}

export const SynthesisSkeletonNode = memo(SynthesisSkeletonComponent);
