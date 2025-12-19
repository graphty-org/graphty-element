# Feature Design: XR (VR/AR) Camera and Controls

## Overview

- **User Value**: Users can experience and interact with graph visualizations in immersive VR and AR environments using popular headsets (Meta Quest, Apple Vision Pro, Android XR devices), enabling new ways to explore complex graph structures in 3D space.

- **Technical Value**: Provides a clean, extensible architecture for XR that follows existing camera patterns, enabling future XR feature additions and maintaining consistency with the codebase's modular design philosophy.

## Requirements

### Core Requirements

1. **Refactor existing XR implementation** (`src/xr-button.ts`) into proper CameraController and InputHandler classes matching the existing Orbit and TwoD camera architecture

2. **VR/AR availability UI**:
   - Button(s) in bottom-left corner by default
   - If XR not available: display "VR / AR NOT AVAILABLE" message briefly (5 seconds)
   - If available: display separate VR and AR buttons
   - Clicking button enters corresponding XR mode
   - Button style and location must be configurable/disableable

3. **XR camera behavior**:
   - Should behave similarly to Orbit camera (zoom, rotate, pan capabilities)
   - Smooth transition from non-XR camera to XR camera

4. **XR controls support**:
   - Controls should provide zoom, pan, rotate, select, and drag operations
   - **Meta Quest**: Support both hand tracking and controller inputs
   - **Apple Vision Pro**: Support hand inputs (pinch gestures with eye-tracking)
   - **Android XR (Galaxy XR)**: Support both hand tracking and controller inputs

### Open Questions Answered

**Q: What other VR headsets should we support?**

**A**: Based on market research:
- **Primary targets** (covered by WebXR standard compliance):
  - Meta Quest 2/3 (60.6% market share)
  - Apple Vision Pro (premium market, WebXR enabled in visionOS 2)
  - Android XR devices (emerging platform)

- **Secondary consideration**:
  - Valve Index (popular PC VR, finger-tracking controllers)
  - HTC Vive XR Elite (enterprise market)
  - Pico 4 (emerging competitor)

**Recommendation**: Focus on WebXR standard compliance rather than device-specific implementations. This ensures broad compatibility without maintaining device-specific code.

**Q: Are there other types of VR controllers we should consider?**

**A**: Yes, several controller types exist:
- **Standard gamepad controllers** (Oculus Touch, Windows Motion Controllers) - most common
- **Hand tracking** (skeletal tracking with 25 joints per hand)
- **Gaze + click** (Google Cardboard-style)
- **Finger-tracking controllers** (Valve Index)
- **Pinch gestures with eye-tracking** (Apple Vision Pro's transient-pointer)

**Recommendation**: Leverage BabylonJS's WebXR Input abstraction which handles all these automatically through the WebXR Input Profiles repository.

**Q: Does gaze tracking work with WebXR? Do we need separate features/controllers?**

**A**: Yes, gaze tracking works with WebXR through the standard input API:
- **Basic gaze**: Supported via `targetRayMode = 'gaze'` where the ray originates from the viewer's head position
- **Eye tracking**: Being standardized (WebXR Eye Tracking API), already supported in BabylonJS via `WebXREyeTracking` feature
- **Apple Vision Pro**: Uses transient-pointer mode (gaze + pinch) automatically handled by WebXR

**Recommendation**: No separate implementation needed. BabylonJS's WebXR input abstraction handles gaze automatically as just another input source type. Eye tracking can be enabled as an optional WebXR feature when available.

**Q: Are there controller/input libraries we should use?**

**A**: Several options exist:
- **BabylonJS built-in WebXR support** (recommended) - Already handles WebXR Input Profiles, hand tracking, controllers
- **Handy.js** - Adds gesture recognition on top of Three.js hand tracking (not applicable for Babylon)
- **Direct WebXR API** - Too low-level, unnecessary with Babylon

**Recommendation**: Use BabylonJS's native WebXR features. They provide excellent abstractions for:
- Controller/hand switching
- Input profile management
- Hand tracking with physics
- Near-interaction support

**Q: Are there UX considerations?**

**A**: Yes, critical UX considerations:

1. **Apple Vision Pro specifics**:
   - Only reveals hand position during pinch gestures (privacy-focused)
   - Uses eye-tracking + pinch (transient-pointer mode)
   - No AR support yet (VR only in current visionOS)

2. **Initial camera positioning**:
   - VR: Can use default XR positioning
   - AR: Must transfer non-XR camera position to XR (user expects continuity)

3. **Controller/hand switching**:
   - Users may switch between controllers and hands mid-session
   - System must handle input source changes gracefully

4. **Accessibility**:
   - Ensure teleportation can be enabled (currently disabled in existing code)
   - Support multiple interaction ranges (near vs. far interaction)
   - Provide visual feedback for selections

5. **Performance**:
   - XR requires maintaining high frame rates (90-120 Hz)
   - Graph complexity may need LOD (level of detail) adjustments in XR mode

**Q: Other features/considerations for VR camera?**

**A**: Additional features to consider:

1. **Essential for initial implementation**:
   - Session state management (entering/exiting XR)
   - Fallback when XR fails to initialize
   - Proper cleanup/disposal of XR resources
   - Reference space management (bounded-floor, local-floor, unbounded)

2. **Nice-to-have enhancements**:
   - Teleportation for large graphs
   - Snap turning for comfort
   - Comfort options (vignetting during movement)
   - Multi-user XR sessions
   - XR-specific UI overlays (stats, menus)
   - Hit-test support for AR placement

3. **Technical considerations**:
   - Optional features negotiation with device
   - Handling session mode fallback (if AR not available, offer VR)
   - Frame rate optimization specific to XR
   - Memory constraints on mobile XR devices

## Proposed Solution

### User Interface/API

**Configuration Schema** (extending existing config):

```typescript
interface XRConfig {
  enabled: boolean; // default: true

  ui: {
    enabled: boolean; // default: true
    position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'; // default: 'bottom-left'
    customStyles?: string; // CSS override
    unavailableMessageDuration: number; // milliseconds, default: 5000
  };

  vr: {
    enabled: boolean; // default: true
    referenceSpaceType: XRReferenceSpaceType; // default: 'local-floor'
    optionalFeatures: string[]; // default: []
  };

  ar: {
    enabled: boolean; // default: true
    referenceSpaceType: XRReferenceSpaceType; // default: 'local-floor'
    optionalFeatures: string[]; // default: ['hit-test']
  };

  input: {
    handTracking: boolean; // default: true
    controllers: boolean; // default: true
    nearInteraction: boolean; // default: true
    physics: boolean; // default: true for hand joints
  };

  teleportation: {
    enabled: boolean; // default: false
    easeTime: number; // default: 200ms
  };
}
```

**API Usage**:

```typescript
// In Graph class or via config
graph.camera.activateCamera('xr'); // Enters XR mode (VR or AR based on availability)

// Or programmatically
await graph.enterXR('immersive-vr');
await graph.enterXR('immersive-ar');
graph.exitXR();

// Events
graph.on('xr-session-started', (mode) => { /* VR or AR */ });
graph.on('xr-session-ended', () => { /* cleanup */ });
graph.on('xr-input-added', (inputSource) => { /* hand or controller */ });
```

### Technical Architecture

#### Components

1. **XRCameraController** (`src/cameras/XRCameraController.ts`)
   - Implements `CameraController` interface
   - Manages WebXR camera and reference space
   - Provides `zoomToBoundingBox()` implementation compatible with XR

2. **XRInputController** (`src/cameras/XRInputController.ts`)
   - Implements `InputHandler` interface
   - Manages WebXR input sources (hands + controllers)
   - Translates XR inputs to graph interactions (select, drag, zoom, rotate, pan)
   - Handles input source switching (controller ↔ hand)

3. **XRUIManager** (`src/ui/XRUIManager.ts`) [New]
   - Manages VR/AR button rendering
   - Handles session state UI feedback
   - Configurable positioning and styling
   - Shows availability messages

4. **XRSessionManager** (`src/xr/XRSessionManager.ts`) [New]
   - Wraps BabylonJS `WebXRDefaultExperience`
   - Manages session lifecycle
   - Handles optional features negotiation
   - Manages reference space changes

#### Data Model

No changes to graph data model. XR interactions use existing Node/Edge interfaces.

**New interfaces**:

```typescript
interface XRInputState {
  sourceId: string;
  type: 'hand' | 'controller' | 'gaze';
  handedness: 'left' | 'right' | 'none';
  position: Vector3;
  rotation: Quaternion;
  selecting: boolean;
  squeezing: boolean;
}

interface XRSessionState {
  active: boolean;
  mode: 'immersive-vr' | 'immersive-ar' | null;
  referenceSpace: XRReferenceSpace | null;
  inputSources: Map<string, XRInputState>;
}
```

#### Integration Points

1. **CameraManager** (existing):
   - Register XR camera as `CameraKey = 'xr'`
   - No modifications needed to CameraManager itself

2. **Graph.ts** (existing):
   - Initialize XRCameraController and XRInputController
   - Register with CameraManager
   - Initialize XRUIManager
   - Uncomment and refactor XR initialization code

3. **RenderManager** (existing):
   - XR render loop handled by BabylonJS automatically
   - May need frame rate monitoring for XR

4. **InputManager** (existing):
   - XR input handled separately through XRInputController
   - No conflicts expected (XR input replaces DOM input when active)

5. **Config** (existing):
   - Add XRConfig to main configuration schema
   - Ensure config is stable (additive only)

### Implementation Approach

**Important**: Each phase delivers user-testable functionality. After each phase, the user can try the new features in Storybook or the dev server.

---

#### Phase 1: Minimal XR Session with UI (2-3 days)

**Goal**: User can click a button and enter XR mode to see the graph in VR/AR.

**Deliverables**:
1. **Create basic XRUIManager** (`src/ui/XRUIManager.ts`)
   - VR/AR buttons in bottom-left corner
   - "VR / AR NOT AVAILABLE" message handling
   - Basic styling (extracted from `xr-button.ts`)
   - No configuration yet (hardcoded defaults)

2. **Create minimal XRSessionManager** (`src/xr/XRSessionManager.ts`)
   - Extract and refactor logic from `xr-button.ts`
   - Basic session lifecycle (enter VR/AR, exit)
   - Use BabylonJS `createDefaultXRExperienceAsync()`
   - Handle camera position transfer (AR mode)

3. **Integrate into Graph.ts**
   - Initialize XRUIManager and XRSessionManager
   - Wire up button clicks to session start/stop
   - No CameraManager integration yet (direct approach)

4. **Create Storybook story** (`stories/XR/BasicSession.stories.ts`)
   - Story showing XR buttons
   - User can click to enter XR (if available)
   - Can test with IWER or real headset

**User Testing**:
- ✅ Open Storybook story
- ✅ See VR/AR buttons (or unavailable message)
- ✅ Click button to enter XR mode
- ✅ See graph in VR/AR (with default BabylonJS camera)
- ✅ Exit XR mode

**Tests**:
- Unit test: XRSessionManager basic lifecycle
- Unit test: XRUIManager button rendering
- Playwright + IWER: Button click and session initialization

---

#### Phase 2: XR Input and Interactions (2-3 days)

**Goal**: User can select and drag nodes/edges in XR using controllers or hands.

**Deliverables**:
1. **Create XRInputController** (`src/cameras/XRInputController.ts`)
   - Implement `InputHandler` interface (stub `update()` for now)
   - Subscribe to WebXR input observables
   - Basic input handling:
     - Controller/hand ray casting for selection
     - Trigger/pinch for select
     - Squeeze/grab for drag
   - Handle input source add/remove (controller ↔ hand switching)

2. **Implement interaction mappings**
   - Ray casting to pick nodes/edges
   - Drag nodes on squeeze/grab
   - Visual feedback (highlight on hover)
   - Use existing graph interaction events

3. **Update Storybook story**
   - Add interactive graph with nodes
   - Show input source indicators (hands/controllers)
   - Display selected/dragged node info

**User Testing**:
- ✅ Enter XR mode
- ✅ Point controller/hand at node (see highlight)
- ✅ Pull trigger/pinch to select node
- ✅ Squeeze/grab to drag node
- ✅ Switch between controller and hand tracking
- ✅ Interact with edges

**Tests**:
- Unit test: Input mapping logic
- Unit test: Ray casting calculations
- Playwright + IWER: Select and drag operations

---

#### Phase 3: Camera Architecture Integration (1-2 days)

**Goal**: User can switch between Orbit, 2D, and XR cameras seamlessly.

**Deliverables**:
1. **Create XRCameraController** (`src/cameras/XRCameraController.ts`)
   - Implement `CameraController` interface
   - Wrap WebXRCamera from XRSessionManager
   - Implement `zoomToBoundingBox()` for XR
   - Transfer camera position from previous camera

2. **Update CameraManager**
   - Add `'xr'` to `CameraKey` type
   - Register XR camera/input in Graph initialization

3. **Refactor Graph.ts integration**
   - Use CameraManager.activateCamera('xr')
   - Remove direct XR initialization from Phase 1
   - Proper cleanup on camera switching

4. **Update Storybook stories**
   - Story showing camera switching
   - Buttons to switch: Orbit → XR → Orbit → 2D

**User Testing**:
- ✅ Start with Orbit camera
- ✅ Click XR button, smoothly transitions to XR
- ✅ Exit XR, returns to Orbit camera (same position)
- ✅ Switch to 2D, then to XR (works from any camera)
- ✅ `zoomToBoundingBox()` works in XR mode

**Tests**:
- Unit test: XRCameraController interface compliance
- Unit test: Camera position transfer
- Integration test: Camera switching flows (Orbit ↔ XR ↔ 2D)

---

#### Phase 4: Configuration and Polish (1-2 days)

**Goal**: User can configure XR behavior, styling, and features.

**Deliverables**:
1. **Create XRConfig schema** (in `src/config/`)
   - Define Zod schema for all XR options
   - UI positioning, styling, features
   - VR/AR settings, input options
   - Sensible defaults, backward compatibility

2. **Update XRUIManager for configuration**
   - Configurable button position
   - Custom styles support
   - Disable buttons via config
   - Message duration configuration

3. **Update XRSessionManager for configuration**
   - Optional features (hand tracking, etc.)
   - Reference space types
   - Teleportation enable/disable

4. **Create configuration Storybook stories**
   - Different button positions
   - Custom styling examples
   - Features enabled/disabled
   - AR vs VR only

**User Testing**:
- ✅ Configure button position (all 4 corners)
- ✅ Apply custom button styles
- ✅ Disable XR buttons entirely
- ✅ Enable/disable hand tracking
- ✅ Configure VR only (no AR button)
- ✅ Change unavailable message duration

**Tests**:
- Unit test: Config schema validation
- Unit test: Config application to components
- Visual test: Button positioning variants

---

#### Phase 5: Advanced Interactions and Gestures (1-2 days)

**Goal**: User can zoom, pan, and rotate the graph using XR gestures.

**Deliverables**:
1. **Implement advanced input mappings**
   - Two-hand pinch for zoom
   - Two-hand twist for rotate
   - Thumbstick/touchpad for pan
   - Implement `update()` in XRInputController

2. **Add gesture detection**
   - Detect two-hand gestures
   - Smooth gesture interpolation
   - Prevent gesture conflicts

3. **Update Storybook stories**
   - Story demonstrating all gestures
   - Visual indicators for gesture state

**User Testing**:
- ✅ Pinch with two hands to zoom in/out
- ✅ Twist hands to rotate graph
- ✅ Use thumbstick to pan
- ✅ Gestures work smoothly together
- ✅ Works with both controllers and hands

**Tests**:
- Unit test: Gesture detection logic
- Unit test: Zoom/pan/rotate calculations
- Playwright + IWER: Gesture simulations

---

#### Phase 6: Testing, Documentation, and Refinement (2-3 days)

**Goal**: Everything is tested, documented, and polished.

**Deliverables**:
1. **Comprehensive testing**
   - Complete unit test coverage (>80%)
   - All Playwright + IWER integration tests
   - Visual regression tests for UI
   - Error scenario testing

2. **Documentation**
   - Update CLAUDE.md with XR usage
   - API documentation for XRConfig
   - Storybook stories with explanations
   - Comment complex XR code

3. **Performance optimization**
   - Profile XR frame rate
   - Optimize for mobile XR (Quest)
   - Memory leak checks
   - Identify bottlenecks

4. **UX refinement**
   - Smooth camera transitions
   - Visual feedback polish
   - Error message improvements
   - Accessibility considerations

**User Testing**:
- ✅ All features work reliably
- ✅ Performance is acceptable on Quest
- ✅ Error handling is clear and helpful
- ✅ Documentation is clear and complete

**Tests**:
- Full test suite passes
- No regressions in existing features
- Performance benchmarks meet targets

---

**Total Estimate**: 9-15 days

**Phased Delivery Benefits**:
- User can test and provide feedback after each phase
- Issues discovered early, not at the end
- Can reprioritize based on user feedback
- Reduced risk of major architectural issues
- Demos are possible at any phase

## Acceptance Criteria

- [ ] XRCameraController implements `CameraController` interface and can be registered with CameraManager
- [ ] XRInputController implements `InputHandler` interface with enable/disable/update methods
- [ ] Camera can be switched: Orbit → XR → Orbit without errors
- [ ] VR/AR buttons appear in bottom-left corner by default when XR is available
- [ ] "VR / AR NOT AVAILABLE" message displays for 5 seconds when XR not supported
- [ ] VR button successfully enters immersive-vr mode on compatible devices
- [ ] AR button successfully enters immersive-ar mode on compatible devices (or falls back gracefully)
- [ ] XR session can be exited and returns to previous camera mode
- [ ] Button position can be configured via XRConfig.ui.position
- [ ] Buttons can be disabled via XRConfig.enabled = false
- [ ] Custom button styles can be applied via XRConfig.ui.customStyles
- [ ] On Meta Quest: Both hand tracking and controllers work for interaction
- [ ] On Apple Vision Pro: Pinch gestures work for interaction (VR mode only)
- [ ] XR inputs support: select, drag, zoom, pan, rotate operations
- [ ] User can select nodes/edges using XR controllers or hands
- [ ] User can drag nodes using squeeze/grab gestures
- [ ] zoomToBoundingBox() works correctly when XR camera is active
- [ ] Initial XR camera position matches non-XR camera position (for AR mode)
- [ ] XR resources are properly disposed when exiting XR or disposing Graph
- [ ] Configuration schema is validated with Zod
- [ ] Backward compatibility: existing configs work without XR options
- [ ] Unit tests achieve >80% coverage for XR components
- [ ] Visual tests verify UI button rendering and positioning
- [ ] Documentation includes XR camera usage examples
- [ ] Storybook stories demonstrate XR functionality

## Technical Considerations

### Performance

**Impact**:
- XR requires 90-120 Hz frame rates (vs. 60 Hz for desktop)
- Mobile XR devices (Quest) have limited GPU/CPU
- Hand tracking requires processing 50 joint positions (25 per hand) per frame
- Dual rendering for stereo vision doubles draw calls

**Mitigation**:
- Leverage BabylonJS's instancing (already implemented in MeshCache)
- Monitor frame rate via statsManager
- Consider LOD for large graphs (future enhancement)
- Profile XR performance separately
- Use BabylonJS optimizations (frustum culling, occlusion)
- Disable physics on hand joints unless needed for near-interaction

### Security

**Considerations**:
- WebXR requires HTTPS (already required for web components)
- User must explicitly consent to XR session (browser handles this)
- Hand tracking data could be sensitive (Apple's privacy approach)

**Measures**:
- No hand tracking data leaves the device
- No analytics on XR usage (unless user explicitly enables)
- Follow WebXR security best practices
- Respect browser's XR permission model

### Compatibility

**Backward Compatibility**:
- Existing configs without XR settings work unchanged (XR defaults to enabled)
- Non-XR cameras unaffected
- XR code only loads when session is initiated
- Graceful degradation when XR unavailable

**Browser Compatibility**:
- Chrome/Edge: Full WebXR support
- Firefox: WebXR support (may need flags)
- Safari: WebXR enabled in iOS 15.4+, visionOS 2+
- Feature detection via `navigator.xr` prevents errors

**Device Compatibility**:
- Meta Quest: Excellent WebXR support (primary target)
- Apple Vision Pro: VR only (no AR in current visionOS)
- Android XR: Emerging platform (test as available)
- PC VR (Index, Vive): Through SteamVR/OpenXR
- Mobile AR (phone-based): Limited but supported

### Testing

**Strategy** (Based on BabylonJS's approach):

1. **Unit Tests** (Vitest with jsdom):
   - Use `NullEngine` for headless testing (no rendering needed)
   - Mock WebXR APIs and session managers
   - Test XRSessionManager lifecycle
   - Test input mapping logic
   - Test configuration validation
   - Test camera controller interface compliance
   - Example from BabylonJS: Create mock `WebXRSessionManager` and test feature enabling/disabling

2. **Integration Tests with IWER** (Playwright + IWER):
   - **IWER** (Immersive Web Emulation Runtime) - Meta's official WebXR emulator
   - Emulates Meta Quest 3, Quest 2, and other devices in browser
   - Can be used in CI/CD without physical hardware
   - Install via: `npm install iwer --save-dev`
   - Tests:
     - Camera switching flows (Orbit → XR → Orbit)
     - XR session initialization
     - Button clicks and UI interactions
     - Input source changes (controller ↔ hand)
     - Stereo rendering validation
     - Error handling paths

   Example setup (from BabylonJS):
   ```typescript
   await page.addScriptTag({
     url: "https://unpkg.com/iwer/build/iwer.min.js",
   });
   await page.evaluate(() => {
     const xrDevice = new IWER.XRDevice(IWER.metaQuest3);
     xrDevice.installRuntime();
     xrDevice.stereoEnabled = true;
   });
   ```

3. **Visual Tests** (Storybook):
   - UI button rendering and positioning
   - Availability messages
   - Configuration variants
   - Button styling
   - Can use IWER in Storybook for interactive XR testing

4. **WebXR Test API** (Optional, for advanced testing):
   - Use immersive-web/webxr-test-api for cross-platform testing
   - Provides simulation API for WPT (Web Platform Tests)
   - Useful for testing edge cases and spec compliance

5. **Manual Testing** (Final validation):
   - On actual Meta Quest device
   - On Apple Vision Pro (if available)
   - With both hands and controllers
   - Performance profiling on real hardware
   - UX validation and comfort testing

**Tools & Resources**:
- **IWER**: https://github.com/meta-quest/immersive-web-emulation-runtime
- **Immersive Web Emulator** (browser extension): For interactive development
- **WebXR Test API**: https://github.com/immersive-web/webxr-test-api
- **BabylonJS test examples**: `/tmp/Babylon.js/packages/tools/tests/test/playwright/vr.webxr.test.ts`

## Risks and Mitigation

### Risk: Apple Vision Pro AR Not Yet Supported

**Impact**: Medium - Users expect AR on Vision Pro, but visionOS doesn't support WebXR AR module yet

**Mitigation**:
- Detect AR support before showing AR button
- On Vision Pro: Only show VR button or show AR button with disabled state + tooltip
- Document limitation clearly
- Monitor visionOS updates for AR support

### Risk: Performance Issues on Mobile XR

**Impact**: High - Poor performance causes motion sickness and bad UX

**Mitigation**:
- Profile early and often on actual Quest devices
- Implement frame rate monitoring
- Add performance warnings for large graphs
- Consider graph complexity limits in XR mode
- Document performance expectations
- Future: Implement LOD system

### Risk: Hand Tracking Reliability

**Impact**: Medium - Hand tracking less precise than controllers, may frustrate users

**Mitigation**:
- Support both hands and controllers
- Make hand tracking optional (enabled by default)
- Provide visual feedback for hand state
- Tune interaction hitboxes for hand imprecision
- Document that controllers recommended for precision work

### Risk: Testing Coverage Limitations

**Impact**: Medium - Cannot fully test XR in automated tests

**Mitigation**:
- Comprehensive unit tests with mocked XR APIs
- Manual testing protocol on real devices
- Separate XR testing environment
- Use WebXR emulator extension during development
- Partner with community for multi-device testing
- Beta period with user feedback

### Risk: Breaking Changes to Existing Code

**Impact**: Low-Medium - Refactoring XR code could affect other systems

**Mitigation**:
- Follow existing patterns strictly (CameraController, InputHandler)
- Keep XR code isolated
- Extensive integration tests
- Review with Graph.ts maintainer
- Incremental implementation with feature flags
- No changes to core Graph logic

### Risk: Configuration Complexity

**Impact**: Low - XR adds many config options, may overwhelm users

**Mitigation**:
- Provide sensible defaults (XR enabled, auto-detect features)
- Most users won't need custom XR config
- Document common use cases
- Keep simple case simple: `{camera: 'xr'}` should "just work"
- Advanced options clearly documented

### Risk: WebXR API Changes

**Impact**: Low - WebXR still evolving, features may change

**Mitigation**:
- Use BabylonJS abstraction layer (they track spec changes)
- Version lock BabylonJS carefully
- Monitor WebXR specification changes
- Test against WebXR Device API spec versions
- Keep XR code modular for easier updates

## Future Enhancements

### Short-term (Next 3-6 months)
- Teleportation system for navigating large graphs
- XR-specific UI overlays (menus, stats, settings)
- Comfort options (snap turning, vignetting)
- Gesture library (pinch, swipe, grab with two hands)
- Hit-test support for AR object placement

### Medium-term (6-12 months)
- Multi-user collaborative XR sessions (using WebRTC or similar)
- XR-optimized graph layouts (spatial algorithms)
- Level of Detail (LOD) system for large graphs in XR
- Passthrough mode mixing (for capable devices)
- Hand gesture shortcuts (custom poses)

### Long-term (12+ months)
- Spatial audio for graph navigation cues
- XR recording/replay for presentations
- AI-assisted XR navigation ("show me path between A and B")
- Cross-platform XR multiplayer
- Integration with AR cloud anchoring (persistent AR graphs)

## Implementation Estimate

- **Phase 1** (Minimal XR Session with UI): 2-3 days
  - ✅ User deliverable: Click button to enter XR mode
- **Phase 2** (XR Input and Interactions): 2-3 days
  - ✅ User deliverable: Select and drag nodes in XR
- **Phase 3** (Camera Architecture Integration): 1-2 days
  - ✅ User deliverable: Switch between cameras seamlessly
- **Phase 4** (Configuration and Polish): 1-2 days
  - ✅ User deliverable: Configure all XR options
- **Phase 5** (Advanced Interactions and Gestures): 1-2 days
  - ✅ User deliverable: Zoom/pan/rotate with gestures
- **Phase 6** (Testing, Documentation, and Refinement): 2-3 days
  - ✅ User deliverable: Production-ready feature

**Total Development**: 9-15 days

**Testing**: Integrated throughout all phases

**Documentation**: Integrated throughout all phases

**Grand Total**: **9-15 days of development effort**

**Note**: Each phase delivers working, user-testable functionality

---

## Summary

This design provides a comprehensive, production-ready approach to implementing XR camera and controls for graphty-element. It:

✅ Follows existing architectural patterns (CameraController, InputHandler)
✅ Supports all requested platforms (Meta Quest, Vision Pro, Android XR)
✅ Provides flexible, configurable UI
✅ Handles both hand tracking and controller inputs
✅ **Gaze tracking works automatically** - no separate implementation needed
✅ Maintains backward compatibility
✅ **Uses IWER for automated XR testing** - following BabylonJS's proven approach
✅ **Each phase delivers user-testable functionality** - feedback driven development
✅ Addresses performance and UX considerations
✅ Provides clear implementation roadmap with 6 incremental phases

**Key Design Decisions**:

1. **WebXR Standard Compliance**: Targets WebXR spec, not device-specific APIs, ensuring broad compatibility across all headsets without device-specific code.

2. **Gaze Tracking**: Automatically supported through WebXR's `targetRayMode='gaze'`. Advanced eye tracking can be enabled as an optional feature via BabylonJS's `WebXREyeTracking`.

3. **Testing with IWER**: Uses Meta's Immersive Web Emulation Runtime for automated WebXR testing in CI/CD, emulating Meta Quest 3 and other devices without physical hardware.

4. **Incremental Delivery**: 6 phases with user-testable deliverables after each phase:
   - Phase 1: Basic XR session (user can enter VR/AR)
   - Phase 2: Interactions (user can select/drag)
   - Phase 3: Camera integration (seamless switching)
   - Phase 4: Configuration (full customization)
   - Phase 5: Advanced gestures (zoom/pan/rotate)
   - Phase 6: Testing and polish (production ready)

5. **BabylonJS Built-in Features**: Leverages BabylonJS's WebXR abstraction for input handling, controller profiles, hand tracking, and session management - no external libraries needed.

The phased approach allows user testing and feedback after each phase, reducing risk and enabling course corrections based on real-world usage.
