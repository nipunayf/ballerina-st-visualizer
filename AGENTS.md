# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

Ballerina Syntax Tree Visualizer - A React web application that visualizes Ballerina language syntax trees using a graphical tree representation. It uses a WebAssembly-based Ballerina parser to parse source code and render the resulting AST.

## Build/Lint/Test Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production (runs TypeScript check + Vite build)
bun run build

# Lint all files
bun run lint

# Preview production build
bun run preview
```

**Note:** No test framework is currently configured. If tests are added, update this section.

## Tech Stack

- **Runtime:** Bun
- **Framework:** React 19 with TypeScript 5.9
- **Bundler:** Vite 7
- **UI Libraries:** Semantic UI React, Framer Motion
- **Graph Layout:** ELK.js
- **Code Editor:** react-simple-code-editor with highlight.js
- **Parser:** WebAssembly (Go-based Ballerina parser)

## Code Style Guidelines

### File Organization

```
src/
├── visualizer/
│   ├── components/       # React components (graphical/, dropdown/)
│   ├── representations/  # Top-level view components
│   ├── resources/        # Constants and TypeScript interfaces
│   ├── styles/           # CSSProperties style objects
│   └── tools/            # Utility functions and mappers
├── services/             # External service integrations (WASM parser)
├── types/                # Global TypeScript declarations
├── App.tsx               # Main application component
└── main.tsx              # Entry point
```

### Imports

Organize imports in this order, separated by blank lines:

1. React and external libraries
2. Internal components and utilities
3. Types (use `import type`)
4. Styles and CSS

```typescript
// External libraries first
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Internal imports
import MyComponent from "./components/MyComponent";
import { SOME_CONSTANT } from "./resources/constants";

// Type imports (use 'type' keyword)
import type { TreeNode, TreeGraph } from "./resources/tree-interfaces";

// Styles last
import * as styles from "./styles/component.styles";
import "./styles.css";
```

### TypeScript

- **Strict mode is enabled.** All code must pass strict type checking.
- Use `import type` for type-only imports (required by `verbatimModuleSyntax`).
- Prefer explicit return types for exported functions.
- Avoid `any` where possible; use `unknown` or specific types.
- Interface properties should be explicitly typed.

```typescript
// Good
export function processData(data: unknown): Result {
  if (!isValidData(data)) throw new Error("Invalid data");
  return transform(data);
}

// Avoid
export function processData(data: any) {
  return transform(data);
}
```

### React Components

- Use function declarations for components (not arrow functions).
- Components are named with PascalCase and default-exported.
- Destructure props in the function signature.

```typescript
// Preferred
function TreeNode(props: GraphicalNodeProps) {
  const { node, onCollapseTree } = props;
  // ...
}

export default TreeNode;

// Avoid
const TreeNode = (props: GraphicalNodeProps) => {
  // ...
};
```

- Use typed `useState` when the initial value doesn't convey the type:

```typescript
const [graphicalTree, setGraphicalTree] = useState<TreeGraph | undefined>(undefined);
```

- Use `useCallback` for functions passed as props to prevent unnecessary re-renders.
- Use `useRef` for mutable values that don't trigger re-renders.

### Styles

- Styles are defined as typed `CSSProperties` objects in separate `.ts` files under `styles/`.
- Export style objects as named exports.

```typescript
import type { CSSProperties } from "react";

export const nodeContainerStyle: CSSProperties = {
  position: "absolute",
  borderRadius: 4,
  padding: "4px 8px",
};
```

- Inline styles are acceptable for dynamic values or one-off styles.

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TreeNode`, `GraphicalTree` |
| Functions | camelCase | `mapSyntaxTree`, `retrieveGraph` |
| Constants | SCREAMING_SNAKE_CASE | `TOKEN_COLOR`, `LAYOUT_OPTIONS` |
| Interfaces | PascalCase | `TreeNode`, `TreeGraph`, `PrimaryProps` |
| Files (components) | PascalCase or camelCase | `treeNode.tsx`, `syntaxTree.tsx` |
| Files (utilities) | kebab-case | `syntax-tree-mapper.ts` |

### Error Handling

- Use ErrorBoundary class components for React error boundaries.
- Log errors with `console.error()` for debugging.
- Return error states in async functions rather than throwing when appropriate.

```typescript
// Async function with error result
export async function parse(source: string): Promise<ParseResult> {
  try {
    await loadWasm();
    return window.parseBallerina(source);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e)
    };
  }
}
```

- Use ESLint disable comments sparingly and only when necessary:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [renderKey]);
```

### State Management

- Use React's built-in state management (useState, useReducer, useContext).
- For complex state shared across components, lift state to the nearest common ancestor.
- Debounce expensive operations (e.g., parsing on code change).

### File Headers

For files containing WSO2-originated code, include the Apache License header:

```typescript
/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * ...
 */
```

## Important Files

| File | Purpose |
|------|---------|
| `src/visualizer/resources/tree-interfaces.ts` | Core TypeScript interfaces |
| `src/visualizer/resources/constants.ts` | Application constants |
| `src/services/wasm-parser.ts` | WASM parser integration |
| `src/visualizer/tools/syntax-tree-mapper.ts` | AST to tree structure mapping |
| `public/wasm/` | WebAssembly parser files |

## Common Tasks

### Adding a new component

1. Create file in appropriate `components/` subdirectory
2. Import interfaces from `resources/tree-interfaces.ts`
3. Import styles from `styles/` directory
4. Export as default

### Adding a new interface

1. Add to `src/visualizer/resources/tree-interfaces.ts`
2. Use `export interface` syntax
3. Document complex properties with JSDoc if needed

### Modifying tree rendering logic

1. Core mapping logic is in `tools/syntax-tree-mapper.ts`
2. Graph layout uses ELK.js via `tools/syntax-graph-mapper.ts`
3. Layout options defined in `resources/constants.ts`

## Notes

- The WASM parser is loaded asynchronously on app initialization.
- The application uses a split-pane layout with resizable dividers.
- Syntax trees are re-rendered with a `renderKey` to trigger updates.
