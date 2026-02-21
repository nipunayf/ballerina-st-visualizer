# Ballerina Parser WASM

WebAssembly-based parser for Ballerina source code. Parses Ballerina source and returns a JSON representation of the Syntax Tree.

## Build

```bash
GOOS=js GOARCH=wasm go build -o bal-parser.wasm ./wasm
```

## Usage

### JavaScript / TypeScript

```javascript
import './wasm_exec.js';

async function parse(source) {
    const go = new globalThis.Go();
    
    const response = await fetch('./bal-parser.wasm');
    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    const instance = await WebAssembly.instantiate(module, go.importObject);
    
    go.run(instance);
    
    return globalThis.parseBallerina(source);
}

const result = await parse(`public function main() {
    string s = "hello world";
}`);
```

### API

```typescript
function parseBallerina(source: string): ParseResult

interface ParseResult {
    success: boolean;
    syntaxTree?: string;  // JSON string of the syntax tree
    error?: string;      // Error message if parsing failed
}
```

## JSON Output Structure

The syntax tree is returned as a JSON object with the following structure:

```json
{
  "kind": "MODULE_PART",
  "children": [
    { "kind": "LIST", "children": [...] },  // Import declarations
    { "kind": "LIST", "children": [...] },  // Top-level declarations
    { "kind": "EOF_TOKEN" }
  ]
}
```

### Node Structure

Each node in the tree has:

| Field | Type | Description |
|-------|------|-------------|
| `kind` | string | The syntax kind (e.g., `MODULE_PART`, `FUNCTION_DEFINITION`, `IDENTIFIER_TOKEN`) |
| `children` | array | Child nodes (for non-terminals) |
| `value` | string | Token text value (for tokens with dynamic values like identifiers, literals) |
| `leadingMinutiae` | array | Whitespace/comments before the token |
| `trailingMinutiae` | array | Whitespace/comments after the token |
| `isMissing` | boolean | Whether the node is missing in the source |
| `hasDiagnostics` | boolean | Whether the node has parse errors |
| `diagnostics` | array | Error codes if hasDiagnostics is true |

### Syntax Kinds

**Tokens:**
- Keywords: `PUBLIC_KEYWORD`, `FUNCTION_KEYWORD`, `STRING_KEYWORD`, etc.
- Operators: `OPEN_PAREN_TOKEN`, `CLOSE_PAREN_TOKEN`, `EQUAL_TOKEN`, etc.
- Literals: `IDENTIFIER_TOKEN`, `STRING_LITERAL_TOKEN`, `DECIMAL_INTEGER_LITERAL_TOKEN`, etc.

**Nodes:**
- Module: `MODULE_PART`
- Declarations: `FUNCTION_DEFINITION`, `IMPORT_DECLARATION`, `TYPE_DEFINITION`, `CONST_DECLARATION`
- Statements: `LOCAL_VAR_DECL`, `IF_STATEMENT`, `WHILE_STATEMENT`, `RETURN_STATEMENT`
- Expressions: `STRING_LITERAL`, `CALL_EXPRESSION`, `BINARY_EXPRESSION`
- Patterns: `TYPED_BINDING_PATTERN`, `CAPTURE_BINDING_PATTERN`
- Types: `STRING_TYPE_DESC`, `INT_TYPE_DESC`, `ARRAY_TYPE_DESC`, etc.

### Example

Input:
```ballerina
public function main() {
    string s = "hello world";
}
```

Output (abbreviated):
```json
{
  "kind": "MODULE_PART",
  "children": [
    { "kind": "LIST", "children": [] },
    {
      "kind": "LIST",
      "children": [
        {
          "kind": "FUNCTION_DEFINITION",
          "children": [
            { "kind": "LIST", "children": [{ "kind": "PUBLIC_KEYWORD" }] },
            { "kind": "FUNCTION_KEYWORD" },
            { "kind": "IDENTIFIER_TOKEN", "value": "main" },
            { "kind": "FUNCTION_SIGNATURE", "children": [...] },
            {
              "kind": "FUNCTION_BODY_BLOCK",
              "children": [
                { "kind": "OPEN_BRACE_TOKEN" },
                {
                  "kind": "LOCAL_VAR_DECL",
                  "children": [
                    { "kind": "TYPED_BINDING_PATTERN", "children": [...] },
                    { "kind": "EQUAL_TOKEN" },
                    { "kind": "STRING_LITERAL", "children": [...] },
                    { "kind": "SEMICOLON_TOKEN" }
                  ]
                },
                { "kind": "CLOSE_BRACE_TOKEN" }
              ]
            }
          ]
        }
      ]
    },
    { "kind": "EOF_TOKEN" }
  ]
}
```

## Files

- `bal-parser.wasm` - Compiled WebAssembly module
- `wasm_exec.js` - Go JavaScript runtime (required)
- `types.d.ts` - TypeScript type definitions
