declare global {
  interface ParseResult {
    success: boolean;
    syntaxTree?: string;
    error?: string;
  }

  function parseBallerina(source: string): ParseResult;
}

export {};
