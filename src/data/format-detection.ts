export type FormatType =
    | "json"
    | "graphml"
    | "gexf"
    | "csv"
    | "gml"
    | "dot"
    | "pajek";

export interface FormatInfo {
    name: string;
    extensions: string[];
    mimeTypes: string[];
}

const FORMAT_INFO: Record<FormatType, FormatInfo> = {
    json: {
        name: "JSON",
        extensions: [".json"],
        mimeTypes: ["application/json"],
    },
    graphml: {
        name: "GraphML",
        extensions: [".graphml", ".xml"],
        mimeTypes: ["application/graphml+xml", "application/xml", "text/xml"],
    },
    gexf: {
        name: "GEXF",
        extensions: [".gexf"],
        mimeTypes: ["application/gexf+xml", "application/xml", "text/xml"],
    },
    csv: {
        name: "CSV",
        extensions: [".csv", ".edges", ".edgelist"],
        mimeTypes: ["text/csv", "text/plain"],
    },
    gml: {
        name: "GML",
        extensions: [".gml"],
        mimeTypes: ["text/plain"],
    },
    dot: {
        name: "DOT",
        extensions: [".dot", ".gv"],
        mimeTypes: ["text/vnd.graphviz", "text/plain"],
    },
    pajek: {
        name: "Pajek NET",
        extensions: [".net", ".paj"],
        mimeTypes: ["text/plain"],
    },
};

/**
 * Detect graph data format from filename and/or content
 * @param filename - File name (can be empty)
 * @param content - File content sample (can be empty)
 * @returns Detected format or null if unknown
 */
export function detectFormat(filename: string, content: string): FormatType | null {
    // 1. Try extension first (fast path)
    if (filename) {
        const extMatch = /\.[^.]+$/.exec(filename.toLowerCase());
        const ext = extMatch?.[0];
        if (ext) {
            // Check each format's extensions
            for (const [format, info] of Object.entries(FORMAT_INFO)) {
                if (info.extensions.includes(ext)) {
                    // Special case: .xml could be GraphML or GEXF, need content check
                    if (ext === ".xml" && content) {
                        const xmlFormat = detectXMLFormat(content);
                        if (xmlFormat) {
                            return xmlFormat;
                        }
                    }

                    return format as FormatType;
                }
            }
        }
    }

    // 2. Inspect content
    if (!content) {
        return null;
    }

    const trimmed = content.trim();

    // XML-based formats
    if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
        return detectXMLFormat(trimmed);
    }

    // JSON
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return "json";
    }

    // Text-based formats
    if (/graph\s*\[/i.test(trimmed)) {
        return "gml";
    }

    if (/^\*vertices/i.test(trimmed)) {
        return "pajek";
    }

    if (/^\s*(strict\s+)?(di)?graph\s+/i.test(trimmed)) {
        return "dot";
    }

    // CSV (very generic, check last)
    if (/^[\w-]+\s*,\s*[\w-]+/m.test(trimmed)) {
        return "csv";
    }

    return null;
}

function detectXMLFormat(content: string): FormatType | null {
    if (content.includes("xmlns=\"http://graphml.graphdrawing.org")) {
        return "graphml";
    }

    if (content.includes("xmlns=\"http://gexf.net")) {
        return "gexf";
    }

    return null;
}

export function getFormatInfo(format: FormatType): FormatInfo {
    return FORMAT_INFO[format];
}
