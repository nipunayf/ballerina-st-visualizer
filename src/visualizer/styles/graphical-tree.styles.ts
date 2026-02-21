import type { CSSProperties } from "react";

export const treeEdgeStyles: CSSProperties = {
    stroke: "#6e7681", // Lighter grey for better visibility
    strokeWidth: "1px"
};

export const nodeContainerStyle: CSSProperties = {
    borderRadius: 10,
    cursor: "default",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    lineHeight: "50px",
    paddingLeft: 3,
    paddingRight: 3,
    position: "absolute",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
};

export const labelContainerStyle: CSSProperties = {
    color: "white",
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 500
};

export const iconStyle: CSSProperties = {
    height: "100%",
    paddingLeft: 2,
    paddingRight: 2,
    display: "flex",
    alignItems: "center"
};

export const popupArrowStyle: CSSProperties = {
    borderLeft: "7.5px solid transparent",
    borderRight: "7.5px solid transparent",
    height: 0,
    position: "absolute",
    transform: "translateX(-40%)",
    width: 0,
    borderBottom: "7.5px solid #1c2128" // Match popup background
};

export const popupBodyStyle: CSSProperties = {
    backgroundColor: "#1c2128", // Dark theme background
    borderRadius: 8,
    minHeight: 190,
    minWidth: 175,
    padding: "16px",
    position: "absolute",
    textAlign: "left",
    zIndex: 10,
    color: "#e6edf3", // Text color
    border: "1px solid #30363d",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
};

export const diagnosticsBodyStyle: CSSProperties = {
    backgroundColor: "#2d1b1b", // Dark red background for diagnostics
    borderRadius: 8,
    minWidth: 160,
    padding: "16px",
    position: "absolute",
    textAlign: "left",
    zIndex: 10,
    color: "#ff8c8c", // Light red text
    border: "1px solid #6b1d1d",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
};

export const titleFontStyle: CSSProperties = {
    fontWeight: "bold"
};
