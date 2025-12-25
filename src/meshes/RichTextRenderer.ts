import type {TextSegment} from "./RichTextLabel.ts";

export interface RenderOptions {
    textAlignment: "left" | "center" | "right";
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    backgroundPadding: number;
    lineHeight: number;
    textShadow: boolean;
    textShadowColor: string;
    textShadowBlur: number;
    textShadowOffsetX: number;
    textShadowOffsetY: number;
    textOutline: boolean;
    textOutlineColor: string;
    textOutlineWidth: number;
    textOutlineJoin: CanvasLineJoin;
}

/**
 * Renders styled text segments to a canvas
 */
export class RichTextRenderer {
    /**
     * Creates a new rich text renderer
     * @param options - Rendering configuration options
     */
    constructor(private readonly options: RenderOptions) {}

    /**
     * Draws styled text segments to a canvas
     * @param ctx - Canvas rendering context
     * @param parsedContent - Parsed text segments to render
     * @param contentArea - Content area dimensions
     * @param contentArea.x - X position of content area
     * @param contentArea.y - Y position of content area
     * @param contentArea.width - Width of content area
     * @param contentArea.height - Height of content area
     */
    drawText(
        ctx: CanvasRenderingContext2D,
        parsedContent: TextSegment[][],
        contentArea: {x: number, y: number, width: number, height: number},
    ): void {
        const textAreaWidth = contentArea.width - this.options.marginLeft - this.options.marginRight;
        const textAreaX = contentArea.x + this.options.marginLeft;
        let currentY = contentArea.y + this.options.marginTop;

        for (const lineSegments of parsedContent) {
            if (lineSegments.length === 0) {
                continue;
            }

            const {totalWidth, maxLineHeight} = this.measureLine(ctx, lineSegments);
            const startX = this.calculateLineStartX(textAreaX, textAreaWidth, totalWidth);

            this.drawLine(ctx, lineSegments, startX, currentY, maxLineHeight);
            currentY += maxLineHeight * this.options.lineHeight;
        }
    }

    private measureLine(
        ctx: CanvasRenderingContext2D,
        lineSegments: TextSegment[],
    ): {totalWidth: number, maxLineHeight: number} {
        let totalWidth = 0;
        let maxLineHeight = 0;

        for (const segment of lineSegments) {
            const {style} = segment;
            ctx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
            const metrics = ctx.measureText(segment.text);
            totalWidth += metrics.width;
            maxLineHeight = Math.max(maxLineHeight, style.size);
        }

        return {totalWidth, maxLineHeight};
    }

    private calculateLineStartX(textAreaX: number, textAreaWidth: number, totalWidth: number): number {
        const contentCenter = textAreaX + (textAreaWidth / 2);

        switch (this.options.textAlignment) {
            case "left":
                return textAreaX;
            case "right":
                return textAreaX + textAreaWidth - totalWidth;
            case "center":
            default:
                return contentCenter - (totalWidth / 2);
        }
    }

    private drawLine(
        ctx: CanvasRenderingContext2D,
        lineSegments: TextSegment[],
        startX: number,
        currentY: number,
        lineHeight: number,
    ): void {
        let currentX = startX;

        for (const segment of lineSegments) {
            const {style} = segment;

            ctx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
            ctx.textBaseline = "top";

            if (style.background) {
                const metrics = ctx.measureText(segment.text);
                ctx.fillStyle = style.background;
                ctx.fillRect(currentX, currentY, metrics.width, lineHeight);
            }

            if (this.options.textShadow) {
                this.drawTextWithShadow(ctx, segment.text, currentX, currentY, style.color);
            }

            if (this.options.textOutline) {
                this.drawTextOutline(ctx, segment.text, currentX, currentY);
            }

            ctx.fillStyle = style.color;
            ctx.fillText(segment.text, currentX, currentY);

            currentX += ctx.measureText(segment.text).width;
        }
    }

    private drawTextWithShadow(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        color: string,
    ): void {
        ctx.save();
        ctx.shadowColor = this.options.textShadowColor;
        ctx.shadowBlur = this.options.textShadowBlur;
        ctx.shadowOffsetX = this.options.textShadowOffsetX;
        ctx.shadowOffsetY = this.options.textShadowOffsetY;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    private drawTextOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
        ctx.save();
        ctx.strokeStyle = this.options.textOutlineColor;
        ctx.lineWidth = this.options.textOutlineWidth * 2;
        ctx.lineJoin = this.options.textOutlineJoin;
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);
        ctx.restore();
    }
}
