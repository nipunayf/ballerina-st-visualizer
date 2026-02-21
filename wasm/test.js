const fs = require('fs');

require('./wasm_exec.js');

const source = `public function main() {
    string s = "hello world";
}`;

async function main() {
    const go = new globalThis.Go();
    
    const wasmBuffer = fs.readFileSync('./bal-parser.wasm');
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(wasmModule, go.importObject);
    
    go.run(instance);
    
    const result = globalThis.parseBallerina(source);
    
    if (result.success) {
        fs.writeFileSync('output.json', result.syntaxTree);
        console.log('Success! Output written to output.json');
    } else {
        console.error('Parse error:', result.error);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
