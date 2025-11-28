import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

const meta: Meta = {
    title: "Algorithms/Palette Picker",
};
export default meta;

type Story = StoryObj;

/**
 * Interactive Palette Picker
 * Visual catalog of all available color palettes used by algorithm visualizations
 */
export const PalettePicker: Story = {
    render: () => html`
        <style>
            .palette-picker {
                font-family: system-ui, sans-serif;
                padding: 20px;
                background: #f5f5f5;
            }
            .palette-category {
                margin-bottom: 30px;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .palette-category h2 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 18px;
            }
            .palette-row {
                margin-bottom: 20px;
            }
            .palette-name {
                font-weight: 600;
                margin-bottom: 8px;
                color: #555;
                font-size: 14px;
            }
            .palette-description {
                font-size: 12px;
                color: #777;
                margin-bottom: 8px;
            }
            .color-swatches {
                display: flex;
                gap: 4px;
                height: 40px;
            }
            .color-swatch {
                flex: 1;
                border-radius: 4px;
                border: 1px solid rgba(0, 0, 0, 0.1);
                position: relative;
                transition: transform 0.2s;
            }
            .color-swatch:hover {
                transform: scale(1.1);
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            .color-swatch::after {
                content: attr(data-color);
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: #999;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .color-swatch:hover::after {
                opacity: 1;
            }
            .accessibility-badge {
                display: inline-block;
                background: #28a745;
                color: white;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 3px;
                margin-left: 8px;
            }
        </style>
        <div class="palette-picker">
            <h1>StyleHelpers Palette Picker</h1>

            <!-- Sequential Gradients -->
            <div class="palette-category">
                <h2>Sequential Gradients (Continuous Data)</h2>

                <div class="palette-row">
                    <div class="palette-name">
                        Viridis <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">
                        Purple → Yellow | Default for continuous data
                    </div>
                    <div class="color-swatches" id="seq-viridis"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">
                        Plasma <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">Blue → Pink → Yellow | Warmer alternative</div>
                    <div class="color-swatches" id="seq-plasma"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">
                        Inferno <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">Black → Red → Yellow | Dark, dramatic</div>
                    <div class="color-swatches" id="seq-inferno"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Blues</div>
                    <div class="palette-description">Light Blue → Dark Blue | Cooler aesthetic</div>
                    <div class="color-swatches" id="seq-blues"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Greens</div>
                    <div class="palette-description">Light Green → Dark Green | Growth metrics</div>
                    <div class="color-swatches" id="seq-greens"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Oranges</div>
                    <div class="palette-description">Light Orange → Dark Orange | Heat, energy</div>
                    <div class="color-swatches" id="seq-oranges"></div>
                </div>
            </div>

            <!-- Categorical Palettes -->
            <div class="palette-category">
                <h2>Categorical Palettes (Discrete Groups)</h2>

                <div class="palette-row">
                    <div class="palette-name">
                        Okabe-Ito <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">8 colors | R 4.0+ default, universally safe</div>
                    <div class="color-swatches" id="cat-okabe"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">
                        Paul Tol Vibrant <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">7 colors | High saturation</div>
                    <div class="color-swatches" id="cat-tol-vibrant"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">
                        Paul Tol Muted <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">9 colors | Softer aesthetic</div>
                    <div class="color-swatches" id="cat-tol-muted"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">IBM Carbon</div>
                    <div class="palette-description">5 colors | Modern enterprise design</div>
                    <div class="color-swatches" id="cat-carbon"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Pastel</div>
                    <div class="palette-description">
                        8 colors | Softer, derived from Okabe-Ito
                    </div>
                    <div class="color-swatches" id="cat-pastel"></div>
                </div>
            </div>

            <!-- Diverging Gradients -->
            <div class="palette-category">
                <h2>Diverging Gradients (Above/Below Average)</h2>

                <div class="palette-row">
                    <div class="palette-name">
                        Purple-Green <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">
                        Purple ← White → Green | No red-green confusion
                    </div>
                    <div class="color-swatches" id="div-purple-green"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">
                        Blue-Orange <span class="accessibility-badge">✓ Colorblind Safe</span>
                    </div>
                    <div class="palette-description">Blue ← White → Orange | High contrast</div>
                    <div class="color-swatches" id="div-blue-orange"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Red-Blue ⚠️</div>
                    <div class="palette-description">
                        Red ← White → Blue | Use only for temperature
                    </div>
                    <div class="color-swatches" id="div-red-blue"></div>
                </div>
            </div>

            <!-- Binary Highlights -->
            <div class="palette-category">
                <h2>Binary Highlights (True/False States)</h2>

                <div class="palette-row">
                    <div class="palette-name">Blue Highlight</div>
                    <div class="palette-description">Blue vs Gray | Default for paths/selection</div>
                    <div class="color-swatches" id="bin-blue"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Green Success</div>
                    <div class="palette-description">Green vs Gray | Success states</div>
                    <div class="color-swatches" id="bin-green"></div>
                </div>

                <div class="palette-row">
                    <div class="palette-name">Orange Warning</div>
                    <div class="palette-description">Orange vs Gray | Warnings/attention</div>
                    <div class="color-swatches" id="bin-orange"></div>
                </div>
            </div>
        </div>

        <script type="module">
            import {StyleHelpers} from "../../src/config/StyleHelpers.js";

            // Sequential gradients
            const renderSequential = (containerId, fn, steps = 20) => {
                const container = document.getElementById(containerId);
                for (let i = 0; i < steps; i++) {
                    const value = i / (steps - 1);
                    const color = fn(value);
                    const swatch = document.createElement("div");
                    swatch.className = "color-swatch";
                    swatch.style.backgroundColor = color;
                    swatch.setAttribute("data-color", color);
                    container.appendChild(swatch);
                }
            };

            renderSequential("seq-viridis", StyleHelpers.color.sequential.viridis);
            renderSequential("seq-plasma", StyleHelpers.color.sequential.plasma);
            renderSequential("seq-inferno", StyleHelpers.color.sequential.inferno);
            renderSequential("seq-blues", StyleHelpers.color.sequential.blues);
            renderSequential("seq-greens", StyleHelpers.color.sequential.greens);
            renderSequential("seq-oranges", StyleHelpers.color.sequential.oranges);

            // Categorical palettes
            const renderCategorical = (containerId, fn, count) => {
                const container = document.getElementById(containerId);
                for (let i = 0; i < count; i++) {
                    const color = fn(i);
                    const swatch = document.createElement("div");
                    swatch.className = "color-swatch";
                    swatch.style.backgroundColor = color;
                    swatch.setAttribute("data-color", color);
                    container.appendChild(swatch);
                }
            };

            renderCategorical("cat-okabe", StyleHelpers.color.categorical.okabeIto, 8);
            renderCategorical("cat-tol-vibrant", StyleHelpers.color.categorical.tolVibrant, 7);
            renderCategorical("cat-tol-muted", StyleHelpers.color.categorical.tolMuted, 9);
            renderCategorical("cat-carbon", StyleHelpers.color.categorical.carbon, 5);
            renderCategorical("cat-pastel", StyleHelpers.color.categorical.pastel, 8);

            // Diverging gradients
            const renderDiverging = (containerId, fn, steps = 20) => {
                const container = document.getElementById(containerId);
                for (let i = 0; i < steps; i++) {
                    const value = i / (steps - 1);
                    const color = fn(value, 0.5);
                    const swatch = document.createElement("div");
                    swatch.className = "color-swatch";
                    swatch.style.backgroundColor = color;
                    swatch.setAttribute("data-color", color);
                    container.appendChild(swatch);
                }
            };

            renderDiverging("div-purple-green", StyleHelpers.color.diverging.purpleGreen);
            renderDiverging("div-blue-orange", StyleHelpers.color.diverging.blueOrange);
            renderDiverging("div-red-blue", StyleHelpers.color.diverging.redBlue);

            // Binary highlights
            const renderBinary = (containerId, fn) => {
                const container = document.getElementById(containerId);
                [false, true].forEach((state) => {
                    const color = fn(state);
                    const swatch = document.createElement("div");
                    swatch.className = "color-swatch";
                    swatch.style.backgroundColor = color;
                    swatch.setAttribute("data-color", color);
                    swatch.style.flex = "0 0 48%";
                    container.appendChild(swatch);
                });
            };

            renderBinary("bin-blue", StyleHelpers.color.binary.blueHighlight);
            renderBinary("bin-green", StyleHelpers.color.binary.greenSuccess);
            renderBinary("bin-orange", StyleHelpers.color.binary.orangeWarning);
        </script>
    `,
};
