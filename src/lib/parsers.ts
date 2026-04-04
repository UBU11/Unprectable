import Papa from 'papaparse';

export type SupportedFileType = 'text/plain' | 'text/markdown' | 'application/pdf' | 'text/csv';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['txt', 'md', 'pdf', 'csv'];

  // Accept by MIME type OR by file extension
  const validMimes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv', ''];
  if (!validMimes.includes(file.type) && !validExtensions.includes(ext ?? '')) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || ext}. Supported: .txt, .md, .pdf, .csv`,
    };
  }

  return { valid: true };
}

export function getDocumentType(file: File): SupportedFileType {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'md') return 'text/markdown';
  if (ext === 'csv') return 'text/csv';
  if (ext === 'pdf') return 'application/pdf';
  // Fallback to MIME type
  if (file.type === 'text/markdown') return 'text/markdown';
  if (file.type === 'text/csv') return 'text/csv';
  if (file.type === 'application/pdf') return 'application/pdf';
  return 'text/plain';
}

export async function extractTextFromFile(file: File): Promise<string> {
  const docType = getDocumentType(file);

  switch (docType) {
    case 'text/plain':
    case 'text/markdown':
      return extractPlainText(file);

    case 'application/pdf':
      return extractPdfText(file);

    case 'text/csv':
      return extractCsvText(file);

    default:
      throw new Error(`Unsupported file type: ${docType}`);
  }
}

async function extractPlainText(file: File): Promise<string> {
  return await file.text();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractCsvText(file: File): Promise<string> {
  const text = await file.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors.length > 0) {
    console.warn('CSV parse warnings:', parsed.errors);
  }

  const headers = parsed.meta.fields ?? [];
  const rows = parsed.data as Record<string, unknown>[];

  let output = `CSV Data: ${headers.join(', ')}\n`;
  output += `Total rows: ${rows.length}\n\n`;

  for (const row of rows) {
    const line = headers
      .map((h) => `${h}: ${row[h] ?? 'N/A'}`)
      .join(' | ');
    output += `${line}\n`;
  }

  return output;
}
