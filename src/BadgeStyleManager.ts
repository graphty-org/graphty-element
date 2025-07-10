import type {BadgeType, RichTextLabelOptions} from "./RichTextLabel.ts";

const BADGE_STYLES: Record<Exclude<BadgeType, undefined>, Partial<RichTextLabelOptions>> = {
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
        _smartSizing: true,
        _paddingRatio: 1.0,
        _removeText: true,
    },
};

export const BadgeStyleManager = {
    getBadgeStyle(badgeType: BadgeType): Partial<RichTextLabelOptions> | undefined {
        if (!badgeType) {
            return undefined;
        }

        return BADGE_STYLES[badgeType];
    },

    applyBadgeBehaviors(
        options: RichTextLabelOptions,
        userOptions: RichTextLabelOptions,
    ): void {
        const badgeType = options._badgeType;

        if (options._paddingRatio && !userOptions.marginTop) {
            const padding = (options.fontSize ?? 48) * options._paddingRatio;
            options.marginTop = options.marginBottom = padding;
            options.marginLeft = options.marginRight = padding;
        }

        switch (badgeType) {
            case "notification":
            case "count":
                BadgeStyleManager.applySmartOverflow(options, userOptions);
                break;
            case "dot":
                if (options._removeText) {
                    options.text = "";
                }

                break;
            case "icon":
                BadgeStyleManager.applyIconBehavior(options, userOptions);
                break;
            default:
                break;
        }
    },

    applySmartOverflow(
        options: RichTextLabelOptions,
        userOptions: RichTextLabelOptions,
    ): void {
        if (options.smartOverflow && !isNaN(Number(userOptions.text))) {
            const num = parseInt(userOptions.text ?? "0");
            const maxNumber = options.maxNumber ?? 999;
            const overflowSuffix = options.overflowSuffix ?? "+";

            if (num > maxNumber) {
                if (num >= 1000) {
                    options.text = `${Math.floor(num / 1000)}k`;
                } else {
                    options.text = `${maxNumber}${overflowSuffix}`;
                }
            }
        }
    },

    applyIconBehavior(
        options: RichTextLabelOptions,
        userOptions: RichTextLabelOptions,
    ): void {
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
    },
};

