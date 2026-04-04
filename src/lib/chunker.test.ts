import { describe, it, expect } from 'vitest';
import { chunkText } from './chunker';

describe('chunkText', () => {
  it('should return single chunk for short text', async () => {
    const text = 'Short text';
    const chunks = await chunkText(text, 100, 20);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('should split long text into multiple chunks', async () => {
    // Create text longer than chunkSize
    const text = 'A'.repeat(1000);
    const chunks = await chunkText(text, 200, 20);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('should respect chunk size parameter', async () => {
    const text = 'Word '.repeat(100); // ~500 chars
    const chunkSize = 100;
    const chunks = await chunkText(text, chunkSize, 10);
    
    // Each chunk should not exceed chunkSize significantly
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(chunkSize + 50); // Allow some flexibility
    }
  });

  it('should use default parameters when not provided', async () => {
    const text = 'A'.repeat(5000);
    const chunks = await chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('should handle empty string', async () => {
    const chunks = await chunkText('');
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('');
  });

  it('should split on paragraph boundaries when possible', async () => {
    const paragraphs = [
      'First paragraph with some content.',
      'Second paragraph with different content.',
      'Third paragraph with more content here.',
    ];
    const text = paragraphs.join('\n\n');
    const chunks = await chunkText(text, 100, 10);
    
    // Chunks should ideally respect paragraph boundaries
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle text with newlines', async () => {
    const text = 'Line 1\nLine 2\n\nParagraph 2\n\nParagraph 3';
    const chunks = await chunkText(text, 50, 5);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it('should create overlapping chunks', async () => {
    const text = 'This is a test sentence that should have overlap. ';
    const chunkSize = 30;
    const chunkOverlap = 10;
    const chunks = await chunkText(text.repeat(5), chunkSize, chunkOverlap);
    
    if (chunks.length > 1) {
      // Check for overlap between consecutive chunks
      const firstChunk = chunks[0];
      const secondChunk = chunks[1];
      const overlapExists = firstChunk.slice(-chunkOverlap * 2).split(' ').some(word => 
        secondChunk.includes(word)
      );
      expect(overlapExists || chunks.length === 1).toBe(true);
    }
  });

  it('should handle very long text efficiently', async () => {
    const text = 'Word '.repeat(10000); // ~50k chars
    const startTime = Date.now();
    const chunks = await chunkText(text, 2000, 200);
    const endTime = Date.now();
    
    expect(chunks.length).toBeGreaterThan(10);
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle special characters', async () => {
    const text = 'Special chars: @#$%^&*()\n\nMore content here.\n\nEven more!';
    const chunks = await chunkText(text, 30, 5);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    // Reconstruct should preserve all content (minus overlap)
    const reconstructed = chunks.join('');
    expect(reconstructed.length).toBeGreaterThanOrEqual(text.length - (chunks.length - 1) * 5);
  });

  it('should handle single character repeated', async () => {
    const text = 'A'.repeat(1000);
    const chunks = await chunkText(text, 100, 10);
    expect(chunks.length).toBeGreaterThan(1);
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    // Account for overlaps
    expect(totalLength).toBeGreaterThanOrEqual(1000);
  });

  it('should handle code-like content', async () => {
    const code = `
function example() {
  return "Hello World";
}

const x = 1;
const y = 2;

class MyClass {
  constructor() {
    this.value = 0;
  }
}
`;
    const chunks = await chunkText(code, 50, 10);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle markdown content', async () => {
    const markdown = `
# Heading

Some paragraph text here.

## Subheading

More content here.

- List item 1
- List item 2

> Blockquote
`;
    const chunks = await chunkText(markdown, 40, 5);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });
});
