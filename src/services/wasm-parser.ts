import "../types/wasm-types.d.ts";

let wasmLoaded = false;
let loadPromise: Promise<void> | null = null;

async function loadWasm() {
    if (wasmLoaded) return;
    if (loadPromise) return loadPromise;

    loadPromise = new Promise(async (resolve, reject) => {
        try {
            // 1. Load the Go WASM runtime
            if (!window.Go) {
                await new Promise<void>((resolveScript, rejectScript) => {
                    const script = document.createElement("script");
                    script.src = "/wasm/wasm_exec.js";
                    script.onload = () => resolveScript();
                    script.onerror = () => rejectScript(new Error("Failed to load wasm_exec.js"));
                    document.body.appendChild(script);
                });
            }

            // 2. Instantiate the WASM module
            const go = new window.Go();
            
            let response: Response;
            try {
                response = await fetch("/wasm/bal-parser.wasm?v=" + new Date().getTime());
                if (!response.ok) {
                    throw new Error(`Failed to fetch WASM: ${response.statusText}`);
                }
            } catch (fetchError) {
                // Fallback for development if /wasm path isn't working as expected (e.g. some vite configs)
                // This is a backup attempt relative to base
                response = await fetch("wasm/bal-parser.wasm?v=" + new Date().getTime());
            }

            const buffer = await response.arrayBuffer();
            const result = await WebAssembly.instantiate(buffer, go.importObject);
            
            // 3. Run the Go program (which registers parseBallerina globally)
            go.run(result.instance);
            
            wasmLoaded = true;
            resolve();
        } catch (e) {
            console.error("Failed to initialize WASM parser:", e);
            reject(e);
        }
    });

    return loadPromise;
}

export async function parse(source: string): Promise<ParseResult> {
    try {
        await loadWasm();
        // The Go function is attached to global scope
        return window.parseBallerina(source);
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e)
        };
    }
}
