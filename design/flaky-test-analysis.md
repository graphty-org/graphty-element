# Flaky Visual Test Analysis Report

## Recent Flaky Test Resolution (2025-07-28)

### Problem Description
Chromatic visual tests were failing inconsistently between runs. When running tests multiple times in a row, we would get different visual changes each time (0 changes, then 1 change, then 2 changes, etc.). The same specific tests kept failing:
- Font Size story (large 96px fonts)
- Data JSON story (using data3.json)
- Data Modified JSON story (using data2.json)
- Layout ngraph story (using data3.json)

### Root Cause Analysis
The investigation revealed multiple contributing factors:

1. **Dataset Size**: The failing tests used much larger datasets:
   - `data3.json` and `data2.json`: 77 nodes, 254 edges
   - `cat-social-network-2.json` (used by most stories): 20 nodes, 30 edges
   - **3.85x larger datasets = significantly more physics calculations**

2. **Babylon.js Rendering Frames**: The graph-settled event only checks if the layout algorithm has converged, but doesn't ensure Babylon.js has completed rendering frames. From the Babylon.js testing guide, deterministic visual tests require a fixed number of render frames.

3. **Physics-Based Layout Non-Determinism**: Even with fixed seeds, ngraph physics simulations can produce slightly different results due to:
   - Floating-point calculation variations
   - Order of operations differences
   - More complex graphs taking longer to settle

### Attempted Solutions That DIDN'T Work

1. **Increasing preSteps alone** (from 2000 to 4000) - Still had flaky tests
2. **Adding 200ms chromatic delay** - Insufficient for Babylon.js rendering
3. **Focusing on D3 layout** - D3 wasn't the problem; ngraph was used in almost all failing tests

### Solutions That DID Work

The final solution combined three approaches:

1. **Added 500ms chromatic delay** to all stories using ngraph layout:
   ```typescript
   parameters: {
       chromatic: {
           delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
       },
   },
   ```

2. **Significantly increased preSteps** for stories with larger datasets:
   - Layout ngraph story: 15,000 preSteps (was 4,000)
   - Data stories: 8,000 preSteps (was 2,000)
   - FontSize story: 6,000 preSteps (was 3,000)

3. **Switched to deterministic layout** for Data stories:
   ```typescript
   layout: "circular", // Use deterministic layout for visual tests
   ```
   Circular layout is deterministic and doesn't require physics settling.

### Why These Fixes Worked

1. **Chromatic Delay**: Ensures Babylon.js completes ~30 render frames at 60fps before taking screenshots, matching the Babylon.js testing approach of using fixed render counts.

2. **Increased PreSteps**: Larger graphs need exponentially more steps to settle. The relationship isn't linear - a graph with 3.85x more nodes might need 4-8x more steps to achieve the same level of stability.

3. **Deterministic Layouts**: Circular layout completely avoids physics non-determinism for stories where the exact layout isn't critical to the test.

### Patterns for Future Flaky Test Prevention

1. **Dataset Size Matters**: Stories using larger datasets need special handling:
   - Much higher preSteps (8,000-15,000 for 77-node graphs)
   - Consider using deterministic layouts when physics isn't being tested

2. **Render Frame Completion**: Always add chromatic delays for 3D visualizations:
   - 500ms is a good default (30 frames at 60fps)
   - Larger/more complex scenes might need more

3. **Physics Layouts Are Inherently Flaky**: Even with seeds:
   - Use deterministic layouts (circular, grid) for visual regression tests when possible
   - If physics layout is required, maximize preSteps and add render delays
   - Consider that some amount of flakiness might be unavoidable

4. **Test the Same Way Repeatedly**: When debugging flaky tests:
   - The same tests will fail repeatedly (not random)
   - Look for patterns in what makes failing tests different (dataset size, complexity, etc.)

## Summary of Non-Determinism Sources Found

### 1. Animation in Stories
- **File**: `stories/LabelStyles.stories.ts`
- **Story**: `AnimatedLabels`
- **Issue**: Uses `animation: isChromatic() ? "none" : "pulse"` which correctly disables animation for Chromatic tests
- **Status**: ✅ Already handled correctly

### 2. Physics-Based Layouts with Seeds
All physics-based layouts (ngraph, d3, forceatlas2) have been configured with fixed seeds:
- **ngraph**: seed: 12
- **forceatlas2**: seed: 42 (3D), seed: 12 (2D)
- **random**: seed: 12
- **spring**: seed: 12
- **arf**: seed: 12
- **planar**: seed: 42
- **Status**: ⚠️ Seeds help but don't guarantee determinism

### 3. D3 Layout Configuration
- **File**: `stories/Layout.stories.ts`
- **Story**: `D3`
- **Issue**: D3 layout does not use a seed parameter but relies on physics simulation parameters
- **Concern**: D3 force simulation may not be fully deterministic even with fixed parameters
- **Status**: ⚠️ Potential source of flakiness (though not the cause this time)

### 4. PreSteps Configuration
Found various preSteps configurations:
- **ngraph with data3.json**: 15,000 steps (was 4,000)
- **Data stories with 77 nodes**: 8,000 steps (was 2,000)
- **Large font physics**: 6,000 steps (was 3,000)
- **Standard layouts**: 2,000 steps
- **Status**: ✅ Now properly scaled for dataset complexity

### 5. Animation Implementation
- **File**: `src/meshes/RichTextAnimator.ts`
- **Issue**: Uses `animationTime += 0.016 * this.options.animationSpeed` which assumes 60 FPS
- **Concern**: Frame-dependent animation timing could cause visual differences
- **Status**: ⚠️ Potential source of flakiness if animations are not disabled

### 6. Babylon.js Render Frames
- **Issue**: Graph-settled event doesn't wait for Babylon.js rendering to complete
- **Solution**: Added chromatic delays to ensure render frame completion
- **Status**: ✅ Fixed with 500ms delays

## Recommendations

### 1. D3 Layout Determinism
The D3 layout doesn't support a seed parameter. Consider:
- Adding a fixed initial position generator for D3 layouts
- Or increasing preSteps for D3 to ensure full convergence
- Or switching the D3 story to use a simpler dataset that converges faster

### 2. Animation Frame Independence
The animation system assumes 60 FPS which might not be consistent in CI. Ensure:
- All stories with animations explicitly disable them for visual tests
- Consider using delta time instead of fixed frame increments

### 3. Verify Chromatic Detection
Ensure `isChromatic()` is working correctly in all environments to disable animations.

### 4. Use Chromatic Delays for 3D Rendering
Always add chromatic delays for Babylon.js 3D scenes to ensure render completion.

## Most Likely Culprits for Future Flaky Tests

1. **Large datasets with physics layouts** - Need much higher preSteps
2. **Missing chromatic delays** - Babylon.js needs time to render frames
3. **D3 Layout Story** - No seed support, relies on physics convergence
4. **Any story with animations** if `isChromatic()` detection fails
5. **Complex physics interactions** - Large fonts, many nodes, etc.

## Next Steps for Future Flaky Tests

1. Check dataset size - larger datasets need special handling
2. Add chromatic delays for 3D rendering
3. Consider switching to deterministic layouts for visual tests
4. Increase preSteps proportionally to graph complexity
5. Monitor which specific stories are flaking to find patterns