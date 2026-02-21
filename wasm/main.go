//go:build js && wasm

package main

import (
	"syscall/js"
)

func parseBallerina(this js.Value, args []js.Value) interface{} {
	if len(args) == 0 {
		return map[string]interface{}{
			"success": false,
			"error":   "no source code provided",
		}
	}

	source := args[0].String()

	result := parseSource(source)

	resultMap := map[string]interface{}{
		"success": result.Success,
	}

	if result.SyntaxTree != "" {
		resultMap["syntaxTree"] = result.SyntaxTree
	}

	if result.Error != "" {
		resultMap["error"] = result.Error
	}

	return resultMap
}

func main() {
	js.Global().Set("parseBallerina", js.FuncOf(parseBallerina))

	select {}
}
