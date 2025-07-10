import {AbstractMesh, Color3, DynamicTexture, Engine, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3} from "@babylonjs/core";

import {BadgeStyleManager} from "./BadgeStyleManager.ts";
import {type ContentArea as PointerContentArea, type PointerDirection, PointerRenderer} from "./PointerRenderer.ts";
import {RichTextAnimator} from "./RichTextAnimator.ts";
import {RichTextParser} from "./RichTextParser.ts";
import {RichTextRenderer} from "./RichTextRenderer.ts";

export type BadgeType = "notification" | "label" | "label-success" | "label-warning" | "label-danger" | "count" | "icon" | "progress" | "dot" | undefined;
export type AttachPosition = "top" | "bottom" | "left" | "right" | "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface RichTextStyle {
    font: string;
    size: number;
    weight: string;
    style: string;
    color: string;
    background: string | null;
}

export interface TextSegment {
    text: string;
    style: RichTextStyle;
}

interface PointerInfo {
    direction: string;
    width: number;
    height: number;
    offset: number;
    curve: boolean;
}

interface Border {
    width: number;
    color: string;
    spacing: number;
}

interface ActualDimensions {
    width: number;
    height: number;
}

interface ContentArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface RichTextLabelOptions {
    text?: string;
    position?: {x: number, y: number, z: number};
    resolution?: number;
    autoSize?: boolean;
    font?: string;
    fontSize?: number;
    fontWeight?: string;
    textColor?: string;
    textAlign?: "left" | "center" | "right";
    lineHeight?: number;
    backgroundColor?: string;
    backgroundGradient?: boolean;
    backgroundGradientColors?: string[];
    backgroundGradientType?: "linear" | "radial";
    backgroundGradientDirection?: "vertical" | "horizontal" | "diagonal";
    backgroundPadding?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    borderWidth?: number;
    borderColor?: string;
    borders?: Border[];
    cornerRadius?: number;
    animation?: "none" | "pulse" | "bounce" | "shake" | "glow" | "fill";
    animationSpeed?: number;
    billboardMode?: number;
    textShadow?: boolean;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffsetX?: number;
    textShadowOffsetY?: number;
    textOutline?: boolean;
    textOutlineColor?: string;
    textOutlineWidth?: number;
    textOutlineJoin?: CanvasLineJoin;
    pointer?: boolean;
    pointerDirection?: "top" | "bottom" | "left" | "right" | "auto";
    pointerWidth?: number;
    pointerHeight?: number;
    pointerOffset?: number;
    pointerCurve?: boolean;
    attachTo?: AbstractMesh | Vector3;
    attachPosition?: AttachPosition;
    attachOffset?: number;
    depthFadeEnabled?: boolean;
    depthFadeNear?: number;
    depthFadeFar?: number;
    badge?: BadgeType;
    icon?: string;
    iconPosition?: "left" | "right";
    progress?: number;
    smartOverflow?: boolean;
    maxNumber?: number;
    overflowSuffix?: string;
    _badgeType?: BadgeType;
    _smartSizing?: boolean;
    _paddingRatio?: number;
    _removeText?: boolean;
    _progressBar?: boolean;
}

type ResolvedRichTextLabelOptions = Omit<Required<RichTextLabelOptions>, "badge" | "icon" | "progress" | "attachTo" | "_badgeType" | "_smartSizing" | "_paddingRatio" | "_removeText" | "_progressBar"> & {
    badge: BadgeType;
    icon: string | undefined;
    progress: number | undefined;
    attachTo: AbstractMesh | Vector3 | undefined;
    _badgeType: BadgeType;
    _smartSizing: boolean | undefined;
    _paddingRatio: number | undefined;
    _removeText: boolean | undefined;
    _progressBar: boolean | undefined;
};

export class RichTextLabel {
    private scene: Scene;
    private options: ResolvedRichTextLabelOptions;
    private mesh: Mesh | null = null;
    private texture: DynamicTexture | null = null;
    private material: StandardMaterial | null = null;
    private parsedContent: TextSegment[][] = [];
    private actualDimensions: ActualDimensions = {width: 0, height: 0};
    private contentArea: ContentArea = {x: 0, y: 0, width: 0, height: 0};
    private totalBorderWidth = 0;
    private pointerInfo: PointerInfo | null = null;
    private _progressValue = 0;
    private id: string;
    private originalPosition: Vector3 | null = null;

    private parser: RichTextParser;
    private renderer: RichTextRenderer;
    private animator: RichTextAnimator | null = null;
    private pointerRenderer: PointerRenderer;

    static createLabel(scene: Scene, userOptions: RichTextLabelOptions): RichTextLabel {
        return new RichTextLabel(scene, userOptions);
    }

    constructor(scene: Scene, userOptions: RichTextLabelOptions) {
        this.scene = scene;

        const defaultOptions: ResolvedRichTextLabelOptions = {
            text: "Label",
            position: {x: 0, y: 0, z: 0},
            resolution: 1024,
            autoSize: true,
            font: "Verdana",
            fontSize: 48,
            fontWeight: "normal",
            textColor: "black",
            textAlign: "center",
            lineHeight: 1.2,
            backgroundColor: "transparent",
            backgroundGradient: false,
            backgroundGradientColors: ["rgba(0, 0, 0, 0.8)", "rgba(50, 50, 50, 0.8)"],
            backgroundGradientType: "linear",
            backgroundGradientDirection: "vertical",
            backgroundPadding: 0,
            marginTop: 5,
            marginBottom: 5,
            marginLeft: 5,
            marginRight: 5,
            borderWidth: 0,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borders: [],
            cornerRadius: 0,
            animation: "none",
            animationSpeed: 1,
            billboardMode: Mesh.BILLBOARDMODE_ALL,
            textShadow: false,
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowBlur: 4,
            textShadowOffsetX: 2,
            textShadowOffsetY: 2,
            textOutline: false,
            textOutlineColor: "black",
            textOutlineWidth: 2,
            textOutlineJoin: "round" as CanvasLineJoin,
            pointer: false,
            pointerDirection: "bottom",
            pointerWidth: 20,
            pointerHeight: 15,
            pointerOffset: 0,
            pointerCurve: true,
            attachTo: undefined as AbstractMesh | Vector3 | undefined,
            attachPosition: "top",
            attachOffset: 0.5,
            depthFadeEnabled: false,
            depthFadeNear: 5,
            depthFadeFar: 20,
            badge: undefined,
            icon: undefined,
            iconPosition: "left",
            progress: undefined,
            smartOverflow: false,
            maxNumber: 999,
            overflowSuffix: "+",
            _badgeType: undefined,
            _smartSizing: undefined,
            _paddingRatio: undefined,
            _removeText: undefined,
            _progressBar: undefined,
        };

        const finalOptions = Object.assign({}, defaultOptions, userOptions) as ResolvedRichTextLabelOptions;

        if (finalOptions.badge) {
            const badgeDefaults = BadgeStyleManager.getBadgeStyle(finalOptions.badge);
            if (badgeDefaults) {
                Object.assign(finalOptions, badgeDefaults, userOptions);
            }
        }

        BadgeStyleManager.applyBadgeBehaviors(finalOptions, userOptions);

        if (finalOptions.borderWidth > 0 && finalOptions.borders.length === 0) {
            finalOptions.borders = [{
                width: finalOptions.borderWidth,
                color: finalOptions.borderColor,
                spacing: 0,
            }];
        }

        this.options = finalOptions;
        this.id = `richLabel_${Math.random().toString(36).substring(2, 11)}`;

        if (userOptions.progress !== undefined) {
            this._progressValue = Math.max(0, Math.min(1, userOptions.progress));
        }

        this.parser = new RichTextParser({
            font: this.options.font,
            size: this.options.fontSize,
            weight: this.options.fontWeight,
            style: "normal",
            color: this.options.textColor,
            background: null,
        });

        this.renderer = new RichTextRenderer({
            textAlignment: this.options.textAlign,
            marginLeft: this.options.marginLeft,
            marginRight: this.options.marginRight,
            marginTop: this.options.marginTop,
            marginBottom: this.options.marginBottom,
            backgroundPadding: this.options.backgroundPadding,
            lineHeight: this.options.lineHeight,
            textShadow: this.options.textShadow,
            textShadowColor: this.options.textShadowColor,
            textShadowBlur: this.options.textShadowBlur,
            textShadowOffsetX: this.options.textShadowOffsetX,
            textShadowOffsetY: this.options.textShadowOffsetY,
            textOutline: this.options.textOutline,
            textOutlineColor: this.options.textOutlineColor,
            textOutlineWidth: this.options.textOutlineWidth,
            textOutlineJoin: this.options.textOutlineJoin,
        });

        this.pointerRenderer = new PointerRenderer();

        if (this.options.animation !== "none") {
            this.animator = new RichTextAnimator(this.scene, {
                animation: this.options.animation,
                animationSpeed: this.options.animationSpeed,
            });
        }

        this._create();
    }

    private _create(): void {
        this._parseRichText();
        this._calculateDimensions();
        this._createTexture();
        this._createMaterial();
        this._createMesh();

        if (this.options.attachTo) {
            this._attachToTarget();
        } else if (this.mesh) {
            this.mesh.position = new Vector3(
                this.options.position.x,
                this.options.position.y,
                this.options.position.z,
            );
            this.originalPosition ??= this.mesh.position.clone();
        }

        if (this.options.depthFadeEnabled) {
            this._setupDepthFading();
        }

        if (this.animator && this.mesh && this.material) {
            this.animator.setupAnimation(this.mesh, this.material, (value) => {
                this._progressValue = value;
                this._drawContent();
            });
        }
    }

    private _parseRichText(): void {
        this.parsedContent = this.parser.parse(this.options.text);
    }

    private _calculateDimensions(): void {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
            return;
        }

        const {maxWidth, totalHeight} = this.parser.measureText(this.parsedContent, tempCtx, {
            lineHeight: this.options.lineHeight,
            textOutline: this.options.textOutline,
            textOutlineWidth: this.options.textOutlineWidth,
        });

        const bgPadding = this.options.backgroundPadding * 2;

        this.totalBorderWidth = 0;
        if (this.options.borders.length > 0) {
            for (let i = 0; i < this.options.borders.length; i++) {
                this.totalBorderWidth += this.options.borders[i].width;
                if (i < this.options.borders.length - 1 && this.options.borders[i].spacing > 0) {
                    this.totalBorderWidth += this.options.borders[i].spacing;
                }
            }
        }

        const contentWidth = maxWidth + this.options.marginLeft + this.options.marginRight + bgPadding;
        const contentHeight = totalHeight + this.options.marginTop + this.options.marginBottom + bgPadding;

        this.contentArea = {
            x: this.totalBorderWidth,
            y: this.totalBorderWidth,
            width: contentWidth,
            height: contentHeight,
        };

        this.actualDimensions.width = contentWidth + (this.totalBorderWidth * 2);
        this.actualDimensions.height = contentHeight + (this.totalBorderWidth * 2);

        if (this.options.pointer) {
            this._calculatePointerDimensions();

            if (this.pointerInfo) {
                switch (this.pointerInfo.direction) {
                    case "top":
                        this.actualDimensions.height += this.options.pointerHeight;
                        this.contentArea.y = this.totalBorderWidth + this.options.pointerHeight;
                        break;
                    case "bottom":
                        this.actualDimensions.height += this.options.pointerHeight;
                        break;
                    case "left":
                        this.actualDimensions.width += this.options.pointerHeight;
                        this.contentArea.x = this.totalBorderWidth + this.options.pointerHeight;
                        break;
                    case "right":
                        this.actualDimensions.width += this.options.pointerHeight;
                        break;
                    default:
                        break;
                }
            }
        }

        if (this.options._smartSizing) {
            const minDimension = this.actualDimensions.height;
            if (this.actualDimensions.width < minDimension) {
                const extraWidth = minDimension - this.actualDimensions.width;
                this.actualDimensions.width = minDimension;
                this.contentArea.x += extraWidth / 2;
            }
        }
    }

    private _calculatePointerDimensions(): void {
        let direction = this.options.pointerDirection;

        if (direction === "auto") {
            direction = "bottom";
        }

        this.pointerInfo = {
            direction: direction,
            width: this.options.pointerWidth,
            height: this.options.pointerHeight,
            offset: this.options.pointerOffset,
            curve: this.options.pointerCurve,
        };
    }

    private _createTexture(): void {
        const MAX_TEXTURE_SIZE = 4096;

        let textureWidth = this.options.autoSize ?
            Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.width))) :
            this.options.resolution;

        const aspectRatio = this.actualDimensions.width / this.actualDimensions.height;
        let textureHeight = this.options.autoSize ?
            Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.height))) :
            Math.floor(textureWidth / aspectRatio);

        if (textureWidth > MAX_TEXTURE_SIZE || textureHeight > MAX_TEXTURE_SIZE) {
            const scale = MAX_TEXTURE_SIZE / Math.max(textureWidth, textureHeight);
            textureWidth = Math.floor(textureWidth * scale);
            textureHeight = Math.floor(textureHeight * scale);
            console.warn(`RichTextLabel: Texture size clamped to ${textureWidth}x${textureHeight} (max: ${MAX_TEXTURE_SIZE})`);
        }

        this.texture = new DynamicTexture(`richTextTexture_${this.id}`, {
            width: textureWidth,
            height: textureHeight,
        }, this.scene, true);

        this.texture.hasAlpha = true;
        this.texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);

        this._drawContent();
    }

    private _drawContent(): void {
        if (!this.texture) {
            return;
        }

        const ctx = this.texture.getContext() as unknown as CanvasRenderingContext2D;
        const {width} = this.texture.getSize();
        const {height} = this.texture.getSize();

        ctx.clearRect(0, 0, width, height);

        const scaleX = width / this.actualDimensions.width;
        const scaleY = height / this.actualDimensions.height;
        ctx.save();
        ctx.scale(scaleX, scaleY);

        if (this.options.pointer) {
            this._drawBackgroundWithPointer(ctx);
        } else {
            this._drawBackgroundWithBorders(ctx);
        }

        this.renderer.drawText(ctx, this.parsedContent, this.contentArea);

        ctx.restore();
        this.texture.update();
    }

    private _drawBackgroundWithBorders(ctx: CanvasRenderingContext2D): void {
        const {width} = this.actualDimensions;
        const {height} = this.actualDimensions;
        const radius = this.options.cornerRadius;

        if (this.options.borders.length > 0) {
            let currentOffset = 0;

            for (let i = 0; i < this.options.borders.length; i++) {
                const border = this.options.borders[i];

                if (i > 0 && this.options.borders[i - 1].spacing > 0) {
                    currentOffset += this.options.borders[i - 1].spacing;
                }

                ctx.save();
                ctx.fillStyle = border.color;

                const x = currentOffset;
                const y = currentOffset;
                const w = width - (currentOffset * 2);
                const h = height - (currentOffset * 2);
                const r = Math.max(0, radius - currentOffset);

                this._createRoundedRectPath(ctx, x, y, w, h, r);

                const innerOffset = currentOffset + border.width;
                if (i < this.options.borders.length - 1 || innerOffset < this.totalBorderWidth) {
                    let innerRadius: number;
                    if (radius > 0) {
                        const minRadius = Math.max(2, radius * 0.2);
                        innerRadius = Math.max(minRadius, radius - innerOffset);

                        if (i === this.options.borders.length - 1) {
                            const bgRadius = Math.max(minRadius, radius - this.totalBorderWidth);
                            if (innerRadius < bgRadius + 5) {
                                innerRadius = bgRadius;
                            }
                        }
                    } else {
                        innerRadius = 0;
                    }

                    this._createRoundedRectPath(ctx,
                        innerOffset,
                        innerOffset,
                        width - (innerOffset * 2),
                        height - (innerOffset * 2),
                        innerRadius,
                    );
                }

                ctx.fill("evenodd");
                ctx.restore();

                currentOffset = innerOffset;
            }
        }

        ctx.beginPath();
        this._createRoundedRectPath(ctx,
            this.contentArea.x,
            this.contentArea.y,
            this.contentArea.width,
            this.contentArea.height,
            Math.max(0, radius - this.totalBorderWidth),
        );
        ctx.closePath();

        this._fillBackground(ctx, this.actualDimensions.width, this.actualDimensions.height);

        if (this.options._progressBar) {
            this._drawProgressBar(ctx);
        }
    }

    private _drawBackgroundWithPointer(ctx: CanvasRenderingContext2D): void {
        const {width} = this.actualDimensions;
        const {height} = this.actualDimensions;
        const radius = this.options.cornerRadius;

        if (this.options.borders.length > 0 && this.pointerInfo) {
            let currentOffset = 0;

            for (let i = 0; i < this.options.borders.length; i++) {
                const border = this.options.borders[i];

                if (i > 0 && this.options.borders[i - 1].spacing > 0) {
                    currentOffset += this.options.borders[i - 1].spacing;
                }

                ctx.save();
                ctx.fillStyle = border.color;
                ctx.beginPath();

                const pointerArea: PointerContentArea = {
                    x: this.contentArea.x - this.totalBorderWidth + currentOffset,
                    y: this.contentArea.y - this.totalBorderWidth + currentOffset,
                    width: this.contentArea.width + ((this.totalBorderWidth - currentOffset) * 2),
                    height: this.contentArea.height + ((this.totalBorderWidth - currentOffset) * 2),
                };

                this.pointerRenderer.createSpeechBubblePath(ctx, pointerArea, Math.max(0, radius - currentOffset), {
                    width: this.pointerInfo.width,
                    height: this.pointerInfo.height,
                    offset: this.pointerInfo.offset,
                    direction: this.pointerInfo.direction as "top" | "bottom" | "left" | "right" | "auto",
                    curved: this.pointerInfo.curve,
                });

                const innerOffset = currentOffset + border.width;
                if (i < this.options.borders.length - 1 || innerOffset < this.totalBorderWidth) {
                    let innerRadius: number;
                    if (radius > 0) {
                        const minRadius = Math.max(2, radius * 0.2);
                        innerRadius = Math.max(minRadius, radius - innerOffset);

                        if (i === this.options.borders.length - 1) {
                            const bgRadius = Math.max(minRadius, radius - this.totalBorderWidth);
                            if (innerRadius < bgRadius + 5) {
                                innerRadius = bgRadius;
                            }
                        }
                    } else {
                        innerRadius = 0;
                    }

                    const innerX = this.contentArea.x - this.totalBorderWidth + innerOffset;
                    const innerY = this.contentArea.y - this.totalBorderWidth + innerOffset;
                    ctx.moveTo(innerX + innerRadius, innerY);

                    const innerPointerArea: PointerContentArea = {
                        x: innerX,
                        y: innerY,
                        width: this.contentArea.width + ((this.totalBorderWidth - innerOffset) * 2),
                        height: this.contentArea.height + ((this.totalBorderWidth - innerOffset) * 2),
                    };

                    this.pointerRenderer.createSpeechBubblePathCCW(ctx, innerPointerArea, innerRadius, {
                        width: this.pointerInfo.width,
                        height: this.pointerInfo.height,
                        offset: this.pointerInfo.offset,
                        direction: this.pointerInfo.direction as "top" | "bottom" | "left" | "right" | "auto",
                        curved: this.pointerInfo.curve,
                    });
                }

                ctx.fill("evenodd");
                ctx.restore();

                currentOffset = innerOffset;
            }
        }

        ctx.beginPath();
        if (this.pointerInfo) {
            this.pointerRenderer.createSpeechBubblePath(ctx, this.contentArea, radius, {
                width: this.pointerInfo.width,
                height: this.pointerInfo.height,
                offset: this.pointerInfo.offset,
                direction: this.pointerInfo.direction as PointerDirection,
                curved: this.pointerInfo.curve,
            });
        }

        ctx.closePath();

        this._fillBackground(ctx, width, height);

        if (this.options._progressBar) {
            this._drawProgressBar(ctx);
        }
    }

    private _fillBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
        if (this.options.backgroundGradient) {
            let gradient: CanvasGradient;
            if (this.options.backgroundGradientType === "radial") {
                gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
            } else {
                switch (this.options.backgroundGradientDirection) {
                    case "horizontal":
                        gradient = ctx.createLinearGradient(0, 0, width, 0);
                        break;
                    case "diagonal":
                        gradient = ctx.createLinearGradient(0, 0, width, height);
                        break;
                    case "vertical":
                    default:
                        gradient = ctx.createLinearGradient(0, 0, 0, height);
                        break;
                }
            }

            const colors = this.options.backgroundGradientColors;
            for (let i = 0; i < colors.length; i++) {
                gradient.addColorStop(i / (colors.length - 1), colors[i]);
            }
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.options.backgroundColor;
        }

        ctx.fill();
    }

    private _drawProgressBar(ctx: CanvasRenderingContext2D): void {
        const progressBarHeight = this.contentArea.height * 0.2;
        const progressBarY = this.contentArea.y + this.contentArea.height - progressBarHeight - this.options.backgroundPadding;
        const progressBarX = this.contentArea.x + this.options.backgroundPadding;
        const progressBarWidth = this.contentArea.width - (this.options.backgroundPadding * 2);

        ctx.save();
        ctx.fillStyle = "rgba(0, 122, 255, 1)";
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth * this._progressValue, progressBarHeight);
        ctx.restore();
    }

    private _createRoundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number,
        width: number, height: number, radius: number): void {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    private _createMaterial(): void {
        this.material = new StandardMaterial(`richTextMaterial_${this.id}`, this.scene);
        if (this.texture) {
            this.material.diffuseTexture = this.texture;
        }

        this.material.specularColor = new Color3(0, 0, 0);
        this.material.emissiveColor = new Color3(1, 1, 1);
        this.material.backFaceCulling = false;
        this.material.useAlphaFromDiffuseTexture = true;
        this.material.alphaMode = Engine.ALPHA_COMBINE;
    }

    private _createMesh(): void {
        const sizeScale = this.options.fontSize / 48;

        const aspectRatio = this.actualDimensions.width / this.actualDimensions.height;
        const planeHeight = sizeScale;
        const planeWidth = aspectRatio * sizeScale;

        this.mesh = MeshBuilder.CreatePlane(`richTextPlane_${this.id}`, {
            width: planeWidth,
            height: planeHeight,
            sideOrientation: Mesh.DOUBLESIDE,
        }, this.scene);

        this.mesh.material = this.material;
        this.mesh.billboardMode = this.options.billboardMode;
    }

    private _attachToTarget(): void {
        const target = this.options.attachTo;
        const position = this.options.attachPosition;
        const offset = this.options.attachOffset;

        if (!this.mesh) {
            return;
        }

        let targetPos: Vector3;
        let bounds: {min: Vector3, max: Vector3};

        if (target instanceof Vector3) {
            targetPos = target.clone();
            bounds = {
                min: targetPos.clone(),
                max: targetPos.clone(),
            };
        } else if (target && "getBoundingInfo" in target && target instanceof AbstractMesh) {
            this.mesh.parent = target;
            targetPos = Vector3.Zero();

            const boundingInfo = target.getBoundingInfo();
            bounds = {
                min: boundingInfo.boundingBox.minimum,
                max: boundingInfo.boundingBox.maximum,
            };
        } else {
            this.mesh.position = new Vector3(
                this.options.position.x,
                this.options.position.y,
                this.options.position.z,
            );
            return;
        }

        const sizeScale = this.options.fontSize / 48;
        const labelWidth = (this.actualDimensions.width / this.actualDimensions.height) * sizeScale;
        const labelHeight = sizeScale;

        const newPos = targetPos.clone();

        if (this.options.pointer && this.options.pointerDirection === "auto" && this.pointerInfo) {
            switch (position) {
                case "top":
                case "top-left":
                case "top-right":
                    this.pointerInfo.direction = "bottom";
                    break;
                case "bottom":
                case "bottom-left":
                case "bottom-right":
                    this.pointerInfo.direction = "top";
                    break;
                case "left":
                    this.pointerInfo.direction = "right";
                    break;
                case "right":
                    this.pointerInfo.direction = "left";
                    break;
                default:
                    this.pointerInfo.direction = "bottom";
            }

            this._calculateDimensions();
            this._drawContent();
        }

        switch (position) {
            case "top-left":
                newPos.x = bounds.min.x - (labelWidth / 2) - offset;
                newPos.y = bounds.max.y + (labelHeight / 2) + offset;
                break;
            case "top":
                newPos.x = (bounds.min.x + bounds.max.x) / 2;
                newPos.y = bounds.max.y + (labelHeight / 2) + offset;
                break;
            case "top-right":
                newPos.x = bounds.max.x + (labelWidth / 2) + offset;
                newPos.y = bounds.max.y + (labelHeight / 2) + offset;
                break;
            case "left":
                newPos.x = bounds.min.x - (labelWidth / 2) - offset;
                newPos.y = (bounds.min.y + bounds.max.y) / 2;
                break;
            case "center":
                newPos.x = (bounds.min.x + bounds.max.x) / 2;
                newPos.y = (bounds.min.y + bounds.max.y) / 2;
                break;
            case "right":
                newPos.x = bounds.max.x + (labelWidth / 2) + offset;
                newPos.y = (bounds.min.y + bounds.max.y) / 2;
                break;
            case "bottom-left":
                newPos.x = bounds.min.x - (labelWidth / 2) - offset;
                newPos.y = bounds.min.y - (labelHeight / 2) - offset;
                break;
            case "bottom":
                newPos.x = (bounds.min.x + bounds.max.x) / 2;
                newPos.y = bounds.min.y - (labelHeight / 2) - offset;
                break;
            case "bottom-right":
                newPos.x = bounds.max.x + (labelWidth / 2) + offset;
                newPos.y = bounds.min.y - (labelHeight / 2) - offset;
                break;
            default:
                newPos.y = bounds.max.y + (labelHeight / 2) + offset;
        }

        this.mesh.position = newPos;
        this.originalPosition ??= newPos.clone();

        if (this.animator) {
            this.animator.updateOriginalPosition(newPos);
        }
    }

    private _setupDepthFading(): void {
        const camera = this.scene.activeCamera;

        this.scene.registerBeforeRender(() => {
            if (!camera || !this.mesh || !this.material) {
                return;
            }

            const distance = Vector3.Distance(camera.position, this.mesh.position);

            let fadeFactor = 1.0;
            if (distance < this.options.depthFadeNear) {
                fadeFactor = 1.0;
            } else if (distance > this.options.depthFadeFar) {
                fadeFactor = 0.0;
            } else {
                const fadeRange = this.options.depthFadeFar - this.options.depthFadeNear;
                fadeFactor = 1.0 - ((distance - this.options.depthFadeNear) / fadeRange);
            }

            this.material.alpha = fadeFactor;
        });
    }

    public setText(text: string): void {
        if (this.options.smartOverflow && !isNaN(Number(text))) {
            const num = parseInt(text);
            if (num > this.options.maxNumber) {
                if (num >= 1000) {
                    this.options.text = `${Math.floor(num / 1000)}k`;
                } else {
                    this.options.text = `${this.options.maxNumber}${this.options.overflowSuffix}`;
                }
            } else {
                this.options.text = text;
            }
        } else {
            this.options.text = text;
        }

        this._parseRichText();
        this._calculateDimensions();
        this._drawContent();
    }

    public setProgress(value: number): void {
        this._progressValue = Math.max(0, Math.min(1, value));
        this._drawContent();
    }

    public attachTo(target: AbstractMesh | Vector3, position: AttachPosition = "top", offset = 0.5): void {
        this.options.attachTo = target;
        this.options.attachPosition = position;
        this.options.attachOffset = offset;

        if (this.mesh?.parent && this.mesh.parent !== target) {
            this.mesh.parent = null;
        }

        this._attachToTarget();
    }

    public dispose(): void {
        if (this.animator) {
            this.animator.dispose();
        }

        if (this.mesh) {
            this.mesh.dispose();
        }

        if (this.material) {
            this.material.dispose();
        }

        if (this.texture) {
            this.texture.dispose();
        }
    }

    public get labelMesh(): Mesh | null {
        return this.mesh;
    }

    public get labelId(): string {
        return this.id;
    }
}

