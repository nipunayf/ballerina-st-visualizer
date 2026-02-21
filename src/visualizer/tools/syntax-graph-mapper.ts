import { toInteger } from "lodash";
import {
    ERROR_NODE_COLOR,
    PARENT_NODE_COLOR,
    PATH_NODE_COLOR,
    TOKEN_COLOR
} from "../resources/constants";
import type { TreeNode } from "../resources/tree-interfaces";

export function mapSyntaxGraph(
    targetArray: TreeNode[],
    nodeID: string,
    isGraphical: boolean,
    nodeMembers: any[],
    nodeEdges: any[],
    checkNodePath: boolean
) {
    for (let i = 0; i < targetArray.length; i++) {
        if (targetArray[i].nodeID === nodeID) {
            const status = targetArray[i].didCollapse;
            targetArray[i] = {
                ...targetArray[i],
                didCollapse: !status
            };
        }

        if (isGraphical) {
            const position = toInteger(targetArray[i].nodeID.replace(/\D/g, ""));
            const ifParent: boolean = targetArray[i].nodeID.charAt(0) === "p";
            let isNodePath: boolean = false;
            let diagnostics: any[] = [];

            if (!targetArray[i].didCollapse && ifParent) {
                diagnostics = targetArray[i].diagnostics;
            }
            if (checkNodePath && targetArray[i].isNodePath) {
                isNodePath = true;
            }

            nodeMembers.push({
                id: targetArray[i].nodeID,
                height: 50,
                width: diagnostics.length ? Math.max((targetArray[i].value.length * 7) + 80, 145) :
                    Math.max((targetArray[i].value.length * 9) + 30, 115),
                label: targetArray[i].value,
                kind: targetArray[i].kind,
                leadingMinutiae: targetArray[i].leadingMinutiae,
                trailingMinutiae: targetArray[i].trailingMinutiae,
                hasDiagnostics: diagnostics.length > 0 ? true : false,
                diagnostics: targetArray[i].diagnostics,
                layoutOptions: {
                    "elk.position": "(" + position + ", 0)"
                },
                ifParent,
                isCollapsible: targetArray[i].didCollapse ? false : (ifParent ? true : false),
                isNodePath,
                nodeColor: targetArray[i].errorNode ? ERROR_NODE_COLOR :
                    (ifParent ? (checkNodePath ? PATH_NODE_COLOR : PARENT_NODE_COLOR) : TOKEN_COLOR),
                position: targetArray[i].position,
                parentID: targetArray[i].parentID
            });

            if (nodeMembers.length > 1 && targetArray[i].parentID) {
                nodeEdges.push({
                    id: `e${targetArray[i].nodeID}`,
                    sources: [targetArray[i].parentID],
                    targets: [targetArray[i].nodeID],
                    isNodePath
                });
            }
        }

        if (targetArray[i].didCollapse) {
            mapSyntaxGraph(targetArray[i].children, nodeID, isGraphical, nodeMembers, nodeEdges, checkNodePath);
        }
    }
}
