import {
    AbstractMesh,
    Color3,
    DynamicTexture,
    Engine,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Texture,
    Vector3} from "@babylonjs/core";

// Interfaces for type safety
interface BorderConfig {
    width: number;
    color: string;
    spacing: number;
}

interface RichTextStyle {
    font: string;
    size: number;
    weight: string;
    style: string;
    color: string;
    background: string | null;
}

interface TextSegment {
    text: string;
    style: RichTextStyle;
}

interface ContentArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ActualDimensions {
    width: number;
    height: number;
}

interface PointerInfo {
    direction: "top" | "bottom" | "left" | "right" | "auto";
    width: number;
    height: number;
    offset: number;
    curve: boolean;
}

interface Position3D {
    x: number;
    y: number;
    z: number;
}

type AttachPosition = "top" | "top-left" | "top-right" | "left" | "center" | "right" | "bottom" | "bottom-left" | "bottom-right";
type TextAlign = "left" | "center" | "right";
type BillboardMode = number; // Babylon's billboard mode constants
type AnimationType = "pulse" | "bounce" | "shake" | "glow" | "fill" | null;
type BadgeType = "notification" | "label" | "label-success" | "label-warning" | "label-danger" | "count" | "icon" | "progress" | "dot" | undefined;
type GradientType = "linear" | "radial";
type GradientDirection = "vertical" | "horizontal" | "diagonal";

export interface RichTextLabelOptions {
    // Text content (made optional with default)
    text?: string;

    // Font settings
    font?: string;
    fontSize?: number;
    fontWeight?: string;
    lineHeight?: number;

    // Colors
    textColor?: string;
    backgroundColor?: string;

    // Single border (legacy)
    borderWidth?: number;
    borderColor?: string;

    // Multiple borders
    borders?: BorderConfig[];

    // Margins
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;

    // Layout
    textAlign?: TextAlign;
    cornerRadius?: number;
    autoSize?: boolean;
    resolution?: number;
    billboardMode?: BillboardMode;

    // Position
    position?: Position3D;
    attachTo?: AbstractMesh | Vector3 | null;
    attachPosition?: AttachPosition;
    attachOffset?: number;

    // Depth fading
    depthFadeEnabled?: boolean;
    depthFadeNear?: number;
    depthFadeFar?: number;

    // Text effects
    textOutline?: boolean;
    textOutlineWidth?: number;
    textOutlineColor?: string;
    textOutlineJoin?: CanvasLineJoin;
    textShadow?: boolean;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffsetX?: number;
    textShadowOffsetY?: number;

    // Background effects
    backgroundPadding?: number;
    backgroundGradient?: boolean;
    backgroundGradientType?: GradientType;
    backgroundGradientColors?: string[];
    backgroundGradientDirection?: GradientDirection;

    // Pointer/Arrow
    pointer?: boolean;
    pointerDirection?: "top" | "bottom" | "left" | "right" | "auto";
    pointerWidth?: number;
    pointerHeight?: number;
    pointerOffset?: number;
    pointerCurve?: boolean;

    // Animation
    animation?: AnimationType;
    animationSpeed?: number;

    // Badge
    badge?: BadgeType;
    icon?: string;
    iconPosition?: "left" | "right";
    progress?: number;

    // Smart overflow
    smartOverflow?: boolean;
    maxNumber?: number;
    overflowSuffix?: string;

    // Internal badge properties
    _badgeType?: BadgeType;
    _smartSizing?: boolean;
    _paddingRatio?: number;
    _removeText?: boolean;
    _progressBar?: boolean;
}

// Type for resolved options where all fields are defined
type ResolvedRichTextLabelOptions = Omit<Required<RichTextLabelOptions>, "badge" | "icon" | "progress" | "_badgeType" | "_smartSizing" | "_paddingRatio" | "_removeText" | "_progressBar"> & {
    badge: BadgeType;
    icon: string | undefined;
    progress: number | undefined;
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
    private animationTime = 0;
    private _progressValue = 0;
    private id: string;
    private originalPosition: Vector3 | null = null;

    // Badge style presets
    private static readonly BADGE_STYLES: Record<Exclude<BadgeType, undefined>, Partial<RichTextLabelOptions>> = {
        "notification": {
            backgroundColor: "rgba(255, 59, 48, 1)",
            textColor: "white",
            fontWeight: "bold",
            fontSize: 24,
            cornerRadius: 999,
            textAlign: "center",
            smartOverflow: true,
            animation: "pulse",
            textOutline: true,
            textOutlineWidth: 1,
            textOutlineColor: "rgba(0, 0, 0, 0.3)",
            pointer: false,
            _badgeType: "notification",
            _smartSizing: true,
            _paddingRatio: 0.8,
        },
        "label": {
            fontSize: 24,
            cornerRadius: 12,
            fontWeight: "600",
            backgroundColor: "rgba(0, 122, 255, 1)",
            textColor: "white",
            textShadow: true,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
            _badgeType: "label",
            _paddingRatio: 0.6,
        },
        "label-success": {
            fontSize: 24,
            cornerRadius: 12,
            fontWeight: "600",
            backgroundColor: "rgba(52, 199, 89, 1)",
            textColor: "white",
            textShadow: true,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            _badgeType: "label",
            _paddingRatio: 0.6,
        },
        "label-warning": {
            fontSize: 24,
            cornerRadius: 12,
            fontWeight: "600",
            backgroundColor: "rgba(255, 204, 0, 1)",
            textColor: "black",
            textOutline: true,
            textOutlineWidth: 1,
            textOutlineColor: "rgba(255, 255, 255, 0.5)",
            _badgeType: "label",
            _paddingRatio: 0.6,
        },
        "label-danger": {
            fontSize: 24,
            cornerRadius: 12,
            fontWeight: "600",
            backgroundColor: "rgba(255, 59, 48, 1)",
            textColor: "white",
            textShadow: true,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            _badgeType: "label",
            _paddingRatio: 0.6,
        },
        "count": {
            backgroundColor: "rgba(0, 122, 255, 1)",
            textColor: "white",
            fontWeight: "bold",
            fontSize: 22,
            cornerRadius: 999,
            textAlign: "center",
            smartOverflow: true,
            textOutline: true,
            textOutlineWidth: 1,
            textOutlineColor: "rgba(0, 0, 0, 0.2)",
            _badgeType: "count",
            _smartSizing: true,
            _paddingRatio: 0.7,
        },
        "icon": {
            fontSize: 28,
            cornerRadius: 999,
            textAlign: "center",
            backgroundColor: "rgba(100, 100, 100, 0.8)",
            textShadow: true,
            _badgeType: "icon",
            _paddingRatio: 0.5,
        },
        "progress": {
            backgroundColor: "rgba(235, 235, 235, 1)",
            textColor: "black",
            fontSize: 24,
            cornerRadius: 12,
            fontWeight: "600",
            animation: "fill",
            textOutline: true,
            textOutlineWidth: 1,
            textOutlineColor: "white",
            _badgeType: "progress",
            _paddingRatio: 0.8,
            _progressBar: true,
        },
        "dot": {
            backgroundColor: "rgba(255, 59, 48, 1)",
            cornerRadius: 999,
            animation: "pulse",
            pointer: false,
            _badgeType: "dot",
            _removeText: true,
            marginTop: 6,
            marginBottom: 6,
            marginLeft: 6,
            marginRight: 6,
            fontSize: 8,
        },
    };

    constructor(scene: Scene, options: RichTextLabelOptions = {}) {
        this.scene = scene;

        // Validate fontSize to prevent crashes with large values
        if (options.fontSize !== undefined && options.fontSize > 500) {
            console.warn(`RichTextLabel: fontSize ${options.fontSize} exceeds maximum of 500, clamping to 500`);
            options.fontSize = 500;
        }

        // Default options - using a custom type that allows undefined for optional badge-related fields
        const defaultOptions: ResolvedRichTextLabelOptions = {
            text: "Label",
            font: "Verdana",
            fontSize: 48,
            fontWeight: "normal",
            lineHeight: 1.2,
            textColor: "black",
            backgroundColor: "transparent",
            borderWidth: 0,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borders: [],
            marginTop: 5,
            marginBottom: 5,
            marginLeft: 5,
            marginRight: 5,
            textAlign: "center",
            cornerRadius: 0,
            autoSize: true,
            resolution: 1024,
            billboardMode: Mesh.BILLBOARDMODE_ALL,
            depthFadeEnabled: false,
            depthFadeNear: 5,
            depthFadeFar: 20,
            position: {x: 0, y: 0, z: 0},
            attachTo: null,
            attachPosition: "top",
            attachOffset: 0.5,
            textOutline: false,
            textOutlineWidth: 2,
            textOutlineColor: "black",
            textOutlineJoin: "round",
            textShadow: false,
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowBlur: 4,
            textShadowOffsetX: 2,
            textShadowOffsetY: 2,
            backgroundPadding: 0,
            backgroundGradient: false,
            backgroundGradientType: "linear",
            backgroundGradientColors: ["rgba(0, 0, 0, 0.8)", "rgba(50, 50, 50, 0.8)"],
            backgroundGradientDirection: "vertical",
            pointer: false,
            pointerDirection: "bottom",
            pointerWidth: 20,
            pointerHeight: 15,
            pointerOffset: 0,
            pointerCurve: true,
            animation: null,
            animationSpeed: 1,
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

        // Start with defaults
        let finalOptions = Object.assign({}, defaultOptions);

        // Apply badge preset if specified
        if (options.badge !== undefined) {
            const badgePreset = RichTextLabel.BADGE_STYLES[options.badge];
            finalOptions = Object.assign(finalOptions, badgePreset);

            // Apply smart badge behaviors
            this._applyBadgeBehaviors(finalOptions, options);
        }

        // Apply user options (these override everything)
        finalOptions = Object.assign(finalOptions, options) as ResolvedRichTextLabelOptions;

        // Convert single border to borders array if needed
        if (finalOptions.borderWidth > 0 && finalOptions.borders.length === 0) {
            finalOptions.borders = [{
                width: finalOptions.borderWidth,
                color: finalOptions.borderColor,
                spacing: 0,
            }];
        }

        // Store the final options
        this.options = finalOptions;

        // Generate unique ID
        this.id = `richLabel_${Math.random().toString(36).substring(2, 11)}`;

        this._create();
    }

    private _applyBadgeBehaviors(options: ResolvedRichTextLabelOptions, userOptions: RichTextLabelOptions): void {
        const badgeType = options._badgeType;

        // Handle padding ratio
        if (options._paddingRatio && !userOptions.marginTop) {
            const padding = options.fontSize * options._paddingRatio;
            options.marginTop = options.marginBottom = padding;
            options.marginLeft = options.marginRight = padding;
        }

        // Badge-specific behaviors
        switch (badgeType) {
            case "notification":
            case "count": {
                // Apply smart overflow
                if (options.smartOverflow && !isNaN(Number(userOptions.text))) {
                    const num = parseInt(userOptions.text ?? "0");
                    if (num > options.maxNumber) {
                        if (num >= 1000) {
                            options.text = `${Math.floor(num / 1000)}k`;
                        } else {
                            options.text = `${options.maxNumber}${options.overflowSuffix}`;
                        }
                    }
                }

                break;
            }
            case "dot": {
                if (options._removeText) {
                    options.text = "";
                }

                break;
            }
            case "progress": {
                if (userOptions.progress !== undefined) {
                    this._progressValue = Math.max(0, Math.min(1, userOptions.progress));
                }

                break;
            }
            case "icon": {
                if (userOptions.icon && !userOptions.text) {
                    options.text = userOptions.icon;
                } else if (userOptions.icon && userOptions.text) {
                    const iconPos = userOptions.iconPosition ?? "left";
                    if (iconPos === "left") {
                        options.text = `${userOptions.icon} ${userOptions.text}`;
                    } else {
                        options.text = `${userOptions.text} ${userOptions.icon}`;
                    }
                }

                break;
            }
            default:
                // No special behavior needed
                break;
        }
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
            // Store original position for animations
            this.originalPosition ??= this.mesh.position.clone();
        }

        if (this.options.depthFadeEnabled) {
            this._setupDepthFading();
        }

        if (this.options.animation) {
            this._setupAnimation();
        }
    }

    private _parseRichText(): void {
        const {text} = this.options;
        const lines = text.split("\n");
        this.parsedContent = [];

        for (const line of lines) {
            const segments: TextSegment[] = [];
            let currentPos = 0;

            const styleStack: RichTextStyle[] = [{
                font: this.options.font,
                size: this.options.fontSize,
                weight: this.options.fontWeight,
                style: "normal",
                color: this.options.textColor,
                background: null,
            }];

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
                            newStyle.color = tagValue || this.options.textColor;
                            break;
                        case "size":
                            newStyle.size = parseInt(tagValue || "0") || this.options.fontSize;
                            break;
                        case "font":
                            newStyle.font = tagValue || this.options.font;
                            break;
                        case "bg":
                            newStyle.background = tagValue || null;
                            break;
                        default:
                            // Unknown tag, ignore
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

            this.parsedContent.push(segments);
        }
    }

    private _calculateDimensions(): void {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
            return;
        }

        let maxWidth = 0;
        let totalHeight = 0;

        for (const lineSegments of this.parsedContent) {
            let lineWidth = 0;
            let maxLineHeight = 0;

            for (const segment of lineSegments) {
                const {style} = segment;

                tempCtx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
                const metrics = tempCtx.measureText(segment.text);

                lineWidth += metrics.width;
                maxLineHeight = Math.max(maxLineHeight, style.size);
            }

            // Add extra width for outline if enabled
            if (this.options.textOutline) {
                lineWidth += this.options.textOutlineWidth * 2;
                maxLineHeight += this.options.textOutlineWidth * 2;
            }

            maxWidth = Math.max(maxWidth, lineWidth);
            totalHeight += maxLineHeight * this.options.lineHeight;
        }

        // Add background padding
        const bgPadding = this.options.backgroundPadding * 2;

        // Calculate total border width INCLUDING spacing between borders
        this.totalBorderWidth = 0;
        if (this.options.borders.length > 0) {
            for (let i = 0; i < this.options.borders.length; i++) {
                this.totalBorderWidth += this.options.borders[i].width;
                // Add spacing AFTER each border except the last
                if (i < this.options.borders.length - 1 && this.options.borders[i].spacing > 0) {
                    this.totalBorderWidth += this.options.borders[i].spacing;
                }
            }
        }

        // Calculate content dimensions (text + margins + padding)
        const contentWidth = maxWidth + this.options.marginLeft + this.options.marginRight + bgPadding;
        const contentHeight = totalHeight + this.options.marginTop + this.options.marginBottom + bgPadding;

        // Initialize content area (will be adjusted for pointer and borders)
        this.contentArea = {
            x: this.totalBorderWidth,
            y: this.totalBorderWidth,
            width: contentWidth,
            height: contentHeight,
        };

        // Set initial dimensions
        this.actualDimensions.width = contentWidth + (this.totalBorderWidth * 2);
        this.actualDimensions.height = contentHeight + (this.totalBorderWidth * 2);

        // Add space for pointer if enabled
        if (this.options.pointer) {
            this._calculatePointerDimensions();

            // Adjust dimensions and content area based on pointer direction
            if (this.pointerInfo) {
                switch (this.pointerInfo.direction) {
                    case "top":
                        this.actualDimensions.height += this.options.pointerHeight;
                        this.contentArea.y = this.totalBorderWidth + this.options.pointerHeight;
                        break;
                    case "bottom":
                        this.actualDimensions.height += this.options.pointerHeight;
                        // Content area stays at y = totalBorderWidth
                        break;
                    case "left":
                        this.actualDimensions.width += this.options.pointerHeight;
                        this.contentArea.x = this.totalBorderWidth + this.options.pointerHeight;
                        break;
                    case "right":
                        this.actualDimensions.width += this.options.pointerHeight;
                        // Content area stays at x = totalBorderWidth
                        break;
                    default:
                        // Auto or unknown direction
                        break;
                }
            }
        }

        // Apply smart sizing for badges
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

        // Auto-calculate direction if attached
        if (direction === "auto" && this.options.attachTo) {
            // This will be calculated during attachment
            direction = "bottom"; // Default for now
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
        // Maximum texture size to prevent GPU memory issues
        const MAX_TEXTURE_SIZE = 4096;

        let textureWidth = this.options.autoSize ?
            Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.width))) :
            this.options.resolution;

        const aspectRatio = this.actualDimensions.width / this.actualDimensions.height;
        let textureHeight = this.options.autoSize ?
            Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.height))) :
            Math.floor(textureWidth / aspectRatio);

        // Clamp texture dimensions to prevent crashes
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

        // Draw background with pointer
        if (this.options.pointer) {
            this._drawBackgroundWithPointer(ctx);
        } else {
            // Draw background with multiple borders
            this._drawBackgroundWithBorders(ctx);
        }

        // Draw rich text with effects
        this._drawRichText(ctx);

        ctx.restore();
        this.texture.update();
    }

    private _drawBackgroundWithBorders(ctx: CanvasRenderingContext2D): void {
        const {width} = this.actualDimensions;
        const {height} = this.actualDimensions;
        const radius = this.options.cornerRadius;

        // Smart Radius Calculation:
        // To prevent inner borders from having square corners that extend beyond
        // the rounded background, we ensure a minimum radius and smooth transitions.
        // The minimum radius is either 2px or 20% of the original radius.
        // For the innermost border, we match it closely to the background radius.

        // Draw borders from outside to inside as filled rings
        if (this.options.borders.length > 0) {
            let currentOffset = 0;

            for (let i = 0; i < this.options.borders.length; i++) {
                const border = this.options.borders[i];

                // Add spacing from previous border
                if (i > 0 && this.options.borders[i - 1].spacing > 0) {
                    currentOffset += this.options.borders[i - 1].spacing;
                }

                // Calculate outer boundary
                const outerX = currentOffset;
                const outerY = currentOffset;
                const outerW = width - (currentOffset * 2);
                const outerH = height - (currentOffset * 2);
                const outerRadius = Math.max(0, radius - currentOffset);

                // Calculate inner boundary
                const innerOffset = currentOffset + border.width;
                const innerX = innerOffset;
                const innerY = innerOffset;
                const innerW = width - (innerOffset * 2);
                const innerH = height - (innerOffset * 2);

                // Smart radius calculation to prevent square corners
                let innerRadius: number;
                if (radius > 0) {
                    // Ensure minimum radius of 2px or 20% of original radius, whichever is larger
                    const minRadius = Math.max(2, radius * 0.2);
                    innerRadius = Math.max(minRadius, radius - innerOffset);

                    // If this is getting close to the background, match its radius
                    if (i === this.options.borders.length - 1) {
                        const bgRadius = Math.max(0, radius - this.totalBorderWidth);
                        if (innerRadius < bgRadius + 5) {
                            innerRadius = bgRadius;
                        }
                    }
                } else {
                    innerRadius = 0;
                }

                // Draw border as a filled ring
                ctx.fillStyle = border.color;
                ctx.beginPath();

                // Outer path (clockwise)
                this._createRoundedRectPath(ctx, outerX, outerY, outerW, outerH, outerRadius);

                // Only draw inner path if this isn't the innermost border
                if (i < this.options.borders.length - 1 || innerOffset < this.totalBorderWidth) {
                    // Inner path (counter-clockwise for hole)
                    ctx.moveTo(innerX + innerRadius, innerY);
                    ctx.arcTo(innerX + innerW, innerY, innerX + innerW, innerY + innerRadius, innerRadius);
                    ctx.lineTo(innerX + innerW, innerY + innerH - innerRadius);
                    ctx.arcTo(innerX + innerW, innerY + innerH, innerX + innerW - innerRadius, innerY + innerH, innerRadius);
                    ctx.lineTo(innerX + innerRadius, innerY + innerH);
                    ctx.arcTo(innerX, innerY + innerH, innerX, innerY + innerH - innerRadius, innerRadius);
                    ctx.lineTo(innerX, innerY + innerRadius);
                    ctx.arcTo(innerX, innerY, innerX + innerRadius, innerY, innerRadius);
                    ctx.closePath();
                }

                ctx.fill("evenodd");

                // Update offset for next border
                currentOffset = innerOffset;
            }
        }

        // Draw background fill (no gap!)
        const fillX = this.totalBorderWidth;
        const fillY = this.totalBorderWidth;
        const fillW = width - (this.totalBorderWidth * 2);
        const fillH = height - (this.totalBorderWidth * 2);

        // Smart radius for background fill
        let fillRadius: number;
        if (radius > 0) {
            // Ensure minimum radius that looks good
            const minRadius = Math.max(2, radius * 0.2);
            fillRadius = Math.max(minRadius, radius - this.totalBorderWidth);
        } else {
            fillRadius = 0;
        }

        ctx.beginPath();
        this._createRoundedRectPath(ctx, fillX, fillY, fillW, fillH, fillRadius);

        // Fill with gradient or solid color
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

    private _drawBackgroundWithPointer(ctx: CanvasRenderingContext2D): void {
        const {width} = this.actualDimensions;
        const {height} = this.actualDimensions;
        const radius = this.options.cornerRadius;
        const {pointerHeight} = this.options;
        const {pointerWidth} = this.options;
        const {pointerOffset} = this.options;

        // Use pre-calculated content area
        const contentX = this.contentArea.x;
        const contentY = this.contentArea.y;
        const contentWidth = this.contentArea.width;
        const contentHeight = this.contentArea.height;

        // Draw multiple borders if enabled
        if (this.options.borders.length > 0) {
            let currentOffset = 0;

            for (let i = 0; i < this.options.borders.length; i++) {
                const border = this.options.borders[i];

                // Add spacing from previous border
                if (i > 0 && this.options.borders[i - 1].spacing > 0) {
                    currentOffset += this.options.borders[i - 1].spacing;
                }

                ctx.save();
                ctx.fillStyle = border.color;
                ctx.beginPath();

                // Create outer speech bubble path
                if (this.pointerInfo) {
                    this._createSpeechBubblePath(ctx,
                        contentX - this.totalBorderWidth + currentOffset,
                        contentY - this.totalBorderWidth + currentOffset,
                        contentWidth + ((this.totalBorderWidth - currentOffset) * 2),
                        contentHeight + ((this.totalBorderWidth - currentOffset) * 2),
                        Math.max(0, radius - currentOffset),
                        pointerWidth,
                        pointerHeight,
                        pointerOffset,
                        this.pointerInfo.direction,
                        this.options.pointerCurve,
                    );
                }

                // Create inner speech bubble path (for the hole) if not the last/innermost border
                const innerOffset = currentOffset + border.width;
                if (i < this.options.borders.length - 1 || innerOffset < this.totalBorderWidth) {
                    // Smart radius calculation for inner path
                    let innerRadius: number;
                    if (radius > 0) {
                        const minRadius = Math.max(2, radius * 0.2);
                        innerRadius = Math.max(minRadius, radius - innerOffset);

                        // If this is getting close to the background, match its radius
                        if (i === this.options.borders.length - 1) {
                            const bgRadius = Math.max(minRadius, radius - this.totalBorderWidth);
                            if (innerRadius < bgRadius + 5) {
                                innerRadius = bgRadius;
                            }
                        }
                    } else {
                        innerRadius = 0;
                    }

                    // Move to start position for inner path
                    const innerX = contentX - this.totalBorderWidth + innerOffset;
                    const innerY = contentY - this.totalBorderWidth + innerOffset;
                    ctx.moveTo(innerX + innerRadius, innerY);

                    // Draw inner path counter-clockwise
                    if (this.pointerInfo) {
                        this._createSpeechBubblePathCCW(ctx,
                            innerX,
                            innerY,
                            contentWidth + ((this.totalBorderWidth - innerOffset) * 2),
                            contentHeight + ((this.totalBorderWidth - innerOffset) * 2),
                            innerRadius,
                            pointerWidth,
                            pointerHeight,
                            pointerOffset,
                            this.pointerInfo.direction,
                            this.options.pointerCurve,
                        );
                    }
                }

                ctx.fill("evenodd");
                ctx.restore();

                currentOffset = innerOffset;
            }
        }

        // Create main speech bubble path for background fill
        ctx.beginPath();
        if (this.pointerInfo) {
            this._createSpeechBubblePath(ctx, contentX, contentY, contentWidth, contentHeight, radius, pointerWidth, pointerHeight, pointerOffset, this.pointerInfo.direction, this.options.pointerCurve);
        }

        ctx.closePath();

        // Fill background
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

    private _createSpeechBubblePath(ctx: CanvasRenderingContext2D, contentX: number, contentY: number,
        contentWidth: number, contentHeight: number, radius: number,
        pointerWidth: number, pointerHeight: number, pointerOffset: number,
        direction: string, curved: boolean): void {
        switch (direction) {
            case "bottom": {
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
                break;
            }
            case "top": {
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
                ctx.lineTo(Math.max(centerXTop - (pointerWidth / 2), contentX + radius), contentY);
                break;
            }
            case "left": {
                const centerYLeft = contentY + (contentHeight / 2) + pointerOffset;
                ctx.moveTo(contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
                if (curved) {
                    ctx.quadraticCurveTo(contentX - pointerHeight, centerYLeft, contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
                } else {
                    ctx.lineTo(contentX - pointerHeight, centerYLeft);
                    ctx.lineTo(contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
                }

                ctx.lineTo(contentX, contentY + contentHeight - radius);
                ctx.quadraticCurveTo(contentX, contentY + contentHeight, contentX + radius, contentY + contentHeight);
                ctx.lineTo(contentX + contentWidth - radius, contentY + contentHeight);
                ctx.quadraticCurveTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth, contentY + contentHeight - radius);
                ctx.lineTo(contentX + contentWidth, contentY + radius);
                ctx.quadraticCurveTo(contentX + contentWidth, contentY, contentX + contentWidth - radius, contentY);
                ctx.lineTo(contentX + radius, contentY);
                ctx.quadraticCurveTo(contentX, contentY, contentX, contentY + radius);
                ctx.lineTo(contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
                break;
            }
            case "right": {
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
                break;
            }
            default:
                // Unknown direction, draw regular rounded rect
                this._createRoundedRectPath(ctx, contentX, contentY, contentWidth, contentHeight, radius);
                break;
        }
    }

    // Helper method to create counter-clockwise speech bubble path (for holes)
    private _createSpeechBubblePathCCW(ctx: CanvasRenderingContext2D, contentX: number, contentY: number,
        contentWidth: number, contentHeight: number, radius: number,
        pointerWidth: number, pointerHeight: number, pointerOffset: number,
        direction: string, curved: boolean): void {
        switch (direction) {
            case "bottom": {
                // Start from bottom-left, go counter-clockwise
                ctx.lineTo(contentX + radius, contentY + contentHeight);
                ctx.arcTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius, radius);
                ctx.lineTo(contentX, contentY + radius);
                ctx.arcTo(contentX, contentY, contentX + radius, contentY, radius);
                ctx.lineTo(contentX + contentWidth - radius, contentY);
                ctx.arcTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius, radius);
                ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
                ctx.arcTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight, radius);

                // Pointer part (reversed)
                const centerX = contentX + (contentWidth / 2) + pointerOffset;
                ctx.lineTo(Math.min(centerX + (pointerWidth / 2), contentX + contentWidth - radius), contentY + contentHeight);
                if (curved) {
                    ctx.quadraticCurveTo(centerX, contentY + contentHeight + pointerHeight, Math.max(centerX - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
                } else {
                    ctx.lineTo(centerX, contentY + contentHeight + pointerHeight);
                    ctx.lineTo(Math.max(centerX - (pointerWidth / 2), contentX + radius), contentY + contentHeight);
                }

                ctx.lineTo(contentX + radius, contentY + contentHeight);
                break;
            }
            case "top": {
                // Start from top-right, go counter-clockwise
                const centerXTop = contentX + (contentWidth / 2) + pointerOffset;
                ctx.lineTo(Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
                ctx.lineTo(contentX + contentWidth - radius, contentY);
                ctx.arcTo(contentX + contentWidth, contentY, contentX + contentWidth, contentY + radius, radius);
                ctx.lineTo(contentX + contentWidth, contentY + contentHeight - radius);
                ctx.arcTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth - radius, contentY + contentHeight, radius);
                ctx.lineTo(contentX + radius, contentY + contentHeight);
                ctx.arcTo(contentX, contentY + contentHeight, contentX, contentY + contentHeight - radius, radius);
                ctx.lineTo(contentX, contentY + radius);
                ctx.arcTo(contentX, contentY, contentX + radius, contentY, radius);

                // Pointer part
                ctx.lineTo(Math.max(centerXTop - (pointerWidth / 2), contentX + radius), contentY);
                if (curved) {
                    ctx.quadraticCurveTo(centerXTop, contentY - pointerHeight, Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
                } else {
                    ctx.lineTo(centerXTop, contentY - pointerHeight);
                    ctx.lineTo(Math.min(centerXTop + (pointerWidth / 2), contentX + contentWidth - radius), contentY);
                }

                break;
            }
            case "left": {
                // Similar pattern for left
                const centerYLeft = contentY + (contentHeight / 2) + pointerOffset;
                ctx.lineTo(contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
                ctx.lineTo(contentX, contentY + contentHeight - radius);
                ctx.arcTo(contentX, contentY + contentHeight, contentX + radius, contentY + contentHeight, radius);
                ctx.lineTo(contentX + contentWidth - radius, contentY + contentHeight);
                ctx.arcTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth, contentY + contentHeight - radius, radius);
                ctx.lineTo(contentX + contentWidth, contentY + radius);
                ctx.arcTo(contentX + contentWidth, contentY, contentX + contentWidth - radius, contentY, radius);
                ctx.lineTo(contentX + radius, contentY);
                ctx.arcTo(contentX, contentY, contentX, contentY + radius, radius);
                ctx.lineTo(contentX, Math.max(centerYLeft - (pointerWidth / 2), contentY + radius));
                if (curved) {
                    ctx.quadraticCurveTo(contentX - pointerHeight, centerYLeft, contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
                } else {
                    ctx.lineTo(contentX - pointerHeight, centerYLeft);
                    ctx.lineTo(contentX, Math.min(centerYLeft + (pointerWidth / 2), contentY + contentHeight - radius));
                }

                break;
            }
            case "right": {
                // Similar pattern for right
                const centerYRight = contentY + (contentHeight / 2) + pointerOffset;
                ctx.lineTo(contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
                ctx.lineTo(contentX + contentWidth, contentY + radius);
                ctx.arcTo(contentX + contentWidth, contentY, contentX + contentWidth - radius, contentY, radius);
                ctx.lineTo(contentX + radius, contentY);
                ctx.arcTo(contentX, contentY, contentX, contentY + radius, radius);
                ctx.lineTo(contentX, contentY + contentHeight - radius);
                ctx.arcTo(contentX, contentY + contentHeight, contentX + radius, contentY + contentHeight, radius);
                ctx.lineTo(contentX + contentWidth - radius, contentY + contentHeight);
                ctx.arcTo(contentX + contentWidth, contentY + contentHeight, contentX + contentWidth, contentY + contentHeight - radius, radius);
                ctx.lineTo(contentX + contentWidth, Math.min(centerYRight + (pointerWidth / 2), contentY + contentHeight - radius));
                if (curved) {
                    ctx.quadraticCurveTo(contentX + contentWidth + pointerHeight, centerYRight, contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
                } else {
                    ctx.lineTo(contentX + contentWidth + pointerHeight, centerYRight);
                    ctx.lineTo(contentX + contentWidth, Math.max(centerYRight - (pointerWidth / 2), contentY + radius));
                }

                break;
            }
            default:
                // Unknown direction, don't draw anything
                break;
        }
    }

    private _drawRichText(ctx: CanvasRenderingContext2D): void {
        // Calculate text position relative to content area
        const bgPadding = this.options.backgroundPadding;
        let currentY = this.contentArea.y + this.options.marginTop + bgPadding;

        // Add extra offset for text outline
        if (this.options.textOutline) {
            currentY += this.options.textOutlineWidth;
        }

        for (const lineSegments of this.parsedContent) {
            let lineHeight = 0;

            // Calculate line height
            for (const segment of lineSegments) {
                lineHeight = Math.max(lineHeight, segment.style.size);
            }

            // Calculate starting X based on alignment
            let totalWidth = 0;
            for (const segment of lineSegments) {
                const {style} = segment;
                ctx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
                totalWidth += ctx.measureText(segment.text).width;
            }

            let startX: number;
            const contentLeft = this.contentArea.x + this.options.marginLeft + bgPadding;
            const contentRight = this.contentArea.x + this.contentArea.width - this.options.marginRight - bgPadding;
            const contentCenter = this.contentArea.x + (this.contentArea.width / 2);

            switch (this.options.textAlign) {
                case "left":
                    startX = contentLeft;
                    if (this.options.textOutline) {
                        startX += this.options.textOutlineWidth;
                    }

                    break;
                case "right":
                    startX = contentRight - totalWidth;
                    if (this.options.textOutline) {
                        startX -= this.options.textOutlineWidth;
                    }

                    break;
                case "center":
                default:
                    startX = contentCenter - (totalWidth / 2);
                    break;
            }

            // Draw each segment with effects
            let currentX = startX;
            for (const segment of lineSegments) {
                const {style} = segment;

                // Set font
                ctx.font = `${style.style} ${style.weight} ${style.size}px ${style.font}`;
                ctx.textBaseline = "top";

                // Draw background if specified
                if (style.background) {
                    const metrics = ctx.measureText(segment.text);
                    ctx.fillStyle = style.background;
                    ctx.fillRect(currentX, currentY, metrics.width, lineHeight);
                }

                // Draw text shadow if enabled
                if (this.options.textShadow) {
                    ctx.save();
                    ctx.shadowColor = this.options.textShadowColor;
                    ctx.shadowBlur = this.options.textShadowBlur;
                    ctx.shadowOffsetX = this.options.textShadowOffsetX;
                    ctx.shadowOffsetY = this.options.textShadowOffsetY;
                    ctx.fillStyle = style.color;
                    ctx.fillText(segment.text, currentX, currentY);
                    ctx.restore();
                }

                // Draw text outline if enabled
                if (this.options.textOutline) {
                    ctx.save();
                    ctx.strokeStyle = this.options.textOutlineColor;
                    ctx.lineWidth = this.options.textOutlineWidth * 2;
                    ctx.lineJoin = this.options.textOutlineJoin;
                    ctx.miterLimit = 2;
                    ctx.strokeText(segment.text, currentX, currentY);
                    ctx.restore();
                }

                // Draw text fill
                ctx.fillStyle = style.color;
                ctx.fillText(segment.text, currentX, currentY);

                currentX += ctx.measureText(segment.text).width;
            }

            currentY += lineHeight * this.options.lineHeight;
        }
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
        // Scale plane size based on fontSize to make it proportional
        // Use a base fontSize of 48 (the default) as reference
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
        } else if (target && "getBoundingInfo" in target) {
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

        // Get the actual dimensions of the label mesh
        // The mesh is created with scaled dimensions based on fontSize
        const sizeScale = this.options.fontSize / 48;
        const labelWidth = (this.actualDimensions.width / this.actualDimensions.height) * sizeScale;
        const labelHeight = sizeScale;

        const newPos = targetPos.clone();

        // If pointer is auto, calculate direction
        if (this.options.pointer && this.options.pointerDirection === "auto" && this.pointerInfo) {
            // Determine best pointer direction based on attachment position
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

            // Recalculate dimensions with correct pointer direction
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
                // Position the label so its right edge is offset distance from the node's left edge
                newPos.x = bounds.min.x - (labelWidth / 2) - offset;
                newPos.y = (bounds.min.y + bounds.max.y) / 2;
                break;
            case "center":
                newPos.x = (bounds.min.x + bounds.max.x) / 2;
                newPos.y = (bounds.min.y + bounds.max.y) / 2;
                break;
            case "right":
                // Position the label so its left edge is offset distance from the node's right edge
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
                newPos.x = (bounds.min.x + bounds.max.x) / 2;
                newPos.y = bounds.max.y + (labelHeight / 2) + offset;
        }

        this.mesh.position = newPos;

        // Store original position for animations
        this.originalPosition ??= newPos.clone();
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

    private _setupAnimation(): void {
        this.scene.registerBeforeRender(() => {
            if (!this.mesh) {
                return;
            }

            this.animationTime += 0.016 * this.options.animationSpeed;

            switch (this.options.animation) {
                case "pulse": {
                    const scale = 1 + (Math.sin(this.animationTime * 3) * 0.1);
                    this.mesh.scaling.x = scale;
                    this.mesh.scaling.y = scale;
                    break;
                }
                case "bounce": {
                    if (this.originalPosition) {
                        const bounce = Math.abs(Math.sin(this.animationTime * 2)) * 0.3;
                        this.mesh.position.y = this.originalPosition.y + bounce;
                    }

                    break;
                }
                case "shake": {
                    if (this.originalPosition) {
                        const shakeX = Math.sin(this.animationTime * 20) * 0.02;
                        const shakeY = Math.cos(this.animationTime * 25) * 0.02;
                        this.mesh.position.x = this.originalPosition.x + shakeX;
                        this.mesh.position.y = this.originalPosition.y + shakeY;
                    }

                    break;
                }
                case "glow": {
                    const glow = 0.8 + (Math.sin(this.animationTime * 2) * 0.2);
                    if (this.material) {
                        this.material.emissiveColor = new Color3(glow, glow, glow);
                    }

                    break;
                }
                case "fill": {
                    if (this.options._progressBar) {
                        this._progressValue = (Math.sin(this.animationTime) + 1) / 2;
                        this._drawContent();
                    }

                    break;
                }
                default:
                    // No animation or unknown animation type
                    break;
            }
        });
    }

    // Public methods
    public setText(text: string): void {
        this.options.text = text;
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

    // Getters
    public get labelMesh(): Mesh | null {
        return this.mesh;
    }

    public get labelId(): string {
        return this.id;
    }
}
