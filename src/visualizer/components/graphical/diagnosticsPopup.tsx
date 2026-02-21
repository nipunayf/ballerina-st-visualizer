"use strict";
import { useState, useEffect } from "react";
import type { GraphicalDetailsProps } from "../../resources/tree-interfaces";
import * as styles from "../../styles/graphical-tree.styles";

function Diagnostics(props: GraphicalDetailsProps) {
    const { node } = props;

    const [isEdgeNode, setIsEdgeNode] = useState(false);
    const [isBottomNode, setIsBottomNode] = useState(false);

    useEffect(() => {
        if (node.x + 350 > window.innerWidth) {
            setIsEdgeNode(true);
        }

        if (node.y + 250 > window.innerHeight) {
            setIsBottomNode(true);
        }
    }, []);

    return (
        <div>
            <div
                style={{
                    ...styles.popupArrowStyle,
                    borderBottom: isBottomNode ? "none" : "15px solid #2d1b1b",
                    borderTop: isBottomNode ? "15px solid #2d1b1b" : "none",
                    left: node.x + node.width - 25,
                    top: isBottomNode ? node.y - 10 : node.y + 45
                }}
            />

            <div
                style={{
                    ...styles.diagnosticsBodyStyle,
                    left: node.x + node.width - 40,
                    top: isBottomNode ? node.y - 10 : node.y + node.height + 10,
                    transform: isBottomNode ? (isEdgeNode ? "translate(-80%, -100%)" : "translate(-10%, -100%)")
                        : (isEdgeNode ? "translateX(-80%)" : "translateX(-10%)")
                }}
            >
                <p> <b>This block contains :</b></p> <hr />

                {node.diagnostics.map((item, id) => (
                    <p key={id}>
                        {item.message}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default Diagnostics;
