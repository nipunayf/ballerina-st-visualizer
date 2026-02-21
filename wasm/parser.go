package main

import (
	"ballerina-lang-go/parser"
	"ballerina-lang-go/parser/tree"
	"ballerina-lang-go/tools/text"
)

type ParseResult struct {
	Success    bool   `json:"success"`
	SyntaxTree string `json:"syntaxTree,omitempty"`
	Error      string `json:"error,omitempty"`
}

func parseSource(source string) ParseResult {
	charReader := text.CharReaderFromText(source)

	lexer := parser.NewLexer(charReader, nil)

	tokenReader := parser.CreateTokenReader(*lexer, nil)

	ballerinaParser := parser.NewBallerinaParserFromTokenReader(tokenReader, nil)

	rootNode := ballerinaParser.Parse()

	stModulePart, ok := rootNode.(*tree.STModulePart)
	if !ok {
		return ParseResult{
			Success: false,
			Error:   "failed to parse: unexpected root node type",
		}
	}

	jsonOutput := tree.GenerateJSON(stModulePart)

	return ParseResult{
		Success:    true,
		SyntaxTree: jsonOutput,
	}
}
