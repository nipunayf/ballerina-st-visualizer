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
import { syntaxTreeObj, retrieveGraph, updateSyntaxTree, expandToNode } from "./visualizer/tools/syntax-tree-generator";
import { HELLO_WORLD_SOURCE } from "./services/mock-parser";
import { parse } from "./services/wasm-parser";
import "semantic-ui-css/semantic.min.css";
import "./App.css";

const elk = new ELK();

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Convert an AST node's 1-based position into pixel rectangles relative to
 *  the editor-wrapper element, by creating a DOM Range over the matching
 *  characters in the <pre> and reading its client rects. */
function computeHighlightRects(
  pre: HTMLPreElement,
  wrapper: HTMLElement,
  sourceCode: string,
  position: { startLine: number; startColumn: number; endLine: number; endColumn: number }
): HighlightRect[] {
  // Convert 1-based line/col to 0-based char offsets within sourceCode
  let startOffset = -1;
  let endOffset = -1;
  let line = 1;
  let col = 1;

  for (let i = 0; i <= sourceCode.length; i++) {
    if (startOffset < 0 && line === position.startLine && col === position.startColumn) {
      startOffset = i;
    }
    if (endOffset < 0 && line === position.endLine && col === position.endColumn) {
      endOffset = i;
      break;
    }
    if (i < sourceCode.length) {
      if (sourceCode[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }
  }

  if (startOffset < 0) startOffset = 0;
  if (endOffset < 0) endOffset = sourceCode.length;

  // Walk text nodes inside <pre> to find the DOM nodes/offsets for our range
  const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, null);
  let cumulative = 0;
  let startNode: Text | null = null;
  let startNodeOffset = 0;
  let endNode: Text | null = null;
  let endNodeOffset = 0;
  let node = walker.nextNode() as Text | null;

  while (node) {
    const len = node.nodeValue?.length ?? 0;
    if (!startNode && cumulative + len > startOffset) {
      startNode = node;
      startNodeOffset = startOffset - cumulative;
    }
    if (!endNode && cumulative + len >= endOffset) {
      endNode = node;
      endNodeOffset = endOffset - cumulative;
      break;
    }
    cumulative += len;
    node = walker.nextNode() as Text | null;
  }

  if (!startNode || !endNode) return [];

  try {
    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);

    const wrapperRect = wrapper.getBoundingClientRect();
    const clientRects = range.getClientRects();
    const rects: HighlightRect[] = [];

    for (let i = 0; i < clientRects.length; i++) {
      const r = clientRects[i];
      if (r.width > 0 && r.height > 0) {
        rects.push({
          top: r.top - wrapperRect.top + wrapper.scrollTop,
          left: r.left - wrapperRect.left + wrapper.scrollLeft,
          width: r.width,
          height: r.height,
        });
      }
    }

    range.detach();
    return rects;
  } catch {
    return [];
  }
}

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
  const [hoveredNodeInfo, setHoveredNodeInfo] = useState<{ node: any; x: number; y: number; rects: HighlightRect[] } | null>(null);
  const [splitWidth, setSplitWidth] = useState(50); // percentage for the first pane
  const isResizing = useRef(false);
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);
  const findNodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const onFindNode = useCallback((nodeOrPosition: object) => {
    // The graphical tree passes item.position (a Position object) directly,
    // while the dropdown tree passes treeNode.position. Normalize to a Position.
    const position = ('startLine' in nodeOrPosition)
      ? nodeOrPosition as { startLine: number; startColumn: number; endLine: number; endColumn: number }
      : (nodeOrPosition as any).position;

    if (!position || !position.startLine) return;

    const wrapper = document.querySelector('.editor-wrapper') as HTMLElement | null;
    const pre = wrapper?.querySelector('pre') as HTMLPreElement | null;
    if (!wrapper || !pre) return;

    const rects = computeHighlightRects(pre, wrapper, code, position);
    if (rects.length === 0) return;

    // Scroll the editor to make the highlighted region visible
    const firstRect = rects[0];
    const wrapperHeight = wrapper.clientHeight;
    const targetScrollTop = firstRect.top - wrapperHeight / 2 + wrapper.scrollTop;
    wrapper.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });

    // Clear any previous findNode timer to avoid stale timeout clearing our highlight
    if (findNodeTimerRef.current) {
      clearTimeout(findNodeTimerRef.current);
    }

    setHoveredNodeInfo({
      node: { position, kind: '', value: '' },
      x: -9999,
      y: -9999,
      rects,
    });

    findNodeTimerRef.current = setTimeout(() => {
      setHoveredNodeInfo((prev) => {
        // Only clear if it's still our highlight (not replaced by a hover)
        if (prev && prev.x === -9999) {
          return null;
        }
        return prev;
      });
      findNodeTimerRef.current = null;
    }, 2000);
  }, [code]);

  const navigateToNode = useCallback((node: any) => {
    if (node?.nodeID) {
      const graphResult = expandToNode(node.nodeID);
      elk.layout(graphResult.treeGraph).then((_layoutResult) => {
        setRenderKey((k) => k + 1);

        setTimeout(() => {
          const el = document.getElementById(`node-${node.nodeID}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            el.classList.add('node-flash');
            setTimeout(() => {
              el.classList.remove('node-flash');
            }, 1500);
          }
        }, 300);
      });
      
      setHoveredNodeInfo(null);
    }
  }, []);

  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && hoveredNodeInfo?.node) {
      e.preventDefault();
      navigateToNode(hoveredNodeInfo.node);
    }
  }, [hoveredNodeInfo, navigateToNode]);

  const handleEditorMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!syntaxTreeData || isResizing.current) {
      if (hoveredNodeInfo) setHoveredNodeInfo(null);
      return;
    }

    const wrapper = e.currentTarget;
    const textarea = wrapper.querySelector('textarea');
    const pre = wrapper.querySelector('pre');

    if (!textarea || !pre) return;

    // Temporarily disable pointer events on textarea to click 'through' it
    const prevPointerEvents = textarea.style.pointerEvents;
    textarea.style.pointerEvents = 'none';

    // The <pre> has pointer-events: none by default in react-simple-code-editor.
    // We must temporarily set it to 'auto' so caretRangeFromPoint can 'see' the text nodes inside it,
    // which fixes issues in Safari and some other browsers.
    const prevPrePointerEvents = pre.style.pointerEvents;
    pre.style.pointerEvents = 'auto';

    // Force a synchronous reflow so the browser applies the pointer-events
    // changes before we call caretPositionFromPoint/caretRangeFromPoint.
    // Without this, the browser may still hit-test against the old layout.
    void pre.offsetHeight;

    let caretNode: Node | null = null;
    let caretOffset = 0;

    const doc = document as any;
    if (doc.caretPositionFromPoint) {
      const pos = doc.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        caretNode = pos.offsetNode;
        caretOffset = pos.offset;
      }
    } else if (doc.caretRangeFromPoint) {
      const range = doc.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        caretNode = range.startContainer;
        caretOffset = range.startOffset;
      }
    }

    // Restore pointer events
    textarea.style.pointerEvents = prevPointerEvents;
    pre.style.pointerEvents = prevPrePointerEvents;

    if (!caretNode || caretNode.nodeType !== Node.TEXT_NODE || !pre.contains(caretNode)) {
      if (hoveredNodeInfo) setHoveredNodeInfo(null);
      return;
    }

    // Now calculate absolute offset
    let charOffset = 0;
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, null);
    let currentNode = walker.nextNode();
    let found = false;
    while (currentNode) {
      if (currentNode === caretNode) {
        charOffset += caretOffset;
        found = true;
        break;
      }
      charOffset += currentNode.nodeValue ? currentNode.nodeValue.length : 0;
      currentNode = walker.nextNode();
    }

    if (!found) {
      if (hoveredNodeInfo) setHoveredNodeInfo(null);
      return;
    }

    // Because react-simple-code-editor might append an extra newline or we might hover past the end
    if (charOffset >= code.length) {
      charOffset = Math.max(0, code.length - 1);
    }

    // Compute 1-based line and column to match the WASM parser's position format
    let line = 1;
    let col = 1;
    for (let i = 0; i < charOffset; i++) {
      if (code[i] === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
    }

    // find in syntaxTreeObj (mapped tree with position data)
    function findInnerMostNode(nodes: any, targetLine: number, targetCol: number): any {
      let bestNode = null;
      let minRange = Infinity;

      function traverse(n: any) {
        if (!n || !n.position) return;
        const pos = n.position;
        let isInside = false;
        if (pos.startLine === pos.endLine) {
          isInside = targetLine === pos.startLine && targetCol >= pos.startColumn && targetCol <= pos.endColumn;
        } else {
          if (targetLine > pos.startLine && targetLine < pos.endLine) {
            isInside = true;
          } else if (targetLine === pos.startLine) {
            isInside = targetCol >= pos.startColumn;
          } else if (targetLine === pos.endLine) {
            isInside = targetCol <= pos.endColumn;
          }
        }

        if (isInside) {
          const range = (pos.endLine - pos.startLine) * 10000 + (pos.endColumn - pos.startColumn);

          // Only highlight leaf nodes (nodes with no children)
          const isLeaf = !n.children || n.children.length === 0;

          if (range <= minRange && isLeaf) {
            minRange = range;
            bestNode = n;
          }
          if (n.children && Array.isArray(n.children)) {
            for (const child of n.children) {
              traverse(child);
            }
          }
        }
      }

      if (Array.isArray(nodes)) {
        for (const root of nodes) traverse(root);
      } else {
        traverse(nodes);
      }
      return bestNode;
    }

    const matchedNode = findInnerMostNode(syntaxTreeObj, line, col);

    if (matchedNode !== hoveredNodeInfo?.node) {
      if (matchedNode) {
        const rects = computeHighlightRects(pre as HTMLPreElement, wrapper as HTMLElement, code, matchedNode.position);
        setHoveredNodeInfo({ node: matchedNode, x: e.clientX, y: e.clientY, rects });
      } else {
        setHoveredNodeInfo(null);
      }
    } else if (matchedNode && hoveredNodeInfo) {
      // update position slightly if moving
      if (Math.abs(e.clientX - hoveredNodeInfo.x) > 10 || Math.abs(e.clientY - hoveredNodeInfo.y) > 10) {
        setHoveredNodeInfo({ ...hoveredNodeInfo, x: e.clientX, y: e.clientY });
      }
    }

  }, [code, syntaxTreeData, hoveredNodeInfo]);

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
          <div 
            className="editor-wrapper" 
            onMouseMove={handleEditorMouseMove} 
            onMouseLeave={() => setHoveredNodeInfo(null)}
            onClick={handleEditorClick}
          >
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
            {hoveredNodeInfo && hoveredNodeInfo.rects.map((rect, i) => (
              <div
                key={i}
                className="highlight-overlay"
                style={{
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                }}
              />
            ))}
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

      {hoveredNodeInfo && hoveredNodeInfo.x >= 0 && (() => {
        const isParent = hoveredNodeInfo.node.ifParent;
        const chipColor = isParent ? "#20b6b0" : "#7f7f7f";

        // Viewport clamping: estimate chip size and clamp position
        const chipEstWidth = 250; // conservative max width estimate
        const chipEstHeight = 32;
        const margin = 8;
        const rawTop = hoveredNodeInfo.y + 15;
        const rawLeft = hoveredNodeInfo.x + 10;
        const clampedTop = Math.min(rawTop, window.innerHeight - chipEstHeight - margin);
        const clampedLeft = Math.min(rawLeft, window.innerWidth - chipEstWidth - margin);

        return (
          <div
            className="hover-chip"
            onClick={() => navigateToNode(hoveredNodeInfo.node)}
            style={{
              top: Math.max(margin, clampedTop),
              left: Math.max(margin, clampedLeft),
              backgroundColor: chipColor,
              boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px ${chipColor}`,
            }}
          >
            <span className="hover-chip-icon">
              {isParent ? "▸" : "●"}
            </span>
            <span>{hoveredNodeInfo.node.kind}</span>
            {hoveredNodeInfo.node.value && hoveredNodeInfo.node.value !== hoveredNodeInfo.node.kind && (
              <span style={{ opacity: 0.75, fontWeight: 400 }}>
                {hoveredNodeInfo.node.value}
              </span>
            )}
            <span className="hover-chip-icon hover-chip-locate">
              ⌖
            </span>
          </div>
        );
      })()}
    </div>
  );
}

export default App;
