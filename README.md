# Ballerina Syntax Tree Visualizer

A React web application that visualizes Ballerina language syntax trees using an interactive graphical tree representation. Write Ballerina code in the editor and see the resulting Abstract Syntax Tree (AST) rendered in real-time.

## Features

- **Live Parsing**: Ballerina source code is parsed in real-time using a WebAssembly-based parser
- **Interactive Tree Visualization**: Explore syntax tree nodes with hover details, diagnostics, and expandable/collapsible branches
- **Syntax Highlighting**: Ballerina code highlighting powered by highlight.js
- **Resizable Split-Pane Layout**: Adjust editor and visualizer proportions dynamically
- **Error Diagnostics**: Visual indicators for syntax errors and warnings in the tree

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The app will be available at `http://localhost:5173`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Bundler | Vite 7 |
| UI Components | Semantic UI React |
| Animations | Framer Motion |
| Graph Layout | ELK.js |
| Code Editor | react-simple-code-editor |
| Parser | WebAssembly (Go-based Ballerina parser) |

## Project Structure

```
src/
├── visualizer/
│   ├── components/          # React components
│   │   ├── graphical/       # Graphical tree node/edge components
│   │   └── dropdown/        # Dropdown tree components
│   ├── representations/     # Top-level tree view components
│   ├── resources/           # Constants and TypeScript interfaces
│   ├── styles/              # CSSProperties style objects
│   └── tools/               # AST mappers and utility functions
├── services/                # WASM parser integration
├── types/                   # Global TypeScript declarations
├── App.tsx                  # Main application
└── main.tsx                 # Entry point
```

## How It Works

1. **Code Input**: User writes Ballerina code in the left editor pane
2. **Parsing**: Code is sent to a WebAssembly-based Ballerina parser (Go compiled to WASM)
3. **AST Mapping**: The parser output is transformed into a tree structure
4. **Layout**: ELK.js calculates optimal node positions for the graph
5. **Rendering**: React/Framer Motion renders an interactive, animated tree

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Type-check and build for production |
| `bun run lint` | Run ESLint on all files |
| `bun run preview` | Preview production build locally |

## License

Apache License 2.0 - Copyright (c) 2021 WSO2 Inc.
