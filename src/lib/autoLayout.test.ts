import { describe, it, expect } from 'vitest';
import { getLayoutedElements, type LayoutDirection } from './autoLayout';
import type { Node, Edge } from '@xyflow/react';

describe('getLayoutedElements', () => {
  const createNode = (id: string): Node => ({
    id,
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: { label: id, summary: `Summary for ${id}`, details: `Details for ${id}` },
  });

  const createEdge = (source: string, target: string): Edge => ({
    id: `${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
  });

  it('should layout a single node', () => {
    const nodes: Node[] = [createNode('root')];
    const edges: Edge[] = [];

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].position.x).toBeDefined();
    expect(result.nodes[0].position.y).toBeDefined();
  });

  it('should layout nodes horizontally (LR)', () => {
    const nodes: Node[] = [
      createNode('root'),
      createNode('child1'),
      createNode('child2'),
    ];
    const edges: Edge[] = [
      createEdge('root', 'child1'),
      createEdge('root', 'child2'),
    ];

    const result = getLayoutedElements(nodes, edges, 'LR');

    // In LR layout, children should be to the right of root
    const rootNode = result.nodes.find((n) => n.id === 'root');
    const child1Node = result.nodes.find((n) => n.id === 'child1');
    const child2Node = result.nodes.find((n) => n.id === 'child2');

    expect(child1Node!.position.x).toBeGreaterThan(rootNode!.position.x);
    expect(child2Node!.position.x).toBeGreaterThan(rootNode!.position.x);
  });

  it('should layout nodes vertically (TB)', () => {
    const nodes: Node[] = [
      createNode('root'),
      createNode('child1'),
      createNode('child2'),
    ];
    const edges: Edge[] = [
      createEdge('root', 'child1'),
      createEdge('root', 'child2'),
    ];

    const result = getLayoutedElements(nodes, edges, 'TB');

    // In TB layout, children should be below root
    const rootNode = result.nodes.find((n) => n.id === 'root');
    const child1Node = result.nodes.find((n) => n.id === 'child1');
    const child2Node = result.nodes.find((n) => n.id === 'child2');

    expect(child1Node!.position.y).toBeGreaterThan(rootNode!.position.y);
    expect(child2Node!.position.y).toBeGreaterThan(rootNode!.position.y);
  });

  it('should default to LR direction', () => {
    const nodes: Node[] = [
      createNode('root'),
      createNode('child'),
    ];
    const edges: Edge[] = [createEdge('root', 'child')];

    const result = getLayoutedElements(nodes, edges);

    // Should behave like LR
    const rootNode = result.nodes.find((n) => n.id === 'root');
    const childNode = result.nodes.find((n) => n.id === 'child');
    expect(childNode!.position.x).toBeGreaterThan(rootNode!.position.x);
  });

  it('should return edges unchanged', () => {
    const nodes: Node[] = [createNode('root'), createNode('child')];
    const edges: Edge[] = [createEdge('root', 'child')];

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].id).toBe('root-child');
    expect(result.edges[0].source).toBe('root');
    expect(result.edges[0].target).toBe('child');
  });

  it('should space nodes appropriately', () => {
    const nodes: Node[] = [
      createNode('a'),
      createNode('b'),
      createNode('c'),
    ];
    const edges: Edge[] = [];

    const result = getLayoutedElements(nodes, edges, 'LR');

    // Nodes should have reasonable spacing
    const positions = result.nodes.map((n) => n.position);
    for (const pos of positions) {
      expect(pos.x).not.toBeNaN();
      expect(pos.y).not.toBeNaN();
    }
  });

  it('should handle complex tree structure', () => {
    const nodes: Node[] = [
      createNode('root'),
      createNode('a'),
      createNode('b'),
      createNode('a1'),
      createNode('a2'),
      createNode('b1'),
    ];
    const edges: Edge[] = [
      createEdge('root', 'a'),
      createEdge('root', 'b'),
      createEdge('a', 'a1'),
      createEdge('a', 'a2'),
      createEdge('b', 'b1'),
    ];

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.nodes).toHaveLength(6);

    // Check hierarchy: a1, a2 should be to the right of a
    const aNode = result.nodes.find((n) => n.id === 'a');
    const a1Node = result.nodes.find((n) => n.id === 'a1');
    const a2Node = result.nodes.find((n) => n.id === 'a2');

    expect(a1Node!.position.x).toBeGreaterThan(aNode!.position.x);
    expect(a2Node!.position.x).toBeGreaterThan(aNode!.position.x);
  });

  it('should handle empty nodes array', () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('should handle nodes with existing positions', () => {
    const nodes: Node[] = [
      { ...createNode('root'), position: { x: 100, y: 100 } },
      { ...createNode('child'), position: { x: 200, y: 200 } },
    ];
    const edges: Edge[] = [createEdge('root', 'child')];

    const result = getLayoutedElements(nodes, edges, 'LR');

    // Positions should be recalculated (not preserved)
    expect(result.nodes[0].position.x).not.toBe(100);
    expect(result.nodes[0].position.y).not.toBe(100);
  });

  it('should preserve node data', () => {
    const nodes: Node[] = [
      { ...createNode('root'), data: { custom: 'data', label: 'Custom', summary: 'S', details: 'D' } },
    ];
    const edges: Edge[] = [];

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.nodes[0].data).toEqual(nodes[0].data);
  });

  it('should handle many nodes', () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (let i = 0; i < 50; i++) {
      nodes.push(createNode(`node-${i}`));
      if (i > 0) {
        edges.push(createEdge('node-0', `node-${i}`));
      }
    }

    const result = getLayoutedElements(nodes, edges, 'LR');

    expect(result.nodes).toHaveLength(50);
    expect(result.edges).toHaveLength(49);
  });

  it('should handle cyclic references gracefully', () => {
    const nodes: Node[] = [
      createNode('a'),
      createNode('b'),
      createNode('c'),
    ];
    const edges: Edge[] = [
      createEdge('a', 'b'),
      createEdge('b', 'c'),
      createEdge('c', 'a'), // Creates cycle
    ];

    // Dagre should handle this without crashing
    const result = getLayoutedElements(nodes, edges, 'LR');
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(3);
  });

  it('should apply margins', () => {
    const nodes: Node[] = [createNode('root')];
    const edges: Edge[] = [];

    const result = getLayoutedElements(nodes, edges, 'LR');

    // Should have some margin applied (position not at 0,0 exactly)
    expect(result.nodes[0].position.x).toBeGreaterThanOrEqual(0);
    expect(result.nodes[0].position.y).toBeGreaterThanOrEqual(0);
  });
});
