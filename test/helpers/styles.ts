export const DefaultNodeStyle = {
    size: 3.14,
    opacity: 0.5,
    wireframe: true,
    color: "#c0ffee",
    label: true,
    shape: "goldberg",
};

export const DefaultAppliedNodeStyle = {
    selector: "",
    style: DefaultNodeStyle,
};

export const DefaultEdgeStyle = {};

export const DefaultAppliedEdgeStyle = {
    selector: "",
    style: DefaultEdgeStyle,
};

export const BasicNodeStyle = [
    {
        node: DefaultAppliedNodeStyle,
    },
];

export const BasicEdgeStyle = [
    {
        edge: DefaultAppliedEdgeStyle,
    },
];

export const BasicDualStyle = [
    {
        node: DefaultAppliedNodeStyle,
        edge: DefaultAppliedEdgeStyle,
    },
];

export const BasicNodeSelector = [
    {
        node: {
            selector: "starts_with(id, 'Mlle') == `true`",
            style: DefaultNodeStyle,
        },
    },
];
