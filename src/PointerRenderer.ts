export type PointerDirection = "top" | "bottom" | "left" | "right" | "auto";

export interface PointerOptions {
    width: number;
    height: number;
    offset: number;
    direction: PointerDirection;
    curved: boolean;
}

export interface ContentArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class PointerRenderer {
    createSpeechBubblePath(
        ctx: CanvasRenderingContext2D,
        contentArea: ContentArea,
        radius: number,
        pointerOptions: PointerOptions,
    ): void {
        const {x: contentX, y: contentY, width: contentWidth, height: contentHeight} = contentArea;
        const {width: pointerWidth, height: pointerHeight, offset: pointerOffset, direction, curved} = pointerOptions;

        switch (direction) {
            case "bottom":
                this.createBottomPointer(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "top":
                this.createTopPointer(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "left":
                this.createLeftPointer(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "right":
                this.createRightPointer(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            default:
                this.createBottomPointer(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
        }
    }

    createSpeechBubblePathCCW(
        ctx: CanvasRenderingContext2D,
        contentArea: ContentArea,
        radius: number,
        pointerOptions: PointerOptions,
    ): void {
        const {x: contentX, y: contentY, width: contentWidth, height: contentHeight} = contentArea;
        const {width: pointerWidth, height: pointerHeight, offset: pointerOffset, direction, curved} = pointerOptions;

        switch (direction) {
            case "bottom":
                this.createBottomPointerCCW(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "top":
                this.createTopPointerCCW(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "left":
                this.createLeftPointerCCW(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            case "right":
                this.createRightPointerCCW(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
                break;
            default:
                this.createBottomPointerCCW(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, curved);
        }
    }

    private createBottomPointer(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.moveTo(contentX + radius, contentY);
        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);
        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);

        const centerXBottom = contentX + (contentWidth / 2) + pointerOffset;
        ctx.lineTo(Math.min(centerXBottom + (pointerWidth / 2), contentX + contentWidth - radius), contentY + contentHeight);
        if (curved) {
            ctx.quadraticCurveTo(centerXBottom, contentY + contentHeight + pointerHeight, Math.max(centerXBottom - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
        } else {
            ctx.lineTo(centerXBottom, contentY + contentHeight + pointerHeight);
            ctx.lineTo(Math.max(centerXBottom - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
        }

        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);
        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
    }

    private createTopPointer(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        const centerXTop = contentX + (contentWidth / 2) + pointerOffset;
        ctx.moveTo(Math.max(centerXTop - (pointerWidth / 2), contentX + radius), contentY);
        if (curved) {
            ctx.quadraticCurveTo(centerXTop, contentY - pointerHeight, Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
        } else {
            ctx.lineTo(centerXTop, contentY - pointerHeight);
            ctx.lineTo(Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
        }

        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);
        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);
        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);
        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
    }

    private createLeftPointer(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.moveTo(contentX + radius, contentY);
        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);
        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);
        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);

        const centerYLeft = contentY + (contentHeight / 2) + pointerOffset;
        ctx.lineTo(contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
        if (curved) {
            ctx.quadraticCurveTo(contentX - pointerHeight, centerYLeft, contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
        } else {
            ctx.lineTo(contentX - pointerHeight, centerYLeft);
            ctx.lineTo(contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
        }

        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
    }

    private createRightPointer(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.moveTo(contentX + radius, contentY);
        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);

        const centerYRight = contentY + (contentHeight / 2) + pointerOffset;
        ctx.lineTo(contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
        if (curved) {
            ctx.quadraticCurveTo(contentX + contentWidth + pointerHeight, centerYRight, contentX + contentWidth, Math.min(centerYRight + (pointerWidth / 2), contentY + contentHeight - radius));
        } else {
            ctx.lineTo(contentX + contentWidth + pointerHeight, centerYRight);
            ctx.lineTo(contentX + contentWidth, Math.min(centerYRight + (pointerWidth / 2), contentY + contentHeight - radius));
        }

        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);
        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);
        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
    }

    private createBottomPointerCCW(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);
        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);

        const centerXBottom = contentX + (contentWidth / 2) + pointerOffset;
        ctx.lineTo(Math.min(centerXBottom + (pointerWidth / 2), contentX + contentWidth - radius), contentY + contentHeight);
        if (curved) {
            ctx.quadraticCurveTo(centerXBottom, contentY + contentHeight + pointerHeight, Math.max(centerXBottom - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
        } else {
            ctx.lineTo(centerXBottom, contentY + contentHeight + pointerHeight);
            ctx.lineTo(Math.max(centerXBottom - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
        }

        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);
    }

    private createTopPointerCCW(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.lineTo(contentX, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX + radius, contentY + contentHeight);
        ctx.lineTo(contentX + contentWidth - radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth, contentY + contentHeight - radius);
        ctx.lineTo(contentX + contentWidth, contentY + radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth - radius, contentY);

        const centerXTop = contentX + (contentWidth / 2) + pointerOffset;
        ctx.lineTo(Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
        if (curved) {
            ctx.quadraticCurveTo(centerXTop, contentY - pointerHeight, Math.max(centerXTop - (pointerWidth / 2), contentX + radius), contentY);
        } else {
            ctx.lineTo(centerXTop, contentY - pointerHeight);
            ctx.lineTo(Math.max(centerXTop - (pointerWidth / 2), contentX + radius), contentY);
        }

        ctx.lineTo(contentX + radius, contentY);
        ctx.quadraticCurveTo(contentX, contentY, contentX, contentY + radius);
    }

    private createLeftPointerCCW(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.lineTo(contentX + contentWidth - radius, contentY);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius);
        ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight);
        ctx.lineTo(contentX + radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius);

        const centerYLeft = contentY + (contentHeight / 2) + pointerOffset;
        ctx.lineTo(contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
        if (curved) {
            ctx.quadraticCurveTo(contentX - pointerHeight, centerYLeft, contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
        } else {
            ctx.lineTo(contentX - pointerHeight, centerYLeft);
            ctx.lineTo(contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
        }

        ctx.lineTo(contentX, contentY + radius);
        ctx.quadraticCurveTo(contentX, contentY, contentX + radius, contentY);
    }

    private createRightPointerCCW(
        ctx: CanvasRenderingContext2D,
        contentX: number,
        contentY: number,
        contentWidth: number,
        contentHeight: number,
        radius: number,
        pointerWidth: number,
        pointerHeight: number,
        pointerOffset: number,
        curved: boolean,
    ): void {
        ctx.lineTo(contentX + radius, contentY);
        ctx.quadraticCurveTo(contentX, contentY, contentX, contentY + radius);
        ctx.lineTo(contentX, contentY + contentHeight - radius);
        ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX + radius, contentY + contentHeight);
        ctx.lineTo(contentX + contentWidth - radius, contentY + contentHeight);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth, contentY + contentHeight - radius);

        const centerYRight = contentY + (contentHeight / 2) + pointerOffset;
        ctx.lineTo(contentX + contentWidth, Math.min(centerYRight + (pointerWidth / 2), contentY + contentHeight - radius));
        if (curved) {
            ctx.quadraticCurveTo(contentX + contentWidth + pointerHeight, centerYRight, contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
        } else {
            ctx.lineTo(contentX + contentWidth + pointerHeight, centerYRight);
            ctx.lineTo(contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
        }

        ctx.lineTo(contentX + contentWidth, contentY + radius);
        ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth - radius, contentY);
    }
}
