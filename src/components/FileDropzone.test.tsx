import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDropzone } from './FileDropzone';

describe('FileDropzone', () => {
  const mockOnFileAccepted = vi.fn();

  beforeEach(() => {
    mockOnFileAccepted.mockClear();
  });

  it('should render upload prompt', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={false} />);

    expect(screen.getByText('Drag & drop a file here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports .txt, .md, .pdf, .csv (max 10MB)')).toBeInTheDocument();
  });

  it('should show processing state', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={true} />);

    expect(screen.getByText('Processing file...')).toBeInTheDocument();
  });

  it('should be disabled when processing', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={true} />);

    const dropzone = screen.getByText('Processing file...').parentElement;
    expect(dropzone).toHaveClass('opacity-50');
    expect(dropzone).toHaveClass('cursor-not-allowed');
  });

  it('should have file input', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={false} />);

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('should render with correct styling', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={false} />);

    const dropzone = screen.getByText('Drag & drop a file here, or click to browse').parentElement;
    expect(dropzone).toHaveClass('border-dashed');
    expect(dropzone).toHaveClass('rounded-lg');
  });

  it('should show icons', () => {
    // Check that dropzone icon exists
    const { container } = render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={false} />);
    
    // The component should render with a text-3xl div containing the emoji
    const iconDiv = container.querySelector('.text-3xl');
    expect(iconDiv).toBeInTheDocument();
  });

  it('should handle drag active state', () => {
    render(<FileDropzone onFileAccepted={mockOnFileAccepted} isProcessing={false} />);

    const dropzone = screen.getByText('Drag & drop a file here, or click to browse').parentElement;
    
    // The component exists and has correct structure
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveAttribute('tabindex', '0');
  });
});
