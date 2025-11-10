// WORKAROUND: Import InstancedMesh side-effect first
// See: https://github.com/graphty-org/graphty-element/issues/54
import "@babylonjs/core/Meshes/instancedMesh";

import {InstancedMesh, Mesh} from "@babylonjs/core";

import type {NodeStyleId} from "../Styles";

type MeshCreatorFn = () => Mesh;

export class MeshCache {
    meshCacheMap = new Map<string | NodeStyleId, Mesh>();
    hits = 0;
    misses = 0;

    get(name: string | NodeStyleId, creator: MeshCreatorFn): InstancedMesh {
        let mesh = this.meshCacheMap.get(name);
        if (mesh) {
            this.hits++;
            return mesh.createInstance(`${name}`);
        }

        this.misses++;
        mesh = creator();
        // Hide the original mesh - instances will still be visible
        mesh.isVisible = false;
        mesh.position.set(0, -10000, 0);
        mesh.freezeWorldMatrix();
        this.meshCacheMap.set(name, mesh);
        return mesh.createInstance(`${name}`);
    }

    reset(): void {
        this.hits = 0;
        this.misses = 0;
    }

    clear(): void {
        for (const mesh of this.meshCacheMap.values()) {
            mesh.dispose();
        }
        this.meshCacheMap.clear();
        this.reset();
    }

    size(): number {
        return this.meshCacheMap.size;
    }
}
