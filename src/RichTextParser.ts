import type {RichTextStyle, TextSegment} from "./RichTextLabel.ts";

export class RichTextParser {
    private readonly defaultStyle: RichTextStyle;

    constructor(defaultStyle: RichTextStyle) {
        this.defaultStyle = defaultStyle;
    }

    parse(text: string): TextSegment[][] {
        const lines = text.split("\n");
        const parsedContent: TextSegment[][] = [];

        for (const line of lines) {
            const segments = this.parseLine(line);
            parsedContent.push(segments);
        }

        return parsedContent;
    }

    private parseLine(line: string): TextSegment[] {
        const segments: TextSegment[] = [];
        let currentPos = 0;

        const styleStack: RichTextStyle[] = [
            Object.assign({}, this.defaultStyle),
        ];

        const tagRegex = /<(\/?)(bold|italic|color|size|font|bg)(?:='([^']*)')?>/g;
        let match;

        while ((match = tagRegex.exec(line)) !== null) {
            if (match.index > currentPos) {
                segments.push({
                    text: line.substring(currentPos, match.index),
                    style: Object.assign({}, styleStack[styleStack.length - 1]),
                });
            }

            const isClosing = match[1] === "/";
            const tagName = match[2];
            const tagValue = match[3];

            if (isClosing) {
                if (styleStack.length > 1) {
                    styleStack.pop();
                }
            } else {
                const newStyle = Object.assign({}, styleStack[styleStack.length - 1]);

                switch (tagName) {
                    case "bold":
                        newStyle.weight = "bold";
                        break;
                    case "italic":
                        newStyle.style = "italic";
                        break;
                    case "color":
                        newStyle.color = tagValue || this.defaultStyle.color;
                        break;
                    case "size":
                        newStyle.size = parseInt(tagValue || "0") || this.defaultStyle.size;
                        break;
                    case "font":
                        newStyle.font = tagValue || this.defaultStyle.font;
                        break;
                    case "bg":
                        newStyle.background = tagValue || null;
                        break;
                    default:
                        break;
                }

                styleStack.push(newStyle);
            }

            currentPos = match.index + match[0].length;
        }

        if (currentPos < line.length) {
            segments.push({
                text: line.substring(currentPos),
                style: Object.assign({}, styleStack[styleStack.length - 1]),
            });
        }

        return segments;
    }

    measureText(
        parsedContent: TextSegment[][],
        ctx: CanvasRenderingContext2D,
        options: {
            lineHeight: number;
            textOutline: boolean;
            textOutlineWidth: number;
        },
    ): {maxWidth: number, totalHeight: number} {
        let maxWidth = 0;
        let totalHeight = 0;

        for (const lineSegments of parsedContent) {
            let lineWidth = 0;
            let maxLineHeight = 0;

            for (const segment of lineSegments) {
                const {style} = segment;

                ctx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
                const metrics = ctx.measureText(segment.text);

                lineWidth += metrics.width;
                maxLineHeight = Math.max(maxLineHeight, style.size);
            }

            if (options.textOutline) {
                lineWidth += options.textOutlineWidth * 2;
                maxLineHeight += options.textOutlineWidth * 2;
            }

            maxWidth = Math.max(maxWidth, lineWidth);
            totalHeight += maxLineHeight * options.lineHeight;
        }

        return {maxWidth, totalHeight};
    }
}
