import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeDetailPanel } from './NodeDetailPanel';
import type { Node, Edge } from '@xyflow/react';

describe('NodeDetailPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnNavigateToNode = vi.fn();

  const createNode = (id: string, data: object): Node => ({
    id,
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data,
  } as Node);

  const createEdge = (source: string, target: string): Edge => ({
    id: `${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
  });

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnNavigateToNode.mockClear();
  });

  it('should render node label as title', () => {
    const node = createNode('test', {
      label: 'Test Topic',
      summary: 'Test summary',
      details: 'Test details',
    });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Test Topic')).toBeInTheDocument();
  });

  it('should render summary section', () => {
    const node = createNode('test', {
      label: 'Test',
      summary: 'This is the summary',
      details: 'Details here',
    });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Quick Summary')).toBeInTheDocument();
    expect(screen.getByText('This is the summary')).toBeInTheDocument();
  });

  it('should render details section', () => {
    const node = createNode('test', {
      label: 'Test',
      summary: 'Summary',
      details: 'These are the detailed explanation.',
    });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Detailed Explanation')).toBeInTheDocument();
    expect(screen.getByText('These are the detailed explanation.')).toBeInTheDocument();
  });

  it('should show breadcrumb for child nodes', () => {
    const parentNode = createNode('parent', { label: 'Parent Topic', summary: 'S', details: 'D' });
    const childNode = createNode('child', { label: 'Child Topic', summary: 'S', details: 'D' });
    const edge = createEdge('parent', 'child');

    render(
      <NodeDetailPanel
        node={childNode}
        edges={[edge]}
        allNodes={[parentNode, childNode]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    // Get all "Parent Topic" elements
    const parentTopics = screen.getAllByText('Parent Topic');
    expect(parentTopics.length).toBeGreaterThan(0);
  });

  it('should show sub-topics section when children exist', () => {
    const parentNode = createNode('parent', { label: 'Parent', summary: 'S', details: 'D' });
    const childNode = createNode('child', { label: 'Child', summary: 'Child summary', details: 'D' });
    const edge = createEdge('parent', 'child');

    render(
      <NodeDetailPanel
        node={parentNode}
        edges={[edge]}
        allNodes={[parentNode, childNode]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Sub-topics (1)')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByText('Child summary')).toBeInTheDocument();
  });

  it('should show parent topic section', () => {
    const parentNode = createNode('parent', { label: 'Parent', summary: 'S', details: 'D' });
    const childNode = createNode('child', { label: 'Child', summary: 'S', details: 'D' });
    const edge = createEdge('parent', 'child');

    render(
      <NodeDetailPanel
        node={childNode}
        edges={[edge]}
        allNodes={[parentNode, childNode]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Parent Topic')).toBeInTheDocument();
  });

  it('should render footer with navigation hint', () => {
    const node = createNode('test', { label: 'Test', summary: 'S', details: 'D' });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    expect(screen.getByText('Click sub-topics to navigate between concepts')).toBeInTheDocument();
  });

  it('should handle root node (no parent)', () => {
    const node = createNode('root', { label: 'Root', summary: 'S', details: 'D' });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    // Should show "Parent Topic" label but no actual parent
    expect(screen.getByText('Root')).toBeInTheDocument();
  });

  it('should handle node without children', () => {
    const node = createNode('leaf', { label: 'Leaf', summary: 'S', details: 'D' });

    render(
      <NodeDetailPanel
        node={node}
        edges={[]}
        allNodes={[node]}
        onClose={mockOnClose}
        onNavigateToNode={mockOnNavigateToNode}
      />
    );

    // Should not show sub-topics section
    expect(screen.queryByText('Sub-topics')).not.toBeInTheDocument();
  });
});
