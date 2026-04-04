import { generateObject } from 'ai';
import { model } from '@/lib/ai';
import { derivativeNodeSchema, type DerivativeNodeData } from '@/lib/schema';

const SYSTEM_PROMPT = `You are an expert technical educator. The user is connecting two concepts from a documentation mind map. Your task is to explain the intersection, relationship, or combined application of Concept A and Concept B.

Create a single new concept node that represents the synthesis of both concepts.

Rules:
- The label should be 1-3 words that capture the combined/intersection idea
- The summary should be a clear 1-sentence explanation of how these concepts relate or combine
- The details should be 3-5 sentences covering:
  - How the two concepts intersect or relate
  - What new understanding emerges from combining them
  - Practical applications of this combined knowledge
  - Any important nuances or caveats`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nodeA: { label: string; details: string } | undefined = body.nodeA;
    const nodeB: { label: string; details: string } | undefined = body.nodeB;

    if (!nodeA?.label || !nodeB?.label) {
      return Response.json(
        { error: 'Both nodeA and nodeB with label and details are required' },
        { status: 400 }
      );
    }

    const { object }: { object: DerivativeNodeData } = await generateObject({
      model,
      schema: derivativeNodeSchema,
      system: SYSTEM_PROMPT,
      prompt: `Concept A: "${nodeA.label}"\nDetails: ${nodeA.details}\n\nConcept B: "${nodeB.label}"\nDetails: ${nodeB.details}\n\nExplain the intersection, relationship, or combined application of these two concepts.`,
    });

    return Response.json(object);
  } catch (error) {
    console.error('Derivative generation error:', error);
    return Response.json(
      { error: 'Failed to synthesize concepts' },
      { status: 500 }
    );
  }
}
