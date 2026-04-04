import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MindMapNode } from './MindMapNode';
import type { NodeProps } from '@xyflow/react';

// Mock React Flow's Handle component
vi.mock('@xyflow/react', () => ({
  Handle: ({ type, position, className }: { type: string; position: string; className?: string }) => (
    <div data-testid={`handle-${type}`} data-position={position} className={className} />
  ),
  Position: { Left: 'left', Right: 'right' },
}));

describe('MindMapNode', () => {
  const createNodeProps = (data: object): NodeProps => ({
    id: 'test-node',
    type: 'mindMapNode',
    data,
    selected: false,
    dragging: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
  } as NodeProps);

  it('should render node with label and summary', () => {
    const props = createNodeProps({
      label: 'Test Label',
      summary: 'Test summary text',
      details: 'Test details',
    });

    render(<MindMapNode {...props} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test summary text')).toBeInTheDocument();
  });

  it('should render derivative node', () => {
    const props = createNodeProps({
      label: 'My Label',
      summary: 'Summary',
      details: 'Details',
      isDerivative: true,
    });

    const { container } = render(<MindMapNode {...props} />);

    // Check for amber styling classes on the container
    expect(container.firstChild).toHaveClass('border-amber-400/80');
  });

  it('should render regular node', () => {
    const props = createNodeProps({
      label: 'Regular',
      summary: 'Summary',
      details: 'Details',
      isDerivative: false,
    });

    const { container } = render(<MindMapNode {...props} />);

    // Check for purple styling classes on the container
    expect(container.firstChild).toHaveClass('border-purple-400/80');
  });

  it('should show "Synthesized" badge for derivative nodes', () => {
    const props = createNodeProps({
      label: 'Derivative',
      summary: 'Summary',
      details: 'Details',
      isDerivative: true,
    });

    render(<MindMapNode {...props} />);

    expect(screen.getByText('Synthesized')).toBeInTheDocument();
  });

  it('should not show "Synthesized" badge for regular nodes', () => {
    const props = createNodeProps({
      label: 'Regular',
      summary: 'Summary',
      details: 'Details',
      isDerivative: false,
    });

    render(<MindMapNode {...props} />);

    const badges = screen.queryAllByText('Synthesized');
    expect(badges.length).toBe(0);
  });

  it('should render handles for connections', () => {
    const props = createNodeProps({
      label: 'Node',
      summary: 'Summary',
      details: 'Details',
    });

    render(<MindMapNode {...props} />);

    expect(screen.getByTestId('handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source')).toBeInTheDocument();
  });

  it('should show click hint', () => {
    const props = createNodeProps({
      label: 'Node',
      summary: 'Summary',
      details: 'Details',
    });

    render(<MindMapNode {...props} />);

    expect(screen.getByText('Click for details')).toBeInTheDocument();
  });

  it('should handle missing summary gracefully', () => {
    const props = createNodeProps({
      label: 'Node',
      summary: '',
      details: 'Details',
    });

    render(<MindMapNode {...props} />);

    expect(screen.getByText('Node')).toBeInTheDocument();
  });
});
