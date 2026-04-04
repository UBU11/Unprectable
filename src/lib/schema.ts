import { z } from 'zod';

export const mindMapSchema = z.object({
  title: z.string().describe('Main topic of the documentation'),
  nodes: z.array(
    z.object({
      id: z.string().describe('Unique identifier (no spaces)'),
      label: z.string().describe('Short, 1-3 word title'),
      summary: z.string().describe('1-sentence simple explanation'),
      details: z.string().describe('Detailed 3-5 sentence explanation of this concept, including key points, relationships, and practical implications'),
      parentId: z.string().nullable().describe('ID of parent node. Null if root.'),
    })
  ),
});

export type MindMapData = z.infer<typeof mindMapSchema>;

export const generateMapInputSchema = z.object({
  text: z.string().min(1).describe('Raw text or extracted document content'),
  fileName: z.string().optional().describe('Original file name for context'),
});

export type GenerateMapInput = z.infer<typeof generateMapInputSchema>;

export const derivativeNodeSchema = z.object({
  label: z.string().describe('1-3 word title for the combined concept'),
  summary: z.string().describe('1-sentence explanation of how they intersect'),
  details: z.string().describe('3-5 sentences detailing the relationship, intersection, and practical application of both concepts combined'),
});

export type DerivativeNodeData = z.infer<typeof derivativeNodeSchema>;
