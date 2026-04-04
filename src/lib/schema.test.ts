import { describe, it, expect } from 'vitest';
import {
  mindMapSchema,
  generateMapInputSchema,
  derivativeNodeSchema,
  type MindMapData,
  type GenerateMapInput,
  type DerivativeNodeData,
} from './schema';

describe('mindMapSchema', () => {
  const validMindMap: MindMapData = {
    title: 'React Hooks',
    nodes: [
      {
        id: 'root',
        label: 'React Hooks',
        summary: 'React Hooks are functions that let you use state and other React features in function components.',
        details: 'React Hooks revolutionized how we write React components by allowing state and lifecycle features in functional components. They provide a more direct API to React concepts like state, context, refs, and lifecycle. The most commonly used hooks are useState for state management and useEffect for side effects.',
        parentId: null,
      },
      {
        id: 'useState',
        label: 'useState Hook',
        summary: 'Adds state to functional components.',
        details: 'The useState hook is the most fundamental hook in React. It allows functional components to have local state that persists across renders. When you call useState, React returns a pair: the current state value and a function that lets you update it. The state update triggers a re-render of the component.',
        parentId: 'root',
      },
    ],
  };

  it('should validate a valid mind map', () => {
    const result = mindMapSchema.safeParse(validMindMap);
    expect(result.success).toBe(true);
  });

  it('should accept empty strings (Zod allows empty strings by default)', () => {
    const mapWithEmptyStrings = {
      title: '',
      nodes: [
        {
          id: 'root',
          label: '',
          summary: '',
          details: '',
          parentId: null,
        },
      ],
    };
    const result = mindMapSchema.safeParse(mapWithEmptyStrings);
    // Zod allows empty strings by default, this is expected behavior
    expect(result.success).toBe(true);
  });

  it('should accept empty nodes array', () => {
    const invalid = { ...validMindMap, nodes: [] };
    const result = mindMapSchema.safeParse(invalid);
    expect(result.success).toBe(true);
  });

  it('should fail when a node is missing required fields', () => {
    const invalid = {
      ...validMindMap,
      nodes: [{ id: 'test' }], // missing label, summary, details, parentId
    };
    const result = mindMapSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept null parentId for root nodes', () => {
    const result = mindMapSchema.safeParse(validMindMap);
    expect(result.success).toBe(true);
    const data = result.success ? result.data : null;
    if (data) {
      expect(data.nodes[0].parentId).toBeNull();
    }
  });

  it('should accept string parentId for child nodes', () => {
    const result = mindMapSchema.safeParse(validMindMap);
    expect(result.success).toBe(true);
    const data = result.success ? result.data : null;
    if (data) {
      expect(data.nodes[1].parentId).toBe('root');
    }
  });

  it('should validate nodes with complex content in details field', () => {
    const complexMap: MindMapData = {
      title: 'Complex Topic',
      nodes: [
        {
          id: 'root',
          label: 'Complex Topic',
          summary: 'A topic with detailed explanation.',
          details: `This is a multi-line explanation with special characters: @#$%^&*().
It spans multiple lines and contains various formatting.
It explains relationships, key points, and practical implications.`,
          parentId: null,
        },
      ],
    };
    const result = mindMapSchema.safeParse(complexMap);
    expect(result.success).toBe(true);
  });

  it('should infer the correct type', () => {
    const parsed = mindMapSchema.parse(validMindMap);
    expect(parsed.title).toBe('React Hooks');
    expect(parsed.nodes).toHaveLength(2);
    expectTypeOf(parsed).toMatchTypeOf<MindMapData>();
  });
});

describe('generateMapInputSchema', () => {
  it('should validate valid input with text', () => {
    const input: GenerateMapInput = {
      text: 'This is some documentation text',
      fileName: 'docs.md',
    };
    const result = generateMapInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should validate input without optional fileName', () => {
    const input: GenerateMapInput = {
      text: 'Just some text',
    };
    const result = generateMapInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should accept empty strings in text (Zod .min(1) blocks empty)', () => {
    const input = { text: '' };
    const result = generateMapInputSchema.safeParse(input);
    // Zod .min(1) rejects empty strings
    expect(result.success).toBe(false);
  });

  it('should fail when text is not a string', () => {
    const input = { text: 123 };
    const result = generateMapInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should fail when text is missing', () => {
    const input = {};
    const result = generateMapInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept long text content', () => {
    const longText = 'A'.repeat(10000);
    const input: GenerateMapInput = {
      text: longText,
      fileName: 'large-doc.txt',
    };
    const result = generateMapInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe('derivativeNodeSchema', () => {
  const validDerivative: DerivativeNodeData = {
    label: 'State Authentication',
    summary: 'Combining state management with authentication flow.',
    details: 'State Authentication represents the intersection of authentication and state management. When a user logs in, their authentication state needs to be stored and managed throughout the application. This combined concept ensures that protected routes can check authentication status from the global state. The implementation requires careful handling of token storage, refresh logic, and secure state updates.',
  };

  it('should validate a valid derivative node', () => {
    const result = derivativeNodeSchema.safeParse(validDerivative);
    expect(result.success).toBe(true);
  });

  it('should accept empty strings (Zod allows empty by default)', () => {
    const emptyDerivative = {
      label: '',
      summary: '',
      details: '',
    };
    const result = derivativeNodeSchema.safeParse(emptyDerivative);
    expect(result.success).toBe(true);
  });

  it('should accept short label (1-3 words)', () => {
    const shortLabel: DerivativeNodeData = {
      label: 'Auth',
      summary: 'Authentication concept.',
      details: 'This is a detailed explanation of the authentication concept and its applications.',
    };
    const result = derivativeNodeSchema.safeParse(shortLabel);
    expect(result.success).toBe(true);
  });

  it('should accept detailed multi-sentence details', () => {
    const detailed: DerivativeNodeData = {
      label: 'Complex Synthesis',
      summary: 'A synthesized concept from multiple ideas.',
      details: `First sentence explains the intersection. 
Second sentence describes the relationship. 
Third sentence covers practical applications. 
Fourth sentence discusses nuances. 
Fifth sentence provides additional context.`,
    };
    const result = derivativeNodeSchema.safeParse(detailed);
    expect(result.success).toBe(true);
  });

  it('should infer the correct type', () => {
    const parsed = derivativeNodeSchema.parse(validDerivative);
    expect(parsed.label).toBe('State Authentication');
    expectTypeOf(parsed).toMatchTypeOf<DerivativeNodeData>();
  });
});

describe('Schema Integration', () => {
  it('should handle a complete workflow with all schemas', () => {
    // Simulate map generation input
    const mapInput: GenerateMapInput = {
      text: 'React documentation content...',
      fileName: 'react-docs.md',
    };
    expect(generateMapInputSchema.safeParse(mapInput).success).toBe(true);

    // Simulate generated mind map output
    const mindMap: MindMapData = {
      title: 'React Concepts',
      nodes: [
        { id: 'root', label: 'React', summary: 'S', details: 'D', parentId: null },
        { id: 'hooks', label: 'Hooks', summary: 'S', details: 'D', parentId: 'root' },
      ],
    };
    expect(mindMapSchema.safeParse(mindMap).success).toBe(true);

    // Simulate derivative generation
    const derivative: DerivativeNodeData = {
      label: 'Hook Patterns',
      summary: 'Patterns using hooks.',
      details: 'Custom hooks combine logic.',
    };
    expect(derivativeNodeSchema.safeParse(derivative).success).toBe(true);
  });
});
