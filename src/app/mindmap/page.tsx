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
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Brain, FileText, Upload, Sparkles, Loader2, AlertCircle, X, PanelRightOpen } from 'lucide-react';

import { MindMapNode } from '@/components/MindMapNode';
import { FileDropzone } from '@/components/FileDropzone';
import { NodeDetailPanel } from '@/components/NodeDetailPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { mindMapToFlow } from '@/lib/layout';
import type { MindMapData } from '@/lib/schema';

const nodeTypes = { mindMapNode: MindMapNode };

type InputMode = 'text' | 'file';

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

  const reactFlow = useReactFlow();

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
      setNodes(flow.nodes);
      setEdges(flow.edges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [text, fileName]);

  const clearAll = useCallback(() => {
    setText('');
    setFileName(null);
    setNodes([]);
    setEdges([]);
    setError(null);
    setSelectedNode(null);
    setDetailPanelOpen(false);
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setDetailPanelOpen(true);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false);
    // Keep selectedNode for re-open button
  }, []);

  const handleNavigateToNode = useCallback(
    (nodeId: string) => {
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setSelectedNode(targetNode);
        // Zoom to the node
        reactFlow.setCenter(targetNode.position.x + 120, targetNode.position.y + 40, {
          zoom: 1.2,
          duration: 300,
        });
      }
    },
    [nodes, reactFlow]
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">DocToMap</h1>
            <p className="text-xs text-muted-foreground">Transform docs into visual mind maps</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedNode && !detailPanelOpen && nodes.length > 0 && (
            <Button
              onClick={() => setDetailPanelOpen(true)}
              variant="outline"
              size="sm"
            >
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

          {/* File dropzone */}
          {inputMode === 'file' && (
            <FileDropzone onFileAccepted={handleFileAccepted} isProcessing={uploading} />
          )}

          {/* File info badge */}
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

          {/* Text input area */}
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
                    : 'Paste documentation, API docs, README, or any technical text:'}
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
                    <span className="text-amber-500">
                      Large document — map-reduce mode
                    </span>
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
        </aside>

        {/* Mind Map Canvas + Detail Panel */}
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            {nodes.length > 0 ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-background"
              >
                <Controls className="!bg-card !border-border [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!bg-muted" />
                <MiniMap
                  className="!bg-muted !border-border"
                  nodeColor={() => '#8b5cf6'}
                  maskColor="rgba(0, 0, 0, 0.5)"
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

          {/* Node Detail Panel — slides in from right */}
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
