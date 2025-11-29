export type CSVVariant =
    | "neo4j"
    | "gephi"
    | "cytoscape"
    | "adjacency-list"
    | "edge-list"
    | "node-list"
    | "generic";

export interface CSVVariantInfo {
    variant: CSVVariant;
    hasHeaders: boolean;
    delimiter: string;
    sourceColumn?: string;
    targetColumn?: string;
    idColumn?: string;
    labelColumn?: string;
    typeColumn?: string;
    interactionColumn?: string;
}

/**
 * Detect CSV variant from headers and sample data
 */
export function detectCSVVariant(
    headers: string[],
): CSVVariantInfo {
    // Check Neo4j format: :ID, :LABEL, :TYPE, :START_ID, :END_ID
    if (headers.some((h) => /:(ID|LABEL|TYPE|START_ID|END_ID)/.test(h))) {
        return {
            variant: "neo4j",
            hasHeaders: true,
            delimiter: ",",
            sourceColumn: ":START_ID",
            targetColumn: ":END_ID",
            idColumn: headers.find((h) => h.endsWith(":ID")),
            labelColumn: ":LABEL",
            typeColumn: ":TYPE",
        };
    }

    // Check Gephi format: Source, Target, Type (case-sensitive)
    if (headers.includes("Source") && headers.includes("Target")) {
        return {
            variant: "gephi",
            hasHeaders: true,
            delimiter: ",",
            sourceColumn: "Source",
            targetColumn: "Target",
            typeColumn: "Type",
            labelColumn: "Label",
        };
    }

    // Check Cytoscape format: interaction column
    if (headers.includes("interaction")) {
        return {
            variant: "cytoscape",
            hasHeaders: true,
            delimiter: ",",
            sourceColumn: "source",
            targetColumn: "target",
            interactionColumn: "interaction",
        };
    }

    // Check adjacency list: first column is node, rest are neighbors
    // No standard headers, detect by structure
    if (
        !headers.includes("source") &&
        !headers.includes("target") &&
        !headers.includes("Source") &&
        !headers.includes("Target")
    ) {
        return {
            variant: "adjacency-list",
            hasHeaders: false,
            delimiter: headers.length > 10 ? " " : ",",
        };
    }

    // Standard edge list
    if (headers.includes("source") || headers.includes("src")) {
        return {
            variant: "edge-list",
            hasHeaders: true,
            delimiter: ",",
            sourceColumn: headers.includes("source") ? "source" : "src",
            targetColumn: headers.includes("target") ? "target" : "dst",
        };
    }

    // Node list
    if (headers.includes("id") || headers.includes("Id")) {
        return {
            variant: "node-list",
            hasHeaders: true,
            delimiter: ",",
            idColumn: headers.includes("id") ? "id" : "Id",
        };
    }

    return {
        variant: "generic",
        hasHeaders: true,
        delimiter: ",",
    };
}
