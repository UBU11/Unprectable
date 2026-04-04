# Unpreactable: AI-Powered Visual Learning Platform

## Overview

Unpreactable is an AI-powered visual learning platform that transforms dense, text-heavy documentation into interactive, easily digestible mind maps. By leveraging Large Language Models (LLMs) to parse and structure content, the platform automatically generates hierarchical nodes and edges, allowing users to visually navigate complex technical concepts.

## Features

- **AI-Powered Mind Map Generation**: Automatically converts text documentation into structured mind maps using Mistral AI.
- **Interactive Canvas**: Drag, drop, and manually organize nodes with a premium feel similar to tools like n8n or Miro.
- **Auto-Layout**: Automatically organizes nodes into a neat grid using Dagre.js.
- **Hybrid Layout Lifecycle**: Supports both manual dragging and auto-layout, ensuring flexibility and ease of use.
- **Real-Time Updates**: Nodes and edges update dynamically as users interact with the canvas.

## Architecture

### Frontend
- **Framework**: Next.js (React) using the App Router.
- **Mind Map Renderer**: `React Flow` for interactive visualization.
- **Styling**: Tailwind CSS + shadcn/ui for rapid, accessible component development.

### Middleware / API
- **Engine**: Vercel AI SDK (`@ai-sdk/mistral`) for seamless integration with React and structured output.
- **Validation**: `Zod` for enforcing strict JSON schemas.

### AI Layer
- **Model**: Mistral API (`mistral-large-latest` or `mistral-small`) for parsing and structuring content.

## Data Flow

1. **Input**: User pastes documentation text or URL into the UI.
2. **Request**: Frontend sends a `POST` request to the Next.js API route (`/api/generate-map`).
3. **Processing**: Vercel AI SDK wraps the text with a predefined system prompt and `Zod` schema, sending it to the Mistral API.
4. **Transformation**: Mistral parses the text, extracts core concepts, and formats them into parent/child nodes.
5. **Response**: Next.js API returns validated JSON to the frontend.
6. **Rendering**: Utility function maps JSON into `React Flow`'s `{ id, position, data }` format for interactive visualization.

## Core Data Schema

The platform enforces a strict schema for mind map data:

```typescript
import { z } from 'zod';

export const mindMapSchema = z.object({
  title: z.string().describe("Main topic of the documentation"),
  nodes: z.array(
    z.object({
      id: z.string().describe("Unique identifier (no spaces)"),
      label: z.string().describe("Short, 1-3 word title"),
      summary: z.string().describe("1-sentence simple explanation"),
      parentId: z.string().nullable().describe("ID of parent node. Null if root.")
    })
  )
});
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Mistral API key (for AI functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `app` directory and add your Mistral API key:
   ```env
   MISTRAL_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Generate a Mind Map**:
   - Paste your documentation text or URL into the input field.
   - Click "Generate Map" to create an interactive mind map.

2. **Interact with the Canvas**:
   - Drag nodes to manually organize them.
   - Use the "Auto-Organize" button to automatically layout nodes.
   - Zoom and pan to navigate large mind maps.

3. **Save and Export**:
   - Export your mind map as an image or JSON file for later use.

## Development

### Scripts

- **Development**:
  ```bash
  npm run dev
  ```

- **Build**:
  ```bash
  npm run build
  npm run start
  ```

- **Linting**:
  ```bash
  npm run lint
  npm run lint -- --fix
  ```

- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```

- **Testing**:
  ```bash
  npm run test
  npm run test:watch
  npm run test:coverage
  ```

### Code Style Guidelines

- **TypeScript**: Use strict mode, explicit types, and avoid `any`.
- **Imports**: Use path aliases (`@/*` for `./src/*`).
- **Naming**: Use PascalCase for components, camelCase for functions, and UPPER_SNAKE_CASE for constants.
- **Styling**: Use Tailwind CSS utility classes and shadcn/ui components.

### File Organization

```
app/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   └── ui/           # Reusable UI components (shadcn)
│   └── lib/              # Utility functions, schemas, AI config
│       ├── ai.ts         # AI model configuration
│       ├── schema.ts     # Zod schemas
│       └── utils.ts      # Helper functions
└── public/               # Static assets
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure all tests pass.
4. Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, please open an issue on the GitHub repository.
