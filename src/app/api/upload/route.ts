import { NextRequest } from 'next/server';
import { validateFile, extractTextFromFile } from '@/lib/parsers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[upload] Received: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const validation = validateFile(file);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const text = await extractTextFromFile(file);
    console.log(`[upload] Extracted ${text.length} chars from ${file.name}`);

    if (!text || text.trim().length === 0) {
      return Response.json(
        { error: 'Could not extract any text from the file' },
        { status: 422 }
      );
    }

    return Response.json({
      text,
      fileName: file.name,
      fileSize: file.size,
      charCount: text.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '';
    console.error('[upload] Error:', message);
    console.error('[upload] Stack:', stack);
    return Response.json(
      { error: `Failed to process file: ${message}` },
      { status: 500 }
    );
  }
}
