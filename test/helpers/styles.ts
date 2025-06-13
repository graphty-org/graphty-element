export const MyNodeStyle = {
    appearance: {
        color: "#c0ffee",
        size: 3.14,
        opacity: 0.5,
        type: "goldberg",
        wireframe: true,
    },
};

export const MyEdgeStyle = {
    arrowHead: {
        type: "normal",
    },
    line: {
        color: "#c0ffee",
        width: 1,
        animationSpeed: 0,
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
