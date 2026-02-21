"use strict";
import { useState, useEffect } from "react";
import { LEADING_MINUTIAE, NODE_KIND, NONE, TRAILING_MINUTIAE } from "../../resources/constants";
import type { GraphicalDetailsProps, Minutiae } from "../../resources/tree-interfaces";
import * as styles from "../../styles/graphical-tree.styles";

function NodeDetails(props: GraphicalDetailsProps) {
    const { node } = props;

    const [isEdgeNode, setIsEdgeNode] = useState(false);
    const [isBottomNode, setIsBottomNode] = useState(false);

    useEffect(() => {
        if (node.x + 400 > window.innerWidth) {
            setIsEdgeNode(true);
        }

        if (node.y + 300 > window.innerHeight) {
            setIsBottomNode(true);
        }
    }, []);

    const mapMinutiae = (minutiaeArray: Minutiae[]) => {
        return minutiaeArray.map((item, id) => {
            if (!item.isInvalid) {
                return (
                    <p key={id}>
                        {item.kind}
                    </p>
                );
            } else {
                return;
            }
        });
    };

    return (
        <div>
            <div
                style={{
                    ...styles.popupArrowStyle,
                    borderBottom: isBottomNode ? "none" : "15px solid #1c2128",
                    borderTop: isBottomNode ? "15px solid #1c2128" : "none",
                    left: node.x + (node.width / 2),
                    top: isBottomNode ? (node.y - 15) : (node.y + 50),
                    transform: "translateX(-40%)"
                }}
            />
            <div
                style={{
                    ...styles.popupBodyStyle,
                    left: node.x + (node.width / 2),
                    top: isBottomNode ? (node.y - 15) : (node.y + node.height + 15),
                    transform: isBottomNode ? (isEdgeNode ? "translate(-80%, -100%)" : "translate(-10%, -100%)") :
                        (isEdgeNode ? "translateX(-80%)" : "translateX(-10%)")
                }}
            >
                <p> <b>{NODE_KIND} :</b>  {node.kind}</p><hr />

                {node.position && (
                    <div>
                        <p> <b>Position :</b>
                            {" (" + node.position.startLine + ", "
                                + node.position.startColumn + ") , ("
                                + node.position.endLine + ", "
                                + node.position.endColumn + ")"
                            }
                        </p> <hr />
                    </div>
                )}

                <p style={styles.titleFontStyle}>
                    {LEADING_MINUTIAE}
                </p>
                {(node.leadingMinutiae && node.leadingMinutiae.length > 0 &&
                    !(node.leadingMinutiae.length === 1 && node.leadingMinutiae[0].isInvalid)) && (
                        mapMinutiae(node.leadingMinutiae)
                    )}
                {(!node.leadingMinutiae || node.leadingMinutiae.length < 1 ||
                    (node.leadingMinutiae.length === 1 && node.leadingMinutiae[0].isInvalid)) &&
                    <p> {NONE} </p>
                } <hr />

                <p style={styles.titleFontStyle}>
                    {TRAILING_MINUTIAE}
                </p>
                {node.trailingMinutiae && node.trailingMinutiae.length > 0 && (
                    mapMinutiae(node.trailingMinutiae)
                )}
                {(!node.trailingMinutiae || node.trailingMinutiae.length < 1) && <p> {NONE} </p>}
            </div>
        </div>
    );
}

export default NodeDetails;
