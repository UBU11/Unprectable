import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SynthesisSkeletonNode } from './SynthesisSkeletonNode';
import type { NodeProps } from '@xyflow/react';

// Mock React Flow's Handle component
vi.mock('@xyflow/react', () => ({
  Handle: ({ type, className }: { type: string; className?: string }) => (
    <div data-testid={`skeleton-handle-${type}`} className={className} />
  ),
  Position: { Left: 'left', Right: 'right' },
}));

describe('SynthesisSkeletonNode', () => {
  const createNodeProps = (label: string): NodeProps => ({
    id: 'skeleton-node',
    type: 'synthesisSkeleton',
    data: { label },
    selected: false,
    dragging: false,
    zIndex: 1,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
  } as NodeProps);

  it('should render with "Synthesizing" label by default', () => {
    const props = createNodeProps('Synthesizing');
    render(<SynthesisSkeletonNode {...props} />);

    expect(screen.getByText('Synthesizing')).toBeInTheDocument();
  });

  it('should render custom label', () => {
    const props = createNodeProps('Custom Label');
    render(<SynthesisSkeletonNode {...props} />);

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should show loading text', () => {
    const props = createNodeProps('Synthesizing');
    render(<SynthesisSkeletonNode {...props} />);

    expect(screen.getByText('Synthesizing concepts...')).toBeInTheDocument();
  });

  it('should render loader icon', () => {
    const props = createNodeProps('Synthesizing');
    render(<SynthesisSkeletonNode {...props} />);

    // Check for the spinning loader icon by class
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('should render handles for connections', () => {
    const props = createNodeProps('Synthesizing');
    render(<SynthesisSkeletonNode {...props} />);

    expect(screen.getByTestId('skeleton-handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-handle-source')).toBeInTheDocument();
  });
});
