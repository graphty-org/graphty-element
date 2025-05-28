export const BasicNodeStyle = [
    {
        node: {
            selector: "x",
            style: {
                size: 3.14,
                opacity: 0.5,
                wireframe: true,
                color: "#c0ffee",
                label: true,
                shape: "goldberg",
            },
        },
    },
];

export const BasicEdgeStyle = [
    {
        edge: {
            selector: "x",
            style: {},
        },
    },
];

export const BasicDualStyle = [
    {
        node: BasicNodeStyle[0].node,
        edge: BasicEdgeStyle[0].edge,
    },
];
