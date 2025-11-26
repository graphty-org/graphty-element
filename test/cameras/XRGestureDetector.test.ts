import { describe, test, beforeEach } from "vitest";
import { assert } from "chai";
import { Vector3, Quaternion } from "@babylonjs/core";
import { XRGestureDetector } from "../../src/cameras/XRGestureDetector";
import type { HandState } from "../../src/cameras/XRGestureDetector";

describe("XRGestureDetector", () => {
  let detector: XRGestureDetector;

  beforeEach(() => {
    detector = new XRGestureDetector();
  });

  describe("Two-hand pinch zoom", () => {
    test("should detect zoom in when hands move closer together", () => {
      // First frame - establish baseline
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - move hands closer together
      detector.updateHands(
        {
          position: new Vector3(0.2, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(0.8, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "zoom");
      assert.exists(gesture.zoomDelta);
      assert.isBelow(gesture.zoomDelta!, 1.0); // Zoom in (hands closer)
    });

    test("should detect zoom out when hands move farther apart", () => {
      // First frame
      detector.updateHands(
        {
          position: new Vector3(0.2, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(0.8, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - move hands farther apart
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "zoom");
      assert.exists(gesture.zoomDelta);
      assert.isAbove(gesture.zoomDelta!, 1.0); // Zoom out (hands farther)
    });

    test("should not detect zoom when hands not pinching", () => {
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: false,
          pinchStrength: 0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: false,
          pinchStrength: 0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });

    test("should not detect zoom when only one hand pinching", () => {
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: false,
          pinchStrength: 0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });

    test("should not detect zoom for very small distance changes", () => {
      // First frame
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - very small movement (below threshold)
      detector.updateHands(
        {
          position: new Vector3(0.001, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(0.999, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });
  });

  describe("Two-hand twist rotation", () => {
    test("should detect clockwise rotation", () => {
      // First frame - horizontal alignment at distance 1.0
      detector.updateHands(
        {
          position: new Vector3(-0.5, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(0.5, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - rotate to diagonal, maintaining distance 1.0
      // Distance = sqrt((x2-x1)^2 + (y2-y1)^2)
      // For distance 1.0 at 45 degrees: each hand at 0.5/sqrt(2) ≈ 0.3536 from center
      const radius = 0.5;
      const angle = Math.PI / 4; // 45 degrees
      detector.updateHands(
        {
          position: new Vector3(
            -radius * Math.cos(angle),
            -radius * Math.sin(angle),
            0
          ),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(
            radius * Math.cos(angle),
            radius * Math.sin(angle),
            0
          ),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "rotate");
      assert.exists(gesture.rotationAxis);
      assert.exists(gesture.rotationAngle);
      assert.isAbove(Math.abs(gesture.rotationAngle!), 0);
    });

    test("should not detect rotation for very small angle changes", () => {
      // First frame
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - very small rotation (below threshold)
      detector.updateHands(
        {
          position: new Vector3(0, -0.001, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0.001, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });
  });

  describe("Zoom vs Rotation priority", () => {
    test("should prioritize zoom over rotation when both detected", () => {
      // First frame
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(1, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      // Second frame - move hands closer AND rotate (zoom + rotation)
      detector.updateHands(
        {
          position: new Vector3(0.2, -0.2, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        {
          position: new Vector3(0.7, 0.2, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        }
      );

      const gesture = detector.getCurrentGesture();
      // Should prioritize zoom
      assert.equal(gesture.type, "zoom");
    });
  });

  describe("Thumbstick pan", () => {
    test("should calculate pan delta from thumbstick input", () => {
      const panDelta = detector.calculatePanFromThumbstick(0.5, 0.5);

      assert.exists(panDelta);
      assert.isAbove(panDelta.x, 0);
      assert.isAbove(panDelta.y, 0);
      assert.equal(panDelta.z, 0);
    });

    test("should calculate negative pan for negative thumbstick values", () => {
      const panDelta = detector.calculatePanFromThumbstick(-0.5, -0.5);

      assert.isBelow(panDelta.x, 0);
      assert.isBelow(panDelta.y, 0);
      assert.equal(panDelta.z, 0);
    });

    test("should return zero pan for centered thumbstick", () => {
      const panDelta = detector.calculatePanFromThumbstick(0, 0);

      assert.equal(panDelta.x, 0);
      assert.equal(panDelta.y, 0);
      assert.equal(panDelta.z, 0);
    });

    test("should scale pan delta by sensitivity", () => {
      const smallDelta = detector.calculatePanFromThumbstick(0.1, 0.1);
      const largeDelta = detector.calculatePanFromThumbstick(1.0, 1.0);

      assert.isAbove(largeDelta.x, smallDelta.x);
      assert.isAbove(largeDelta.y, smallDelta.y);
    });
  });

  describe("Edge cases", () => {
    test("should handle null left hand", () => {
      detector.updateHands(null, {
        position: new Vector3(1, 0, 0),
        rotation: Quaternion.Identity(),
        pinching: true,
        pinchStrength: 1.0,
      });

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });

    test("should handle null right hand", () => {
      detector.updateHands(
        {
          position: new Vector3(0, 0, 0),
          rotation: Quaternion.Identity(),
          pinching: true,
          pinchStrength: 1.0,
        },
        null
      );

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });

    test("should handle both hands null", () => {
      detector.updateHands(null, null);

      const gesture = detector.getCurrentGesture();
      assert.equal(gesture.type, "none");
    });
  });
});
