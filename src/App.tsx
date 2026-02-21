import { Component, useCallback, useEffect, useRef, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import ballerina from "@ballerina/highlightjs-ballerina";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("ballerina", ballerina);
import ELK from "elkjs/lib/elk.bundled.js";
import * as _ from "lodash";
import SyntaxTree from "./visualizer/syntaxTree";
import { FULL_TREE_MODE } from "./visualizer/resources/constants";
import type { ResponseProps } from "./visualizer/resources/tree-interfaces";
import { retrieveGraph, updateSyntaxTree } from "./visualizer/tools/syntax-tree-generator";
import { HELLO_WORLD_SOURCE } from "./services/mock-parser";
import { parse } from "./services/wasm-parser";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

const elk = new ELK();

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#DB3247', background: '#fff', borderRadius: '8px' }}>
          <h3>Something went wrong in the Visualizer.</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <pre style={{ fontSize: '10px', marginTop: '10px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}



function App() {
  const [code, setCode] = useState<string>(HELLO_WORLD_SOURCE);
  const [syntaxTreeData, setSyntaxTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [renderKey, setRenderKey] = useState(0);
  const [splitWidth, setSplitWidth] = useState(50); // percentage for the first pane
  const isResizing = useRef(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  function buildTreeResponse(syntaxTree: any, forceReset = false): Promise<ResponseProps> {
    if (!syntaxTree) {
      return Promise.reject("No syntax tree data");
    }

    const graphResult = (!initialized.current || forceReset)
      ? retrieveGraph(syntaxTree, FULL_TREE_MODE)
      : updateSyntaxTree("", true);

    initialized.current = true;

    return elk.layout(graphResult.treeGraph).then((_layoutResult) => {
      return {
        treeGraph: _layoutResult as any,
        treeArray: graphResult.syntaxTreeObj as any
      };
    }).catch((_err) => {
      return {
        treeGraph: graphResult.treeGraph as any,
        treeArray: graphResult.syntaxTreeObj as any
      };
    });
  }

  // Initial parse on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const initParser = async () => {
      try {
        const result = await parse(code);
        if (mounted && result.success && result.syntaxTree) {
          setSyntaxTreeData(JSON.parse(result.syntaxTree));
        }
      } catch (e) {
        console.error("Parser initialization failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initParser();

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value ?? "";
    setCode(newCode);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const result = await parse(newCode);
      if (result.success && result.syntaxTree) {
        try {
          initialized.current = false;
          setSyntaxTreeData(JSON.parse(result.syntaxTree));
          setRenderKey((k) => k + 1);
        } catch (e) {
          console.error("Failed to parse tree JSON", e);
        }
      }
    }, 600);
  }, []);

  const renderTree = useCallback((): Promise<ResponseProps> => {
    return buildTreeResponse(syntaxTreeData);
  }, [syntaxTreeData]);



  const onCollapseTree = useCallback((nodeID: string, isGraphical: boolean) => {
    const graphResult = updateSyntaxTree(nodeID, isGraphical);
    elk.layout(graphResult.treeGraph).then((_layoutResult) => {
      // Just trigger a re-render without resetting the tree
      setRenderKey((k) => k + 1);
    });
  }, []);

  const onFindNode = useCallback((_node: object) => {
    // In a real implementation, this would highlight the node in the editor
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !splitPaneRef.current) return;

      const containerRect = splitPaneRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constraints: 20% to 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setSplitWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">Ballerina ST Visualizer</span>
        </div>
        <div className="header-badge">Syntax Tree Explorer</div>
      </header>

      <div className="split-pane" ref={splitPaneRef}>
        {/* Left Pane: Code Editor */}
        <div className="pane editor-pane" style={{ flex: `0 0 ${splitWidth}%` }}>
          <div className="pane-header">
            <span className="pane-icon">📝</span>
            <span>Source Code</span>
            <span className="pane-lang-badge">.bal</span>
          </div>
          <div className="editor-wrapper">
            <Editor
              value={code}
              onValueChange={handleCodeChange}
              highlight={code => hljs.highlight(code, { language: 'ballerina' }).value}
              padding={16}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 14,
                backgroundColor: "#1e1e1e",
                color: "#d4d4d4",
                minHeight: "100%",
              }}
              textareaClassName="editor-textarea"
            />
          </div>
        </div>

        <div className="pane-divider" onMouseDown={handleResizeStart} />

        {/* Right Pane: ST Diagram */}
        <div className="pane visualizer-pane" style={{ flex: `1 1 auto` }}>
          <div className="pane-header">
            <span className="pane-icon">🌳</span>
            <span>Syntax Tree</span>
            {loading ? (
              <span className="pane-lang-badge mock" style={{ backgroundColor: '#e6a23c', color: '#fff' }}>Initializing...</span>
            ) : (
              <span className="pane-lang-badge mock" style={{ backgroundColor: '#008781', color: '#fff', boxShadow: '0 0 8px rgba(0, 135, 129, 0.4)' }}>Live Parser</span>
            )}
          </div>
          <div className="visualizer-wrapper">
            <ErrorBoundary>
              {syntaxTreeData ? (
                <SyntaxTree
                  renderKey={renderKey}
                  onFindNode={onFindNode}
                  onCollapseTree={onCollapseTree}
                  renderTree={renderTree}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 16, color: "#aaa" }}>
                  <div style={{
                    width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #008781", borderRadius: "50%", animation: "spin 1s linear infinite"
                  }} />
                  <span>{loading ? "Loading Parser..." : "Waiting for syntax tree..."}</span>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
