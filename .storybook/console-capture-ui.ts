// Console capture with floating UI button
interface LogEntry {
    type: string;
    args: any[];
    timestamp: string;
}

export class ConsoleCaptureUI {
    private logs: LogEntry[] = [];
    private originalMethods: Record<string, Function> = {};
    private button: HTMLElement | null = null;

    constructor() {
        this.intercept();
        this.createUI();
        this.exposeGlobalMethods();
    }

    private intercept(): void {
        const methods = ["log", "info", "warn", "error", "debug"] as const;

        methods.forEach((method) => {
            this.originalMethods[method] = console[method];

            (console as any)[method] = (... args: any[]) => {
                this.logs.push({
                    type: method,
                    args: args,
                    timestamp: new Date().toISOString(),
                });

                this.updateButtonBadge();
                this.originalMethods[method].apply(console, args);
            };
        });
    }

    private createUI(): void {
        // Create floating button
        this.button = document.createElement("div");
        this.button.innerHTML = `
            <button id="console-capture-btn" style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 32px;
                height: 32px;
                border-radius: 16px;
                background: rgba(128, 128, 128, 0.3);
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
                box-shadow: 0 1px 4px rgba(0,0,0,0.1);
                z-index: 99999;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                opacity: 0.6;
            ">📋</button>
            <div id="console-capture-menu" style="
                position: fixed;
                top: 60px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 20px rgba(0,0,0,0.2);
                padding: 10px;
                z-index: 99998;
                display: none;
            ">
                <button id="cc-copy" style="
                    display: block;
                    width: 100%;
                    padding: 8px 16px;
                    margin: 4px 0;
                    border: none;
                    background: #4CAF50;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">📋 Copy Logs</button>
                <button id="cc-download" style="
                    display: block;
                    width: 100%;
                    padding: 8px 16px;
                    margin: 4px 0;
                    border: none;
                    background: #FF9800;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">💾 Download</button>
                <button id="cc-clear" style="
                    display: block;
                    width: 100%;
                    padding: 8px 16px;
                    margin: 4px 0;
                    border: none;
                    background: #f44336;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">🗑️ Clear</button>
                <button id="cc-show" style="
                    display: block;
                    width: 100%;
                    padding: 8px 16px;
                    margin: 4px 0;
                    border: none;
                    background: #9C27B0;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">👁️ Show Logs</button>
                <div style="
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                ">
                    <div>Logs: <span id="cc-count">0</span></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.button);

        // Add event listeners
        const btn = document.getElementById("console-capture-btn")!;
        const menu = document.getElementById("console-capture-menu")!;

        // Add hover effect to make button more visible on hover
        btn.addEventListener("mouseenter", () => {
            btn.style.opacity = "1";
            btn.style.background = "rgba(128, 128, 128, 0.5)";
        });

        btn.addEventListener("mouseleave", () => {
            btn.style.opacity = "0.6";
            btn.style.background = "rgba(128, 128, 128, 0.3)";
        });

        btn.addEventListener("click", () => {
            menu.style.display = menu.style.display === "none" ? "block" : "none";
        });

        document.getElementById("cc-copy")!.addEventListener("click", () => {
            this.copyLogs();
            menu.style.display = "none";
        });

        document.getElementById("cc-download")!.addEventListener("click", () => {
            this.downloadLogs();
            menu.style.display = "none";
        });

        document.getElementById("cc-clear")!.addEventListener("click", () => {
            this.clearLogs();
            menu.style.display = "none";
        });

        document.getElementById("cc-show")!.addEventListener("click", () => {
            this.showLogsModal();
            menu.style.display = "none";
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!this.button?.contains(e.target as Node)) {
                menu.style.display = "none";
            }
        });
    }

    private updateButtonBadge(): void {
        // Only update the count in the menu, not the badge
        const count = document.getElementById("cc-count");

        if (count) {
            count.textContent = String(this.logs.length);
        }
    }

    private formatLog(log: LogEntry): string {
        const args = log.args.map((arg) => {
            if (typeof arg === "object") {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return String(arg);
                }
            }

            return String(arg);
        }).join(" ");

        return `[${log.timestamp}] [${log.type.toUpperCase()}] ${args}`;
    }

    getLogs(): string {
        return this.logs.map((log) => this.formatLog(log)).join("\n");
    }

    clearLogs(): void {
        this.logs = [];
        this.updateButtonBadge();
        console.log("🗑️ Console logs cleared");
    }

    async copyLogs(): Promise<void> {
        const text = this.getLogs();

        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                this.showCopySuccess();
            } else {
                // Fallback method using textarea
                this.copyUsingTextarea(text);
            }
        } catch (err) {
            // If modern API fails, try fallback
            console.warn("Clipboard API failed, using fallback:", err);
            this.copyUsingTextarea(text);
        }
    }

    private copyUsingTextarea(text: string): void {
        // Create temporary textarea
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText = "position: absolute; left: -9999px; top: -9999px;";
        document.body.appendChild(textarea);

        // Select and copy
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        try {
            const success = document.execCommand("copy");
            if (success) {
                this.showCopySuccess();
            } else {
                this.showCopyError();
            }
        } catch (err) {
            this.showCopyError();
            console.error("Failed to copy logs:", err);
        } finally {
            document.body.removeChild(textarea);
        }
    }

    private showCopySuccess(): void {
        const btn = document.getElementById("console-capture-btn")!;
        btn.innerHTML = "✅";
        setTimeout(() => {
            btn.innerHTML = "📋";
        }, 1500);
        console.log("📋 Console logs copied to clipboard!");
    }

    private showCopyError(): void {
        const btn = document.getElementById("console-capture-btn")!;
        btn.innerHTML = "❌";
        setTimeout(() => {
            btn.innerHTML = "📋";
        }, 1500);

        // Show logs in console as fallback
        console.log("❌ Failed to copy to clipboard. Here are your logs:");
        console.log("═".repeat(50));
        console.log(this.getLogs());
        console.log("═".repeat(50));
    }

    private showLogsModal(): void {
        // Remove existing modal if any
        const existing = document.getElementById("console-logs-modal");
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement("div");
        modal.id = "console-logs-modal";
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 100001;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 800px;
                    height: 85vh;
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                ">
                    <div style="
                        padding: 16px;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <h3 style="margin: 0; color: #333;">Console Logs</h3>
                        <button id="close-modal" style="
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                            color: #666;
                        ">×</button>
                    </div>
                    <textarea id="logs-textarea" style="
                        flex: 1;
                        margin: 16px;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 12px;
                        resize: none;
                        background: #f5f5f5;
                        min-height: 50vh;
                        overflow-y: auto;
                    " readonly>${this.getLogs()}</textarea>
                    <div style="
                        padding: 16px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                    ">
                        <button id="select-all-logs" style="
                            padding: 8px 24px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Select All</button>
                        <span style="
                            margin-left: 16px;
                            color: #666;
                            font-size: 14px;
                        ">Press Ctrl+C (or Cmd+C) to copy</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById("close-modal")!.addEventListener("click", () => {
            modal.remove();
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal.firstElementChild) {
                modal.remove();
            }
        });

        const textarea = document.getElementById("logs-textarea") as HTMLTextAreaElement;
        document.getElementById("select-all-logs")!.addEventListener("click", () => {
            textarea.select();
            textarea.focus();
        });

        // Auto-select on open
        setTimeout(() => {
            textarea.select();
            textarea.focus();
        }, 100);
    }

    downloadLogs(): void {
        const text = this.getLogs();
        const blob = new Blob([text], {type: "text/plain"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `console-logs-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("💾 Console logs downloaded!");
    }

    private exposeGlobalMethods(): void {
        (window as any).__console__ = {
            copy: () => this.copyLogs(),
            download: () => {
                this.downloadLogs();
            },
            get: () => this.getLogs(),
            clear: () => {
                this.clearLogs();
            },
            logs: this.logs,
        };
    }
}

export function initConsoleCaptureUI(): void {
    new ConsoleCaptureUI();
}
