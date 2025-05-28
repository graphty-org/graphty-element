import {StyleSchema, StyleSchemaType} from "./config";

export class Styles {
    readonly layers: StyleSchemaType = [];

    constructor(data: string | object) {
        this.layers = StyleSchema.parse(data);
    }

    static fromJson(json: string): Styles {
        const o = JSON.parse(json);
        return this.fromObject(o);
    }

    static fromObject(obj: object): Styles {
        return new Styles(obj);
    }

    addStyle() {}
}

export class Style {
    readonly nodeStyle: NodeStyle | null = null;
    readonly edgeStyle: EdgeStyle | null = null;

    constructor(nodeStyle: NodeStyle | null, edgeStyle: EdgeStyle | null) {
        if (!nodeStyle && !edgeStyle) {
            throw new Error("must specify one of nodeStyle or edgeStyle");
        }

        this.nodeStyle = nodeStyle;
        this.edgeStyle = edgeStyle;
    }
}

class NodeStyle {
    texture: string | null = null;
}

class EdgeStyle {
    lineStyle: string | null = null;
}
