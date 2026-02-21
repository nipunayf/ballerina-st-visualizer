import { createElement } from "react";
import { createRoot } from "react-dom/client";
import type { ResponseProps } from "./resources/tree-interfaces";
import SyntaxTree from "./syntaxTree";

export function renderSyntaxTree(activatedCommand: string,
                                 onFindNode: (node: object) => void,
                                 onCollapseTree: (position: string) => void,
                                 renderTree: () => Promise<ResponseProps>,
                                 switchFullTree: () => Promise<ResponseProps>,
                                 target: HTMLElement
                                ) {
    const responseDataProps = {
        activatedCommand,
        onCollapseTree,
        onFindNode,
        renderTree,
        switchFullTree
    };

    const SyntaxTreeElement = createElement(SyntaxTree, responseDataProps);
    const root = createRoot(target);
    root.render(SyntaxTreeElement);
}
