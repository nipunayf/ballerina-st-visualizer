export interface TreeGraph {
    id: string;
    layoutOptions: {};
    children: GraphNode[];
    edges: TreeEdge[];
    width: number;
    height: number;
    isLocateMode: boolean;
}

export interface TreeNodeObject {
    nodeID: string;
    value: string;
    kind: string;
    parentID: string;
    didCollapse: boolean;
    ifParent: boolean;
    children: TreeNodeObject[];
    leadingMinutiae: Minutiae[];
    trailingMinutiae: Minutiae[];
    errorNode?: any;
    diagnostics: any[];
    position: Position;
    isNodePath?: any;
}

// Alias used by the ported tool files
export type TreeNode = TreeNodeObject;


export interface GraphNode {
    id: string;
    x: number;
    y: number;
    label: string;
    nodeColor: string;
    ifParent: boolean;
    isCollapsible: boolean;
    kind: string;
    leadingMinutiae: Minutiae[];
    trailingMinutiae: Minutiae[];
    hasDiagnostics: boolean;
    diagnostics: Diagnostics[];
    width: number;
    height: number;
    position: Position;
    isNodePath: boolean;
    parentID?: string;
}

export interface Minutiae {
    kind: string;
    minutiae: string;
    isInvalid: boolean;
}

export interface TreeEdge {
    id: string;
    sources: [];
    targets: [];
    sections: EdgeSections[];
    isNodePath: boolean;
}

export interface EdgeSections {
    id: string;
    startPoint: EdgeCoords;
    endPoint: EdgeCoords;
}

export interface EdgeCoords {
    x: number;
    y: number;
}

export interface Position {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
}

export interface Diagnostics {
    message: string;
    diagnosticInfo: any[];
}

export interface ResponseProps {
    treeGraph: TreeGraph;
    treeArray: TreeNodeObject[];
}

export interface PrimaryProps {
    onFindNode: (node: object) => void;
    onCollapseTree: (nodeID: string, representationType: boolean) => void;
    renderTree: () => Promise<ResponseProps>;
    renderKey?: number;
}

export interface GraphicalTreeProps {
    onFindNode: (node: object) => void;
    onCollapseTree: (nodeID: string, representationType: boolean) => void;
    treeGraph?: TreeGraph;
}

export interface GraphicalNodeProps {
    node: GraphNode;
    isLocateAction: boolean;
    onCollapseTree: any;
    onFindNode: any;
    parentX?: number;
    parentY?: number;
}

export interface GraphicalDetailsProps {
    node: GraphNode;
}

export interface TreeEdgeProps {
    edge: TreeEdge;
    isLocateAction: boolean;
}

export interface DropdownTreeProps {
    treeNode: TreeNodeObject;
    onCollapseTree: (nodeID: string, representationType: boolean) => void;
    onFindNode: (node: object) => void;
}

export interface DropdownNodeProps {
    treeNode: TreeNodeObject;
    treeLevel: number;
    detailedNode: string;
    onClick: (nodeProp: TreeNodeObject) => void;
    onCollapseTree: (nodeID: string, representationType: boolean) => void;
    onFindNode: (node: object) => void;
}

export interface DropdownDetailsProps {
    treeNode: TreeNodeObject;
}

export interface DetailsCardProp {
    title: string;
    value: any;
}

export interface DetailsArrayCardProp {
    title: string;
    type: string;
    value: any[];
}
