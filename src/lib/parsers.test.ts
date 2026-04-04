import { describe, it, expect, vi } from 'vitest';
import {
  validateFile,
  getDocumentType,
  extractTextFromFile,
  type SupportedFileType,
} from './parsers';

describe('validateFile', () => {
  it('should validate a valid text file', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate a valid markdown file', () => {
    const file = new File(['# Title'], 'test.md', { type: 'text/markdown' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should validate a valid PDF file', () => {
    const file = new File(['%PDF-1.4'], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should validate a valid CSV file', () => {
    const file = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should validate by extension when MIME type is empty', () => {
    const file = new File(['content'], 'test.txt', { type: '' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject files larger than 10MB', () => {
    const largeContent = new Uint8Array(11 * 1024 * 1024); // 11MB
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('should reject unsupported file types', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported');
  });

  it('should reject files with unsupported extensions', () => {
    const file = new File(['content'], 'test.exe', { type: 'application/octet-stream' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
  });

  it('should validate file at exactly 10MB', () => {
    const content = new Uint8Array(10 * 1024 * 1024); // Exactly 10MB
    const file = new File([content], 'max-size.txt', { type: 'text/plain' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });
});

describe('getDocumentType', () => {
  it('should return text/markdown for .md files', () => {
    const file = new File([''], 'test.md', { type: '' });
    expect(getDocumentType(file)).toBe('text/markdown');
  });

  it('should return text/csv for .csv files', () => {
    const file = new File([''], 'data.csv', { type: '' });
    expect(getDocumentType(file)).toBe('text/csv');
  });

  it('should return application/pdf for .pdf files', () => {
    const file = new File([''], 'doc.pdf', { type: '' });
    expect(getDocumentType(file)).toBe('application/pdf');
  });

  it('should return text/plain for .txt files', () => {
    const file = new File([''], 'readme.txt', { type: '' });
    expect(getDocumentType(file)).toBe('text/plain');
  });

  it('should fallback to MIME type for unknown extensions', () => {
    const file = new File([''], 'unknown.xyz', { type: 'text/plain' });
    expect(getDocumentType(file)).toBe('text/plain');
  });

  it('should return text/plain as default for unknown types', () => {
    const file = new File([''], 'file.unknown', { type: 'application/octet-stream' });
    expect(getDocumentType(file)).toBe('text/plain');
  });

  it('should prioritize extension over MIME type for markdown', () => {
    const file = new File([''], 'notes.md', { type: 'text/plain' });
    expect(getDocumentType(file)).toBe('text/markdown');
  });
});

describe('extractTextFromFile', () => {
  it('should extract text from plain text file', async () => {
    const content = 'Hello, World!';
    const file = new File([content], 'test.txt', { type: 'text/plain' });
    const result = await extractTextFromFile(file);
    expect(result).toBe(content);
  });

  it('should extract text from markdown file', async () => {
    const content = '# Markdown Title\n\nSome content here.';
    const file = new File([content], 'test.md', { type: 'text/markdown' });
    const result = await extractTextFromFile(file);
    expect(result).toBe(content);
  });

  it('should extract text from CSV file', async () => {
    const content = 'name,age\nAlice,30\nBob,25';
    const file = new File([content], 'test.csv', { type: 'text/csv' });
    const result = await extractTextFromFile(file);
    expect(result).toContain('name: Alice');
    expect(result).toContain('age: 30');
    expect(result).toContain('Total rows: 2');
  });

  it('should extract text from CSV with headers', async () => {
    const content = 'id,title,description\n1,First,Description one\n2,Second,Description two';
    const file = new File([content], 'data.csv', { type: 'text/csv' });
    const result = await extractTextFromFile(file);
    expect(result).toContain('id, title, description');
    expect(result).toContain('id: 1');
    expect(result).toContain('title: First');
  });

  it('should handle empty CSV', async () => {
    const content = 'header1,header2';
    const file = new File([content], 'empty.csv', { type: 'text/csv' });
    const result = await extractTextFromFile(file);
    expect(result).toContain('header1, header2');
    expect(result).toContain('Total rows: 0');
  });

  it('should handle CSV with special characters', async () => {
    const content = 'name,value\n"Special, Char",100\n"New\nLine",200';
    const file = new File([content], 'special.csv', { type: 'text/csv' });
    const result = await extractTextFromFile(file);
    expect(result).toBeTruthy();
  });

  it('should handle unsupported file types by falling back to text/plain', async () => {
    // The getDocumentType function returns text/plain as default
    // So the file is treated as plain text
    const file = new File(['some content'], 'test.jpg', { type: 'image/jpeg' });
    // This won't throw but will try to extract as text/plain
    const result = await extractTextFromFile(file);
    expect(result).toBe('some content');
  });
});

describe('File Type Integration', () => {
  it('should handle complete workflow for text file', async () => {
    const content = 'Document content here';
    const file = new File([content], 'doc.txt', { type: 'text/plain' });
    
    // Validate
    const validation = validateFile(file);
    expect(validation.valid).toBe(true);
    
    // Get type
    const docType = getDocumentType(file);
    expect(docType).toBe('text/plain');
    
    // Extract
    const extracted = await extractTextFromFile(file);
    expect(extracted).toBe(content);
  });

  it('should handle complete workflow for markdown file', async () => {
    const content = '# Title\n\nContent';
    const file = new File([content], 'doc.md', { type: 'text/markdown' });
    
    expect(validateFile(file).valid).toBe(true);
    expect(getDocumentType(file)).toBe('text/markdown');
    expect(await extractTextFromFile(file)).toBe(content);
  });

  it('should handle complete workflow for CSV file', async () => {
    const content = 'a,b\n1,2\n3,4';
    const file = new File([content], 'data.csv', { type: 'text/csv' });
    
    expect(validateFile(file).valid).toBe(true);
    expect(getDocumentType(file)).toBe('text/csv');
    const extracted = await extractTextFromFile(file);
    expect(extracted).toContain('a: 1');
    expect(extracted).toContain('b: 2');
  });
});
