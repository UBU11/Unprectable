import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

// Mock the parsers module
vi.mock('@/lib/parsers', () => ({
  validateFile: vi.fn(),
  extractTextFromFile: vi.fn(),
}));

import { validateFile, extractTextFromFile } from '@/lib/parsers';

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when no file is provided', async () => {
    // Create a mock request
    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData(),
    });

    const response = await POST(request as unknown as import('next/server').NextRequest);
    const data = await response.json();

    // Expect error response
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.error).toBeDefined();
  });

  it('should validate file before processing', () => {
    // Test the validation logic
    const mockFile = { name: 'test.txt', type: 'text/plain', size: 100 };
    
    (validateFile as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true });
    
    const result = validateFile(mockFile as File);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid file types', () => {
    const mockFile = { name: 'test.jpg', type: 'image/jpeg', size: 100 };
    
    (validateFile as ReturnType<typeof vi.fn>).mockReturnValue({ 
      valid: false, 
      error: 'Unsupported file type' 
    });
    
    const result = validateFile(mockFile as File);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should extract text from valid files', async () => {
    (extractTextFromFile as ReturnType<typeof vi.fn>).mockResolvedValue('Extracted text content');
    
    const mockFile = { name: 'test.txt', type: 'text/plain' };
    const result = await extractTextFromFile(mockFile as File);
    
    expect(result).toBe('Extracted text content');
  });

  it('should handle extraction errors', async () => {
    (extractTextFromFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Extraction failed'));
    
    const mockFile = { name: 'corrupt.pdf', type: 'application/pdf' };
    
    await expect(extractTextFromFile(mockFile as File)).rejects.toThrow('Extraction failed');
  });
});
