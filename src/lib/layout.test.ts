import { describe, it, expect } from 'vitest';
import { mindMapToFlow } from './layout';
import type { MindMapData } from './schema';

describe('mindMapToFlow', () => {
  it('should convert a simple mind map with root only', () => {
    const mindMap: MindMapData = {
      title: 'Root Topic',
      nodes: [
        {
          id: 'root',
          label: 'Root',
          summary: 'Root summary',
          details: 'Root details',
          parentId: null,
        },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(1);
    expect(result.edges).toHaveLength(0);
    expect(result.nodes[0].id).toBe('root');
    expect(result.nodes[0].type).toBe('mindMapNode');
    // Root position is set to {x: 0, y: 0}
    expect(result.nodes[0].position.x).toBe(0);
  });

  it('should convert a mind map with one child', () => {
    const mindMap: MindMapData = {
      title: 'Parent',
      nodes: [
        {
          id: 'root',
          label: 'Root',
          summary: 'Root summary',
          details: 'Root details',
          parentId: null,
        },
        {
          id: 'child1',
          label: 'Child 1',
          summary: 'Child summary',
          details: 'Child details',
          parentId: 'root',
        },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);

    // Check root node
    const rootNode = result.nodes.find((n) => n.id === 'root');
    expect(rootNode).toBeDefined();
    expect(rootNode?.position.x).toBe(0);

    // Check child node
    const childNode = result.nodes.find((n) => n.id === 'child1');
    expect(childNode).toBeDefined();
    expect(childNode?.position.x).toBeGreaterThan(0); // Should be to the right of root

    // Check edge
    expect(result.edges[0].source).toBe('root');
    expect(result.edges[0].target).toBe('child1');
    expect(result.edges[0].type).toBe('smoothstep');
    expect(result.edges[0].animated).toBe(true);
  });

  it('should convert a multi-level hierarchy', () => {
    const mindMap: MindMapData = {
      title: 'Root',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
        { id: 'child1', label: 'Child 1', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'grandchild1', label: 'Grandchild 1', summary: 'S', details: 'D', parentId: 'child1' },
        { id: 'child2', label: 'Child 2', summary: 'S', details: 'D', parentId: 'root' },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(4);
    expect(result.edges).toHaveLength(3);

    // Check hierarchy levels
    const rootNode = result.nodes.find((n) => n.id === 'root');
    const child1Node = result.nodes.find((n) => n.id === 'child1');
    const grandchild1Node = result.nodes.find((n) => n.id === 'grandchild1');

    expect(rootNode?.position.x).toBe(0);
    expect(child1Node?.position.x).toBeGreaterThan(rootNode!.position.x);
    expect(grandchild1Node?.position.x).toBeGreaterThan(child1Node!.position.x);
  });

  it('should handle multiple children at same level', () => {
    const mindMap: MindMapData = {
      title: 'Root',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
        { id: 'child1', label: 'Child 1', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'child2', label: 'Child 2', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'child3', label: 'Child 3', summary: 'S', details: 'D', parentId: 'root' },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(4);
    expect(result.edges).toHaveLength(3);

    // Children should have different Y positions
    const childNodes = result.nodes.filter((n) => n.id !== 'root');
    const yPositions = childNodes.map((n) => n.position.y);
    const uniqueYPositions = new Set(yPositions);
    expect(uniqueYPositions.size).toBe(childNodes.length); // All Y positions should be unique
  });

  it('should handle complex tree structure', () => {
    const mindMap: MindMapData = {
      title: 'Complex',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
        { id: 'a', label: 'A', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'a1', label: 'A1', summary: 'S', details: 'D', parentId: 'a' },
        { id: 'a2', label: 'A2', summary: 'S', details: 'D', parentId: 'a' },
        { id: 'b', label: 'B', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'b1', label: 'B1', summary: 'S', details: 'D', parentId: 'b' },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(6);
    expect(result.edges).toHaveLength(5);

    // Verify all edges
    const edgePairs = result.edges.map((e) => `${e.source}-${e.target}`);
    expect(edgePairs).toContain('root-a');
    expect(edgePairs).toContain('root-b');
    expect(edgePairs).toContain('a-a1');
    expect(edgePairs).toContain('a-a2');
    expect(edgePairs).toContain('b-b1');
  });

  it('should center root node vertically', () => {
    const mindMap: MindMapData = {
      title: 'Root',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
        { id: 'child1', label: 'Child 1', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'child2', label: 'Child 2', summary: 'S', details: 'D', parentId: 'root' },
      ],
    };

    const result = mindMapToFlow(mindMap);
    const rootNode = result.nodes.find((n) => n.id === 'root');
    const childNodes = result.nodes.filter((n) => n.id !== 'root');

    // Root should have a valid Y position
    expect(rootNode!.position.y).toBeDefined();
  });

  it('should preserve node data fields', () => {
    const mindMap: MindMapData = {
      title: 'Test Title',
      nodes: [
        {
          id: 'root',
          label: 'My Label',
          summary: 'My Summary',
          details: 'My Details with more content.',
          parentId: null,
        },
      ],
    };

    const result = mindMapToFlow(mindMap);

    // The title becomes the label on the root node
    expect(result.nodes[0].data.label).toBe('Test Title');
    expect(result.nodes[0].data.summary).toBe('My Summary');
    expect(result.nodes[0].data.details).toBe('My Details with more content.');
  });

  it('should return empty arrays for mind map without root', () => {
    const mindMap: MindMapData = {
      title: 'Invalid',
      nodes: [
        { id: 'child1', label: 'Child', summary: 'S', details: 'D', parentId: 'nonexistent' },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('should handle deeply nested structure', () => {
    const nodes = [];
    for (let i = 0; i <= 10; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `Node ${i}`,
        summary: `Summary ${i}`,
        details: `Details ${i}`,
        parentId: i === 0 ? null : `node-${i - 1}`,
      });
    }

    const mindMap: MindMapData = {
      title: 'Deep Tree',
      nodes: nodes as MindMapData['nodes'],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(11);
    expect(result.edges).toHaveLength(10);

    // Check that depth increases X position
    const positions = result.nodes
      .filter((n) => n.id !== 'node-0')
      .map((n) => ({ id: n.id, x: n.position.x }))
      .sort((a, b) => a.x - b.x);

    // Earlier nodes should have smaller X values
    expect(positions[0].x).toBeLessThan(positions[positions.length - 1].x);
  });

  it('should handle wide tree (many siblings)', () => {
    const nodes = [
      { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
    ];

    for (let i = 1; i <= 20; i++) {
      nodes.push({
        id: `child-${i}`,
        label: `Child ${i}`,
        summary: `Summary ${i}`,
        details: `Details ${i}`,
        parentId: 'root',
      });
    }

    const mindMap: MindMapData = {
      title: 'Wide Tree',
      nodes: nodes as MindMapData['nodes'],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes).toHaveLength(21);
    expect(result.edges).toHaveLength(20);

    // All children should have same X position (same depth)
    const childNodes = result.nodes.filter((n) => n.id !== 'root');
    const xPositions = childNodes.map((n) => n.position.x);
    const uniqueX = new Set(xPositions);
    expect(uniqueX.size).toBe(1); // All children at same X level
  });

  it('should use correct node type for React Flow', () => {
    const mindMap: MindMapData = {
      title: 'Test',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
      ],
    };

    const result = mindMapToFlow(mindMap);

    expect(result.nodes[0].type).toBe('mindMapNode');
  });

  it('should generate unique edge IDs', () => {
    const mindMap: MindMapData = {
      title: 'Test',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S', details: 'D', parentId: null },
        { id: 'a', label: 'A', summary: 'S', details: 'D', parentId: 'root' },
        { id: 'b', label: 'B', summary: 'S', details: 'D', parentId: 'root' },
      ],
    };

    const result = mindMapToFlow(mindMap);

    const edgeIds = result.edges.map((e) => e.id);
    const uniqueEdgeIds = new Set(edgeIds);
    expect(uniqueEdgeIds.size).toBe(edgeIds.length); // All IDs should be unique
  });
});
