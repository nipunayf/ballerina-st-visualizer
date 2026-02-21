declare global {
    class Go {
        importObject: any;
        run(instance: WebAssembly.Instance): Promise<void>;
    }

    function parseBallerina(source: string): ParseResult;

    interface ParseResult {
        success: boolean;
        syntaxTree?: string;
        error?: string;
    }

    interface Window {
        Go: typeof Go;
        parseBallerina: typeof parseBallerina;
    }
}

export {};
