import { generateObject } from 'ai';
import { model } from '@/lib/ai';
import { mindMapSchema, type MindMapData } from '@/lib/schema';
import { chunkText } from '@/lib/chunker';

const SYSTEM_PROMPT = `You are an expert at analyzing documentation and breaking it down into structured mind maps.

Given documentation text, extract the core concepts and organize them into a hierarchical mind map structure.

Rules:
- Create a clear root node (parentId: null) representing the main topic
- Break down concepts into child nodes, each with a short label, a 1-sentence summary, and a detailed explanation
- Keep labels to 1-3 words maximum
- The summary field is a brief 1-sentence explanation shown on the mind map node
- The details field is a rich 3-5 sentence explanation that covers key points, relationships to other concepts, and practical implications — this is shown when the user clicks on a node to learn more
- Use meaningful, lowercase IDs with hyphens (e.g., "auth-flow", "data-model")
- Create a sensible hierarchy with 2-3 levels of depth
- Aim for 8-20 nodes total depending on the complexity of the text`;

const MERGE_SYSTEM_PROMPT = `You are an expert at merging multiple mind map structures into a single cohesive master map.

You will receive several mini mind maps generated from different sections of a document. Your job is to:
- Identify the overall main topic and use it as the root node
- Merge overlapping or duplicate concepts into single nodes
- Preserve the hierarchy and relationships between concepts
- Create new parent nodes if needed to organize merged children
- Keep labels to 1-3 words, summaries to 1 sentence
- Write detailed 3-5 sentence explanations for the details field, covering key points, relationships, and practical implications
- Use meaningful, lowercase IDs with hyphens
- Produce a single unified mind map with 10-30 nodes`;

const CHUNK_THRESHOLD = 6000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text: string = body.text;
    const fileName: string | undefined = body.fileName;

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'Text input is required' }, { status: 400 });
    }

    const contextHint = fileName ? `\n\nSource file: ${fileName}` : '';
    const result = text.length > CHUNK_THRESHOLD
      ? await mapReduceGenerate(text, contextHint)
      : await singleGenerate(text, contextHint);

    return Response.json(result);
  } catch (error) {
    console.error('Map generation error:', error);
    return Response.json(
      { error: 'Failed to generate mind map' },
      { status: 500 }
    );
  }
}

async function singleGenerate(text: string, contextHint: string): Promise<MindMapData> {
  const { object } = await generateObject({
    model,
    schema: mindMapSchema,
    system: SYSTEM_PROMPT,
    prompt: `Analyze the following documentation and create a mind map:${contextHint}\n\n${text}`,
  });
  return object;
}

async function mapReduceGenerate(text: string, contextHint: string): Promise<MindMapData> {
  const chunks = await chunkText(text, 4000, 400);
  console.log(`Map-Reduce: Processing ${chunks.length} chunks`);

  const BATCH_SIZE = 3;
  const miniMaps: MindMapData[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((chunk, idx) =>
        generateObject({
          model,
          schema: mindMapSchema,
          system: SYSTEM_PROMPT,
          prompt: `Analyze this section (${i + idx + 1}/${chunks.length}) and create a mind map:${contextHint}\n\n${chunk}`,
        })
      )
    );
    miniMaps.push(...results.map((r) => r.object));
  }

  const mergedMiniMaps = miniMaps.map((m, idx) => `--- Section ${idx + 1}: "${m.title}" ---\n${JSON.stringify(m.nodes, null, 2)}`).join('\n\n');

  const { object } = await generateObject({
    model,
    schema: mindMapSchema,
    system: MERGE_SYSTEM_PROMPT,
    prompt: `Merge the following ${miniMaps.length} mini mind maps into one cohesive master mind map:${contextHint}\n\n${mergedMiniMaps}`,
  });

  return object;
}
