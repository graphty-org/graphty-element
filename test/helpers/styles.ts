export const MyNodeStyle = {
    texture: {
        color: {
            colorType: "solid",
            value: "#c0ffee",
            opacity: 0.5,
        },
    },
    shape: {
        size: 3.14,
        type: "goldberg",
    },
    effect: {
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

export const TwoLayersOfNodeColors = [
    // layer 1: color red
    {
        node: {
            selector: "",
            style: {texture: {color: "#FF000000"}},
        },
    },
    // layer 2: color blue
    {
        node: {
            selector: "",
            style: {texture: {color: "#0000FF00"}},
        },
    },
];
