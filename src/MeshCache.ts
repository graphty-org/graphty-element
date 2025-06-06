import {InstancedMesh, Mesh} from "@babylonjs/core";

type MeshCreatorFn = () => Mesh;

export class MeshCache {
    meshCacheMap: Map<string, Mesh> = new Map();
    hits = 0;
    misses = 0;

    get(name: string, creator: MeshCreatorFn): InstancedMesh {
        let mesh = this.meshCacheMap.get(name);
        if (mesh) {
            this.hits++;
            return mesh.createInstance(name);
        }

        this.misses++;
        mesh = creator();
        mesh.isVisible = false;
        this.meshCacheMap.set(name, mesh);
        return mesh.createInstance(name);
    }

    reset(): void {
        this.hits = 0;
        this.misses = 0;
    }
}
