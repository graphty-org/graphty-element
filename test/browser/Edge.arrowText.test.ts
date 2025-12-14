import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import {RichTextLabel} from "../../src/meshes/RichTextLabel";

describe("Arrow Text Labels", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("Arrow Head Text Configuration", () => {
        test("arrow head text can be configured in EdgeStyleConfig", () => {
            const style: EdgeStyleConfig = {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "→",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Access via local variables to satisfy linter
            const {arrowHead} = style;
            assert.exists(arrowHead);
            const {text} = arrowHead;
            assert.exists(text);
            assert.equal(text.text, "→");
            assert.equal(text.fontSize, 12);
        });

        test("arrow head text can be created as RichTextLabel", () => {
            const label = new RichTextLabel(scene, {
                text: "→",
                fontSize: 12,
                textColor: "#FFFFFF",
            });

            assert.exists(label);
            assert.exists(label.labelMesh);
            label.dispose();
        });
    });

    describe("Arrow Tail Text Configuration", () => {
        test("arrow tail text can be configured in EdgeStyleConfig", () => {
            const style: EdgeStyleConfig = {
                arrowTail: {
                    type: "normal",
                    text: {
                        text: "←",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Access via local variables to satisfy linter
            const {arrowTail} = style;
            assert.exists(arrowTail);
            const {text} = arrowTail;
            assert.exists(text);
            assert.equal(text.text, "←");
            assert.equal(text.fontSize, 12);
        });

        test("arrow tail text can be created as RichTextLabel", () => {
            const label = new RichTextLabel(scene, {
                text: "←",
                fontSize: 12,
                textColor: "#FFFFFF",
            });

            assert.exists(label);
            assert.exists(label.labelMesh);
            label.dispose();
        });
    });

    describe("Arrow Text Positioning", () => {
        test("arrow text label can be attached to a position", () => {
            const label = new RichTextLabel(scene, {
                text: "Label",
                fontSize: 12,
                textColor: "#FFFFFF",
            });

            const position = new Vector3(5, 0, 0);
            label.attachTo(position, "top", 0.5);

            assert.exists(label.labelMesh);
            label.dispose();
        });

        test("arrow text label supports different attach positions", () => {
            const positions: ("top" | "bottom" | "left" | "right" | "center")[] = ["top", "bottom", "left", "right", "center"];

            for (const pos of positions) {
                const label = new RichTextLabel(scene, {
                    text: "Test",
                    fontSize: 12,
                });

                const targetPos = new Vector3(0, 0, 0);
                label.attachTo(targetPos, pos, 0.5);

                assert.exists(label.labelMesh);
                label.dispose();
            }
        });
    });

    describe("Arrow Text Styling", () => {
        test("arrow text supports custom font size", () => {
            const fontSizes = [8, 12, 16, 24];

            for (const fontSize of fontSizes) {
                const label = new RichTextLabel(scene, {
                    text: "Test",
                    fontSize,
                });

                assert.exists(label.labelMesh);
                label.dispose();
            }
        });

        test("arrow text supports custom color", () => {
            const label = new RichTextLabel(scene, {
                text: "Colored text",
                fontSize: 12,
                textColor: "#FF0000",
            });

            assert.exists(label.labelMesh);
            label.dispose();
        });

        test("arrow text supports background color", () => {
            const label = new RichTextLabel(scene, {
                text: "With background",
                fontSize: 12,
                textColor: "#FFFFFF",
                backgroundColor: "#333333",
            });

            assert.exists(label.labelMesh);
            label.dispose();
        });
    });

    describe("Bidirectional Arrow Text", () => {
        test("both head and tail text can be configured simultaneously", () => {
            const style: EdgeStyleConfig = {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "Head",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                arrowTail: {
                    type: "normal",
                    text: {
                        text: "Tail",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Access via local variables to satisfy linter
            const {arrowHead, arrowTail} = style;
            assert.exists(arrowHead);
            assert.exists(arrowTail);
            const {text: headText} = arrowHead;
            const {text: tailText} = arrowTail;
            assert.exists(headText);
            assert.exists(tailText);
            assert.equal(headText.text, "Head");
            assert.equal(tailText.text, "Tail");
        });

        test("head and tail labels are independent", () => {
            const headLabel = new RichTextLabel(scene, {
                text: "Head",
                fontSize: 12,
                textColor: "#FF0000",
            });

            const tailLabel = new RichTextLabel(scene, {
                text: "Tail",
                fontSize: 12,
                textColor: "#00FF00",
            });

            assert.exists(headLabel.labelMesh);
            assert.exists(tailLabel.labelMesh);
            assert.notEqual(headLabel.labelId, tailLabel.labelId);

            headLabel.dispose();
            tailLabel.dispose();
        });
    });

    describe("Arrow Text with JMESPath", () => {
        test("arrow text supports textPath configuration", () => {
            const style: EdgeStyleConfig = {
                arrowHead: {
                    type: "normal",
                    text: {
                        textPath: "weight",
                        fontSize: 12,
                    },
                    color: "darkgrey",
                    size: 1,
                    opacity: 1,
                },
                line: {color: "darkgrey"},
                enabled: true,
            };

            // Access via local variables to satisfy linter
            const {arrowHead} = style;
            assert.exists(arrowHead);
            const {text} = arrowHead;
            assert.exists(text);
            assert.equal(text.textPath, "weight");
        });
    });

    describe("Arrow Text Cleanup", () => {
        test("arrow text labels can be disposed", () => {
            const label = new RichTextLabel(scene, {
                text: "Disposable",
                fontSize: 12,
            });

            const mesh = label.labelMesh;
            assert.exists(mesh);

            label.dispose();

            assert.isTrue(mesh.isDisposed());
        });

        test("multiple labels can be disposed independently", () => {
            const headLabel = new RichTextLabel(scene, {
                text: "Head",
                fontSize: 12,
            });

            const tailLabel = new RichTextLabel(scene, {
                text: "Tail",
                fontSize: 12,
            });

            const headMesh = headLabel.labelMesh;
            const tailMesh = tailLabel.labelMesh;
            assert.exists(headMesh);
            assert.exists(tailMesh);

            headLabel.dispose();

            // Head should be disposed
            assert.isTrue(headMesh.isDisposed());

            // Tail should still exist
            assert.isFalse(tailMesh.isDisposed());

            tailLabel.dispose();

            // Both should now be disposed
            assert.isTrue(tailMesh.isDisposed());
        });
    });
});
