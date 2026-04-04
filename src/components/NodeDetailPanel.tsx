'use client';

import { BookOpen, ChevronRight, X, ArrowUpRight, Hash } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';

interface MindMapNodeData {
  label: string;
  summary: string;
  details: string;
}

interface NodeDetailPanelProps {
  node: Node;
  edges: Edge[];
  allNodes: Node[];
  onClose: () => void;
  onNavigateToNode: (nodeId: string) => void;
}

export function NodeDetailPanel({
  node,
  edges,
  allNodes,
  onClose,
  onNavigateToNode,
}: NodeDetailPanelProps) {
  const data = node.data as unknown as MindMapNodeData;

  // Find parent
  const incomingEdge = edges.find((e) => e.target === node.id);
  const parentNode = incomingEdge
    ? allNodes.find((n) => n.id === incomingEdge.source)
    : null;
  const parentData = parentNode?.data
    ? (parentNode.data as unknown as MindMapNodeData)
    : null;

  // Find children
  const childEdges = edges.filter((e) => e.source === node.id);
  const childNodes = childEdges
    .map((e) => allNodes.find((n) => n.id === e.target))
    .filter((n): n is Node => n !== undefined);

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            {parentNode && parentData && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <button
                  onClick={() => onNavigateToNode(parentNode.id)}
                  className="hover:text-primary transition-colors truncate"
                >
                  {parentData.label}
                </button>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-foreground truncate">{data.label}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{data.label}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        {data.summary && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Quick Summary
            </h3>
            <div className="rounded-lg bg-muted/50 border border-border p-4">
              <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
            </div>
          </div>
        )}

        {/* Detailed Explanation */}
        {data.details && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Detailed Explanation
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {data.details.split('\n').map((paragraph, i) => (
                <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Related Concepts - Children */}
        {childNodes.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Sub-topics ({childNodes.length})
            </h3>
            <div className="space-y-2">
              {childNodes.map((child) => {
                const childData = child.data as unknown as MindMapNodeData;
                return (
                  <button
                    key={child.id}
                    onClick={() => onNavigateToNode(child.id)}
                    className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50 hover:border-primary/30 transition-all group"
                  >
                    <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{childData.label}</div>
                      {childData.summary && (
                        <div className="text-xs text-muted-foreground truncate">{childData.summary}</div>
                      )}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Parent link */}
        {parentNode && parentData && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Parent Topic
            </h3>
            <button
              onClick={() => onNavigateToNode(parentNode.id)}
              className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/50 hover:border-primary/30 transition-all group"
            >
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <ArrowUpRight className="h-3.5 w-3.5 text-primary rotate-[-45deg]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{parentData.label}</div>
                {parentData.summary && (
                  <div className="text-xs text-muted-foreground truncate">{parentData.summary}</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Click sub-topics to navigate between concepts
        </p>
      </div>
    </div>
  );
}
