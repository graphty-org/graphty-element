import {
    EngineInstrumentation,
    PerfCounter,
    SceneInstrumentation,
} from "@babylonjs/core";

import type {Graph} from "./Graph";

/**
 * @deprecated Use StatsManager instead. This class is maintained for backward compatibility.
 */
export class Stats {
    graph: Graph;
    sceneInstrumentation: SceneInstrumentation;
    babylonInstrumentation: EngineInstrumentation;

    // These are now references to the StatsManager's counters
    get graphStep(): PerfCounter {
        return this.graph.getStatsManager().graphStep;
    }
    get nodeUpdate(): PerfCounter {
        return this.graph.getStatsManager().nodeUpdate;
    }
    get edgeUpdate(): PerfCounter {
        return this.graph.getStatsManager().edgeUpdate;
    }
    get arrowCapUpdate(): PerfCounter {
        return this.graph.getStatsManager().arrowCapUpdate;
    }
    get intersectCalc(): PerfCounter {
        return this.graph.getStatsManager().intersectCalc;
    }
    get loadTime(): PerfCounter {
        return this.graph.getStatsManager().loadTime;
    }
    get totalUpdates(): number {
        return this.graph.getStatsManager().totalUpdates;
    }
    set totalUpdates(value: number) {
        this.graph.getStatsManager().totalUpdates = value;
    }

    constructor(g: Graph) {
        this.graph = g;

        // Get instrumentation from StatsManager
        const statsManager = g.getStatsManager();
        this.sceneInstrumentation = (statsManager as any).sceneInstrumentation;
        this.babylonInstrumentation = (statsManager as any).babylonInstrumentation;
    }

    toString(): string {
        // Delegate to StatsManager
        return this.graph.getStatsManager().toString();
    }

    step(): void {
        // Delegate to StatsManager
        this.graph.getStatsManager().step();
    }

    reset(): void {
        // Delegate to StatsManager
        this.graph.getStatsManager().reset();
    }

    get numNodes(): number {
        return this.graph.nodeCache.size;
    }

    get numEdges(): number {
        return this.graph.edgeCache.size;
    }

    get meshCacheHits(): number {
        return this.graph.meshCache.hits;
    }

    get meshCacheMisses(): number {
        return this.graph.meshCache.misses;
    }
}
