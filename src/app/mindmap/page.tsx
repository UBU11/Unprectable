'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Brain, FileText, Upload, Sparkles, Loader2, AlertCircle, X, PanelRightOpen, Link2, Wand2, Maximize2 } from 'lucide-react';

import { MindMapNode } from '@/components/MindMapNode';
import { SynthesisSkeletonNode } from '@/components/SynthesisSkeletonNode';
import { SynthesisEdge } from '@/components/SynthesisEdge';
import { FileDropzone } from '@/components/FileDropzone';
import { NodeDetailPanel } from '@/components/NodeDetailPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mindMapToFlow } from '@/lib/layout';
import { getLayoutedElements } from '@/lib/autoLayout';
import type { MindMapData } from '@/lib/schema';

interface MindMapNodeData {
  label: string;
  summary: string;
  details: string;
  isDerivative?: boolean;
}

const nodeTypes = {
  mindMapNode: MindMapNode,
  synthesisSkeleton: SynthesisSkeletonNode,
};

const edgeTypes = {
  synthesis: SynthesisEdge,
};

type InputMode = 'text' | 'file';

let derivativeCounter = 0;

function MindMapCanvas() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail panel state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  // Synthesis state
  const [synthesizing, setSynthesizing] = useState(false);

  // Layout direction
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR');

  // ─── Interactive drag handlers ───
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const reactFlow = useReactFlow();

  // ─── File upload handler ───
  const handleFileAccepted = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload file');
      }

      const data = await res.json();
      setText(data.text);
      setFileName(data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File upload failed');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }, []);

  // ─── Generate mind map ───
  const generateMap = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setDetailPanelOpen(false);

    try {
      const res = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          fileName: fileName ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate map');
      }

      const data: MindMapData = await res.json();
      const flow = mindMapToFlow(data);

      // Apply dagre auto-layout to the generated flow
      const layouted = getLayoutedElements(flow.nodes, flow.edges, layoutDirection);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [text, fileName, layoutDirection]);

  const clearAll = useCallback(() => {
    setText('');
    setFileName(null);
    setNodes([]);
    setEdges([]);
    setError(null);
    setSelectedNode(null);
    setDetailPanelOpen(false);
    setSynthesizing(false);
  }, []);

  // ─── Node click → detail panel ───
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setDetailPanelOpen(true);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false);
  }, []);

  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setSelectedNode(targetNode);
        reactFlow.setCenter(targetNode.position.x + 120, targetNode.position.y + 40, {
          zoom: 1.2,
          duration: 500,
        });
      }
    },
    [nodes, reactFlow]
  );

  // ─── Auto-Organize (Tidy Up) ───
  const handleAutoOrganize = useCallback(() => {
    if (nodes.length === 0) return;

    // Filter out skeleton nodes before layout
    const realNodes = nodes.filter((n) => n.type !== 'synthesisSkeleton');
    const realEdges = edges.filter(
      (e) =>
        !e.source.startsWith('synthesis-skeleton') &&
        !e.target.startsWith('synthesis-skeleton')
    );

    const layouted = getLayoutedElements(realNodes, realEdges, layoutDirection);

    // Keep skeleton nodes as-is (they'll be replaced soon)
    const skeletonNodes = nodes.filter((n) => n.type === 'synthesisSkeleton');
    const skeletonEdges = edges.filter(
      (e) =>
        e.source.startsWith('synthesis-skeleton') ||
        e.target.startsWith('synthesis-skeleton')
    );

    setNodes([...layouted.nodes, ...skeletonNodes]);
    setEdges([...layouted.edges, ...skeletonEdges]);

    // Smoothly animate the viewport to frame everything
    reactFlow.fitView({ duration: 800, padding: 0.2 });
  }, [nodes, edges, layoutDirection, reactFlow]);

  // ─── Fit view to all nodes ───
  const handleFitView = useCallback(() => {
    reactFlow.fitView({ duration: 800, padding: 0.2 });
  }, [reactFlow]);

  // ─── Concept Synthesis: onConnect handler ───
  const handleConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target || synthesizing) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Don't connect to skeleton nodes
      if (sourceNode.type === 'synthesisSkeleton' || targetNode.type === 'synthesisSkeleton') return;

      // Check if already connected
      const existingEdge = edges.find(
        (e) =>
          (e.source === connection.source && e.target === connection.target) ||
          (e.source === connection.target && e.target === connection.source)
      );
      if (existingEdge) return;

      setSynthesizing(true);

      const sourceData = sourceNode.data as unknown as MindMapNodeData;
      const targetData = targetNode.data as unknown as MindMapNodeData;

      // Position skeleton between the two nodes
      const midX = (sourceNode.position.x + targetNode.position.x) / 2 + 40;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;

      derivativeCounter += 1;
      const skeletonId = `synthesis-skeleton-${derivativeCounter}`;

      // 1. Create skeleton node immediately (optimistic UI)
      const skeletonNode: Node = {
        id: skeletonId,
        type: 'synthesisSkeleton',
        position: { x: midX, y: midY },
        data: { label: `${sourceData.label} × ${targetData.label}` },
      };

      const skeletonEdgeA: Edge = {
        id: `${connection.source}-${skeletonId}`,
        source: connection.source,
        target: skeletonId,
        type: 'synthesis',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' },
      };

      const skeletonEdgeB: Edge = {
        id: `${connection.target}-${skeletonId}`,
        source: connection.target,
        target: skeletonId,
        type: 'synthesis',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' },
      };

      setNodes((prev) => [...prev, skeletonNode]);
      setEdges((prev) => [...prev, skeletonEdgeA, skeletonEdgeB]);

      // 2. Call AI to generate derivative concept
      try {
        const res = await fetch('/api/generate-derivative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeA: { label: sourceData.label, details: sourceData.details },
            nodeB: { label: targetData.label, details: targetData.details },
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Synthesis failed');
        }

        const derivative = await res.json();

        // 3. Replace skeleton with real derivative node
        const derivativeId = `derivative-${derivativeCounter}`;

        const realNode: Node = {
          id: derivativeId,
          type: 'mindMapNode',
          position: { x: midX, y: midY },
          data: {
            label: derivative.label,
            summary: derivative.summary,
            details: derivative.details,
            isDerivative: true,
          },
        };

        const realEdgeA: Edge = {
          id: `${connection.source}-${derivativeId}`,
          source: connection.source,
          target: derivativeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f59e0b', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
        };

        const realEdgeB: Edge = {
          id: `${connection.target}-${derivativeId}`,
          source: connection.target,
          target: derivativeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f59e0b', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
        };

        setNodes((prev) =>
          prev.map((n) => (n.id === skeletonId ? realNode : n))
        );
        setEdges((prev) =>
          prev
            .filter((e) => e.id !== skeletonEdgeA.id && e.id !== skeletonEdgeB.id)
            .concat([realEdgeA, realEdgeB])
        );

        // Smoothly fit view to include the new node
        reactFlow.fitView({ duration: 800, padding: 0.2 });
      } catch (err) {
        setNodes((prev) => prev.filter((n) => n.id !== skeletonId));
        setEdges((prev) =>
          prev.filter((e) => e.id !== skeletonEdgeA.id && e.id !== skeletonEdgeB.id)
        );
        setError(err instanceof Error ? err.message : 'Concept synthesis failed');
      } finally {
        setSynthesizing(false);
      }
    },
    [nodes, edges, synthesizing, reactFlow]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Clover</h1>
            <p className="text-xs text-muted-foreground">Transform docs into visual mind maps</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {synthesizing && (
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Synthesizing...
            </div>
          )}
          {selectedNode && !detailPanelOpen && nodes.length > 0 && (
            <Button onClick={() => setDetailPanelOpen(true)} variant="outline" size="sm">
              <PanelRightOpen className="h-4 w-4 mr-2" />
              Details
            </Button>
          )}
          {(nodes.length > 0 || text) && (
            <Button onClick={clearAll} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[420px] border-r border-border bg-card/30 p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Input mode toggle */}
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === 'text'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              Paste Text
            </button>
            <button
              onClick={() => setInputMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>

          {inputMode === 'file' && (
            <FileDropzone onFileAccepted={handleFileAccepted} isProcessing={uploading} />
          )}

          {fileName && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-3 py-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm truncate flex-1">{fileName}</span>
              <button
                onClick={() => { setFileName(null); setText(''); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                {inputMode === 'file' ? 'Extracted Text (Editable)' : 'Documentation Input'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <Label htmlFor="doc-input" className="text-muted-foreground">
                  {inputMode === 'file'
                    ? 'Edit extracted text if needed:'
                    : 'Paste documentation, API docs, README or any technical text:'}
                </Label>
                <Textarea
                  id="doc-input"
                  className="flex-1 min-h-[200px] resize-none bg-background"
                  placeholder={
                    inputMode === 'file'
                      ? 'Upload a file to extract text...'
                      : 'Paste your documentation here...'
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{text.length.toLocaleString()} characters</span>
                  {text.length > 6000 && (
                    <span className="text-amber-500">Large document — map-reduce mode</span>
                  )}
                </div>
              </div>

              <Button
                onClick={generateMap}
                disabled={loading || uploading || !text.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {text.length > 6000 ? 'Processing chunks...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Mind Map
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/50 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canvas controls & Synthesis hint */}
          {nodes.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Auto-Organize + Fit View buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleAutoOrganize}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-Organize
                </Button>
                <Button
                  onClick={handleFitView}
                  variant="outline"
                  size="sm"
                >
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fit View
                </Button>
              </div>

              {/* Layout direction toggle */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Direction:</span>
                <button
                  onClick={() => setLayoutDirection('LR')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    layoutDirection === 'LR'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => setLayoutDirection('TB')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    layoutDirection === 'TB'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Vertical
                </button>
              </div>

              {/* Synthesis hint */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/80">
                <Link2 className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-medium text-amber-300">Concept Synthesis:</span>{' '}
                  Drag from one node&apos;s handle to another to generate an AI-powered intersection node.
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mind Map Canvas + Detail Panel */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onConnect={handleConnect}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                snapToGrid={true}
                snapGrid={[20, 20]}
                elevateNodesOnSelect={true}
                connectionRadius={30}
                className="bg-background"
                connectionLineStyle={{ stroke: '#f59e0b', strokeWidth: 2 }}
                proOptions={{ hideAttribution: true }}
              >
                <Controls
                  className="!bg-card !border-border [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!bg-muted"
                  showInteractive={false}
                />
                <MiniMap
                  className="!bg-muted !border-border"
                  nodeColor={(node) => {
                    const data = node.data as Record<string, unknown>;
                    if (node.type === 'synthesisSkeleton') return '#f59e0b';
                    if (data?.isDerivative) return '#f59e0b';
                    return '#8b5cf6';
                  }}
                  maskColor="rgba(0, 0, 0, 0.5)"
                  pannable
                  zoomable
                />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#64748b" />
              </ReactFlow>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div className="p-4 rounded-full bg-primary/10 inline-flex">
                    <Brain className="h-12 w-12 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Paste text or upload a document to generate a mind map
                  </p>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground/60">
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> PDF</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> Markdown</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> TXT</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> CSV</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Node Detail Panel */}
          {detailPanelOpen && selectedNode && (
            <div className="w-[380px] shrink-0 animate-in slide-in-from-right duration-200">
              <NodeDetailPanel
                node={selectedNode}
                edges={edges}
                allNodes={nodes}
                onClose={handleCloseDetail}
                onNavigateToNode={handleNavigateToNode}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MindMapPage() {
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}
