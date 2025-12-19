import {Axis, Quaternion, type Scene, Space, TransformNode, Vector3} from "@babylonjs/core";

/**
 * PivotController manages a TransformNode that serves as the pivot point for camera operations.
 * This is a shared abstraction used by both 3D (OrbitCameraController) and XR (XRPivotCameraController)
 * camera systems.
 *
 * The pivot supports:
 * - Rotation (yaw/pitch via rotate(), arbitrary axis via rotateAroundAxis())
 * - Spin (Z-axis rotation)
 * - Zoom (via uniform scaling)
 * - Pan (translation)
 */
export class PivotController {
    public readonly pivot: TransformNode;

    // Track accumulated rotations for view-relative calculations
    private accumulatedYaw = 0;
    private accumulatedPitch = 0;

    // Frame counter for throttled logging
    private frameCount = 0;

    constructor(scene: Scene) {
        this.pivot = new TransformNode("xrPivot", scene);
        this.pivot.position = Vector3.Zero();
        this.pivot.rotationQuaternion = Quaternion.Identity();
        // Debug: console.log("🔧 [PivotController] Created pivot node");
    }

    /**
     * Rotate the pivot by yaw (Y-axis) and pitch (X-axis) deltas.
     * Uses local space rotation.
     *
     * @param yawDelta - Rotation around Y-axis in radians
     * @param pitchDelta - Rotation around X-axis in radians
     */
    rotate(yawDelta: number, pitchDelta: number): void {
        this.frameCount++;

        const hasYaw = Math.abs(yawDelta) > 0.0001;
        const hasPitch = Math.abs(pitchDelta) > 0.0001;

        if (!hasYaw && !hasPitch) {
            return;
        }

        // Track accumulated rotations for display purposes
        this.accumulatedYaw += yawDelta;
        this.accumulatedPitch += pitchDelta;

        if (hasYaw) {
            this.pivot.rotate(Axis.Y, yawDelta, Space.LOCAL);
        }

        if (hasPitch) {
            this.pivot.rotate(Axis.X, pitchDelta, Space.LOCAL);
        }

        // Debug logging (throttled)
        // if (this.frameCount % 30 === 0) {
        //     console.log("🔧 [Pivot] Rotate:", {
        //         yawDelta: `${((yawDelta * 180) / Math.PI).toFixed(2)}°`,
        //         pitchDelta: `${((pitchDelta * 180) / Math.PI).toFixed(2)}°`,
        //         accYaw: `${((this.accumulatedYaw * 180) / Math.PI).toFixed(1)}°`,
        //         accPitch: `${((this.accumulatedPitch * 180) / Math.PI).toFixed(1)}°`,
        //     });
        // }
    }

    /**
     * Rotate the pivot around an arbitrary axis.
     * Used for two-hand gesture rotation in XR.
     *
     * @param axis - The axis to rotate around (will be normalized)
     * @param angle - The rotation angle in radians
     */
    rotateAroundAxis(axis: Vector3, angle: number): void {
        if (Math.abs(angle) < 0.0001 || axis.length() < 0.0001) {
            return;
        }

        const normalizedAxis = axis.normalize();
        const currentRotation = this.pivot.rotationQuaternion ?? Quaternion.Identity();
        const rotationQuat = Quaternion.RotationAxis(normalizedAxis, angle);
        this.pivot.rotationQuaternion = rotationQuat.multiply(currentRotation);

        // Debug logging (throttled)
        // if (this.frameCount % 30 === 0) {
        //     console.log("🔧 [Pivot] RotateAroundAxis:", {
        //         axis: `(${normalizedAxis.x.toFixed(2)}, ${normalizedAxis.y.toFixed(2)}, ${normalizedAxis.z.toFixed(2)})`,
        //         angle: `${((angle * 180) / Math.PI).toFixed(2)}°`,
        //     });
        // }
    }

    /**
     * Spin the pivot around the Z-axis (roll).
     *
     * @param delta - The rotation angle in radians
     */
    spin(delta: number): void {
        if (Math.abs(delta) > 0.0001) {
            this.pivot.rotate(Axis.Z, delta, Space.LOCAL);
        }
    }

    /**
     * Zoom by scaling the pivot uniformly.
     * Factor is clamped to prevent extreme zooming.
     *
     * @param factor - Scale factor (> 1 zooms out, < 1 zooms in)
     */
    zoom(factor: number): void {
        const clamped = Math.max(0.95, Math.min(1.05, factor));
        this.pivot.scaling.scaleInPlace(clamped);

        const scale = this.pivot.scaling.x;
        if (scale < 0.1) {
            this.pivot.scaling.setAll(0.1);
        }

        if (scale > 10) {
            this.pivot.scaling.setAll(10);
        }

        // Debug logging (throttled)
        // if (this.frameCount % 30 === 0 && Math.abs(clamped - 1) > 0.001) {
        //     console.log("🔧 [Pivot] Zoom:", {
        //         factor: clamped.toFixed(4),
        //         scale: this.pivot.scaling.x.toFixed(3),
        //     });
        // }
    }

    /**
     * Pan (translate) the pivot by a delta vector.
     *
     * @param delta - The translation vector
     */
    pan(delta: Vector3): void {
        if (delta.length() < 0.0001) {
            return;
        }

        this.pivot.position.addInPlace(delta);

        // Debug logging (throttled)
        // if (this.frameCount % 30 === 0) {
        //     const pos = this.pivot.position;
        //     console.log("🔧 [Pivot] Pan:", {
        //         delta: `(${delta.x.toFixed(3)}, ${delta.y.toFixed(3)}, ${delta.z.toFixed(3)})`,
        //         pos: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`,
        //     });
        // }
    }

    /**
     * Pan relative to the current view direction.
     * Uses accumulated yaw to calculate view-relative movement.
     *
     * @param right - Movement along view's right vector
     * @param forward - Movement along view's forward vector
     */
    panViewRelative(right: number, forward: number): void {
        if (Math.abs(right) < 0.0001 && Math.abs(forward) < 0.0001) {
            return;
        }

        // Calculate view-relative directions using accumulated yaw
        const cosYaw = Math.cos(this.accumulatedYaw);
        const sinYaw = Math.sin(this.accumulatedYaw);

        // Right vector: (cos(yaw), 0, sin(yaw))
        // Forward vector: (-sin(yaw), 0, cos(yaw))
        const worldX = (right * cosYaw) - (forward * sinYaw);
        const worldZ = (right * sinYaw) + (forward * cosYaw);

        this.pan(new Vector3(worldX, 0, worldZ));
    }

    /**
     * Reset the pivot to its initial state:
     * - Position at origin
     * - No rotation
     * - Unit scale
     */
    reset(): void {
        this.pivot.position = Vector3.Zero();
        this.pivot.rotationQuaternion = Quaternion.Identity();
        this.pivot.scaling.setAll(1.0);
        this.accumulatedYaw = 0;
        this.accumulatedPitch = 0;
        // Debug: console.log("🔧 [Pivot] Reset to initial state");
    }
}
