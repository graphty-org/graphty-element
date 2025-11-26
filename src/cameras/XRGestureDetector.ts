import { Vector3, Quaternion } from "@babylonjs/core";

export interface HandState {
  position: Vector3;
  rotation: Quaternion;
  pinching: boolean;
  pinchStrength: number;
}

export interface GestureResult {
  type: "none" | "zoom" | "rotate" | "pan";
  zoomDelta?: number;
  rotationAxis?: Vector3;
  rotationAngle?: number;
  panDelta?: Vector3;
}

/**
 * XRGestureDetector
 *
 * Detects advanced two-hand gestures for XR interactions:
 * - Two-hand pinch zoom: Hands moving closer/farther while pinching
 * - Two-hand twist rotation: Hands rotating around their midpoint
 * - Thumbstick pan: Controller thumbstick input for translation
 *
 * Usage:
 * ```typescript
 * const detector = new XRGestureDetector();
 *
 * // Every frame in XR:
 * detector.updateHands(leftHandState, rightHandState);
 * const gesture = detector.getCurrentGesture();
 * if (gesture.type === "zoom") {
 *   applyZoom(gesture.zoomDelta);
 * }
 * ```
 */
export class XRGestureDetector {
  private previousLeftHand: HandState | null = null;
  private previousRightHand: HandState | null = null;
  private previousDistance: number | null = null;
  private previousAngle: number | null = null;

  // Thresholds for gesture detection
  private readonly ZOOM_THRESHOLD = 0.01; // Minimum distance change to trigger zoom
  private readonly ROTATION_THRESHOLD = 0.05; // Minimum angle change to trigger rotation (radians)
  private readonly PAN_SENSITIVITY = 0.1; // Thumbstick to world space scale factor

  /**
   * Update hand states for gesture detection
   * Call this every frame with current hand positions
   *
   * @param leftHand - Left hand state or null if not tracked
   * @param rightHand - Right hand state or null if not tracked
   */
  public updateHands(
    leftHand: HandState | null,
    rightHand: HandState | null
  ): void {
    // Calculate current distance and angle BEFORE updating previous values
    if (leftHand && rightHand && this.previousLeftHand && this.previousRightHand) {
      const distance = Vector3.Distance(leftHand.position, rightHand.position);
      const direction = rightHand.position.subtract(leftHand.position);
      const angle = Math.atan2(direction.y, direction.x);

      // Only update previous values if we have both current and previous hands
      this.previousDistance = Vector3.Distance(
        this.previousLeftHand.position,
        this.previousRightHand.position
      );
      this.previousAngle = Math.atan2(
        this.previousRightHand.position.y - this.previousLeftHand.position.y,
        this.previousRightHand.position.x - this.previousLeftHand.position.x
      );
    } else if (!leftHand || !rightHand) {
      // Reset tracking when hands not available
      this.previousDistance = null;
      this.previousAngle = null;
    }
    // else: First frame with both hands, don't set previous yet

    // Update stored hand states
    this.previousLeftHand = leftHand;
    this.previousRightHand = rightHand;
  }

  /**
   * Get the current gesture based on hand states
   * Returns the highest priority gesture detected
   *
   * Priority order: zoom > rotate > none
   *
   * @returns Current gesture result
   */
  public getCurrentGesture(): GestureResult {
    const left = this.previousLeftHand;
    const right = this.previousRightHand;

    // Require both hands pinching for two-hand gestures
    if (!left || !right || !left.pinching || !right.pinching) {
      return { type: "none" };
    }

    // Detect pinch zoom (priority 1)
    const currentDistance = Vector3.Distance(left.position, right.position);
    if (this.previousDistance !== null) {
      const distanceDelta = currentDistance - this.previousDistance;

      // Check if distance change exceeds threshold
      if (Math.abs(distanceDelta) > this.ZOOM_THRESHOLD) {
        // Zoom in when hands move closer (negative delta)
        // Zoom out when hands move farther (positive delta)
        const zoomDelta = distanceDelta > 0 ? 1.1 : 0.9;

        return {
          type: "zoom",
          zoomDelta,
        };
      }
    }

    // Detect twist rotation (priority 2)
    const direction = right.position.subtract(left.position);
    const currentAngle = Math.atan2(direction.y, direction.x);

    if (this.previousAngle !== null) {
      const angleDelta = currentAngle - this.previousAngle;

      // Check if angle change exceeds threshold
      if (Math.abs(angleDelta) > this.ROTATION_THRESHOLD) {
        return {
          type: "rotate",
          rotationAxis: Vector3.Up(), // Rotate around Y-axis
          rotationAngle: angleDelta,
        };
      }
    }

    return { type: "none" };
  }

  /**
   * Calculate pan delta from thumbstick input
   *
   * @param x - Thumbstick X-axis (-1 to 1)
   * @param y - Thumbstick Y-axis (-1 to 1)
   * @returns World-space pan delta vector
   */
  public calculatePanFromThumbstick(x: number, y: number): Vector3 {
    return new Vector3(
      x * this.PAN_SENSITIVITY,
      y * this.PAN_SENSITIVITY,
      0
    );
  }

  /**
   * Reset gesture detector state
   * Useful when entering/exiting XR mode
   */
  public reset(): void {
    this.previousLeftHand = null;
    this.previousRightHand = null;
    this.previousDistance = null;
    this.previousAngle = null;
  }
}
