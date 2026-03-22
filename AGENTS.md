# Agent Guidelines for unprectable

## Project Overview

This is a full-stack AI application with:
- **Frontend**: Next.js 16 + React 19 + TypeScript (src/app/)
- **Backend**: Python FastAPI + LangChain/LangGraph (root level)
- **Database**: ChromaDB, Pinecone, Neo4j
- **Auth**: better-auth (social providers: Google, GitHub)
- **AI**: LangGraph agents, sentence-transformers, Ollama

## Build/Lint/Test Commands

### Frontend (src/app/)

```bash
cd src/app

# Install dependencies
pnpm install

# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Production build
pnpm lint                   # Run ESLint
pnpm lint --fix             # Auto-fix lint issues

# No test framework configured yet
```

### Backend (Python)

```bash
# Install dependencies (uses uv)
uv sync

# Run FastAPI server
uvicorn main:app --reload --port 8000

# Run Streamlit RAG UI
streamlit run rag_model.py

# Type checking (if using mypy)
mypy <module_path>
```

### Database Services

```bash
# Neo4j (ensure running on neo4j://localhost:7687)
# Pinecone (cloud)
# ChromaDB (embedded)
```

## Code Style Guidelines

### TypeScript/React Conventions

1. **Imports**
   - Use `import type` for type-only imports
   - Path aliases: `@/*` maps to `./` (e.g., `@/components/ui/button`)
   ```typescript
   import type { ReactNode } from "react"
   import { cn } from "@/lib/utils"
   import { Button } from "@/components/ui/button"
   ```

2. **File Naming**
   - Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
   - Utilities/hooks: `camelCase.ts` (e.g., `useAuth.ts`)
   - Route handlers: `route.ts`

3. **Client Components**
   - Add `"use client"` directive at top of file
   - Use `use client` for interactivity, browser APIs, hooks

4. **TypeScript Strict Mode**
   - Strict mode enabled in tsconfig.json
   - Avoid `any` - use `unknown` with type guards
   - Export types explicitly: `export type { User }`

5. **ClassName Merging**
   - Always use `cn()` utility from `@/lib/utils` for Tailwind classes
   ```typescript
   className={cn("base classes", condition && "conditional-class")}
   ```

6. **Component Patterns**
   - Prefer functional components with explicit return types for non-obvious cases
   - Use shadcn/ui component patterns with `cva` for variant components
   - Export both component and variants function

7. **API Routes**
   - Place in `app/api/[path]/route.ts`
   - Use Next.js App Router patterns with `GET`, `POST` exports

### Python Conventions

1. **Imports**
   - Standard library first, then third-party, then local
   - Use type hints (Python 3.14+)
   ```python
   from typing import Optional
   from fastapi import FastAPI
   ```

2. **File Naming**: `snake_case.py`

3. **FastAPI Patterns**
   - Use Pydantic `BaseModel` for request/response schemas
   - Use dependency injection for shared logic

4. **Async**: Prefer `async def` for FastAPI endpoints

### UI/Styling

1. **Tailwind CSS 4** with shadcn/ui (style: `radix-maia`)
2. **Icons**: hugeicons (`@hugeicons/react`)
3. **CSS Variables** for theming (defined in `app/globals.css`)
4. **Component aliases** (from components.json):
   - `@/components` → `components/`
   - `@/components/ui` → `components/ui/`
   - `@/lib` → `lib/`
   - `@/hooks` → `hooks/`

## Error Handling

- TypeScript: Use `try/catch` with typed errors
- FastAPI: Use HTTPException for API errors
- Always handle null/undefined cases explicitly

## Environment Variables

Required for `src/app/.env`:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
BETTER_AUTH_SECRET=
```

Required for root `.env`:
```
SUPERMEMORY_API_KEY=
```

## Directory Structure

```
src/app/
├── app/                    # Next.js App Router pages
│   ├── api/auth/           # Auth API routes
│   ├── account/            # Account page
│   ├── organization/       # Organization pages
│   └── layout.tsx          # Root layout
├── components/ui/          # shadcn/ui components
├── lib/                    # Utilities (auth.ts, utils.ts)
├── provider/               # React context providers
├── store/                  # Client state (empty)
├── types/                  # TypeScript types (empty)
└── hooks/                  # Custom React hooks (empty)

Root level:
├── main.py                 # FastAPI server
├── rag_model.py            # Streamlit RAG UI
├── db/                     # Database clients (Neo4j, Pinecone)
├── lib/                    # Python utilities
├── context/                # Context generation (Supermemory)
├── schema/                 # Pydantic schemas (empty)
└── test/                   # Python tests (empty)
```

## Important Notes

- **No test framework** configured yet - add one when needed
- **Strict TypeScript** is enforced (no implicit any)
- **No comments** in code unless explaining complex logic
- **No emojis** in code or commit messages
- **Use `pnpm`** for frontend package management
- **Use `uv`** for Python package management
