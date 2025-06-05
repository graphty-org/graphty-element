export const MyNodeStyle = {
    size: 3.14,
    opacity: 0.5,
    wireframe: true,
    color: "#c0ffee",
    label: true,
    shape: "goldberg",
};

export const MyEdgeStyle = {
    type: "plain",
    arrowCap: true,
    color: "#c0ffee",
    width: 1,
    movingLineOpts: {
        baseColor: "#0badc0de",
    },
};

export const DefaultAppliedNodeStyle = {
    selector: "",
    style: MyNodeStyle,
};

export const DefaultAppliedEdgeStyle = {
    selector: "",
    style: MyEdgeStyle,
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
            style: MyNodeStyle,
        },
    },
];
