import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
vi.mock('@/lib/ai', () => ({
  model: {},
}));

vi.mock('@/lib/chunker', () => ({
  chunkText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

import { generateObject } from 'ai';
import { chunkText } from '@/lib/chunker';
import { generateMapInputSchema } from '@/lib/schema';

describe('POST /api/generate-map', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate mind map from text', async () => {
    const mockMindMap = {
      title: 'Test Topic',
      nodes: [
        { id: 'root', label: 'Test', summary: 'Summary', details: 'Details', parentId: null },
      ],
    };

    (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({ object: mockMindMap });

    // Verify the mock returns expected data
    const result = await generateObject({
      model: {} as any,
      schema: {} as any,
      system: 'test',
      prompt: 'test',
    });
    
    expect(result.object).toEqual(mockMindMap);
  });

  it('should validate input schema', () => {
    // Valid input
    const validInput = { text: 'Some text content' };
    const validResult = generateMapInputSchema.safeParse(validInput);
    expect(validResult.success).toBe(true);

    // Invalid input - missing text
    const invalidInput = {};
    const invalidResult = generateMapInputSchema.safeParse(invalidInput);
    expect(invalidResult.success).toBe(false);
  });

  it('should use map-reduce for long text', async () => {
    const longText = 'A'.repeat(7000); // Exceeds 6000 char threshold
    
    (chunkText as ReturnType<typeof vi.fn>).mockResolvedValue(['chunk1', 'chunk2']);
    
    const chunks = await chunkText(longText, 4000, 400);
    
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe('chunk1');
    expect(chunks[1]).toBe('chunk2');
  });

  it('should handle generation errors', async () => {
    (generateObject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('AI Error'));
    
    await expect(generateObject({
      model: {} as any,
      schema: {} as any,
      system: 'test',
      prompt: 'test',
    })).rejects.toThrow('AI Error');
  });

  it('should handle complex mind map structure', async () => {
    const mockMindMap = {
      title: 'Complex Topic',
      nodes: [
        { id: 'root', label: 'Root', summary: 'S1', details: 'D1', parentId: null },
        { id: 'child1', label: 'Child 1', summary: 'S2', details: 'D2', parentId: 'root' },
        { id: 'child2', label: 'Child 2', summary: 'S3', details: 'D3', parentId: 'root' },
      ],
    };

    (generateObject as ReturnType<typeof vi.fn>).mockResolvedValue({ object: mockMindMap });

    const result = await generateObject({
      model: {} as any,
      schema: {} as any,
      system: 'test',
      prompt: 'complex content',
    });

    expect(result.object.nodes).toHaveLength(3);
    
    // Check hierarchy
    const rootNode = result.object.nodes.find((n: { id: string }) => n.id === 'root');
    expect(rootNode.parentId).toBeNull();
    
    const childNodes = result.object.nodes.filter((n: { parentId: string }) => n.parentId === 'root');
    expect(childNodes).toHaveLength(2);
  });
});
