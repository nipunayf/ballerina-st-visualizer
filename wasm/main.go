// Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
