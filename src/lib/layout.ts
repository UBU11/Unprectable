import type { Node, Edge } from '@xyflow/react';
import type { MindMapData } from './schema';

interface MindMapNode {
  id: string;
  label: string;
  summary: string;
  details: string;
  parentId: string | null;
}

const HORIZONTAL_SPACING = 280;
const VERTICAL_SPACING = 100;

function buildTree(nodes: MindMapNode[]): Map<string | null, MindMapNode[]> {
  const childrenMap = new Map<string | null, MindMapNode[]>();
  for (const node of nodes) {
    const children = childrenMap.get(node.parentId) || [];
    children.push(node);
    childrenMap.set(node.parentId, children);
  }
  return childrenMap;
}

function layoutSubtree(
  nodeId: string | null,
  childrenMap: Map<string | null, MindMapNode[]>,
  depth: number,
  yOffset: { value: number }
): { nodes: Node[]; edges: Edge[] } {
  const children = childrenMap.get(nodeId) || [];
  const allNodes: Node[] = [];
  const allEdges: Edge[] = [];

  for (const child of children) {
    const y = yOffset.value;
    yOffset.value += VERTICAL_SPACING;

    allNodes.push({
      id: child.id,
      type: 'mindMapNode',
      position: { x: depth * HORIZONTAL_SPACING, y },
      data: { label: child.label, summary: child.summary, details: child.details },
    });

    if (child.parentId) {
      allEdges.push({
        id: `${child.parentId}-${child.id}`,
        source: child.parentId,
        target: child.id,
        type: 'smoothstep',
        animated: true,
      });
    }

    const subtree = layoutSubtree(child.id, childrenMap, depth + 1, yOffset);
    allNodes.push(...subtree.nodes);
    allEdges.push(...subtree.edges);
  }

  return { nodes: allNodes, edges: allEdges };
}

export function mindMapToFlow(data: MindMapData): { nodes: Node[]; edges: Edge[] } {
  const childrenMap = buildTree(data.nodes as MindMapNode[]);

  const rootNode = data.nodes.find((n) => n.parentId === null);
  if (!rootNode) {
    return { nodes: [], edges: [] };
  }

  const rootFlowNode: Node = {
    id: rootNode.id,
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: { label: data.title, summary: rootNode.summary, details: rootNode.details },
  };

  const yOffset = { value: 0 };
  const subtree = layoutSubtree(rootNode.id, childrenMap, 1, yOffset);

  const totalHeight = yOffset.value;
  rootFlowNode.position.y = totalHeight / 2 - VERTICAL_SPACING / 2;

  return {
    nodes: [rootFlowNode, ...subtree.nodes],
    edges: subtree.edges,
  };
}
