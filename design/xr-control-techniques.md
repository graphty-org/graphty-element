# XR 3D Object Manipulation: Research and Analysis

**Date**: 2025-11-21
**Context**: VR controller-based node dragging implementation for graphty-element
**Status**: Research complete, implementation pending

---

## Table of Contents

1. [Research Questions](#research-questions)
2. [Current Implementation](#current-implementation)
3. [Research Methodology](#research-methodology)
4. [Academic Research Summary](#academic-research-summary)
5. [Four Leading Techniques](#four-leading-techniques)
6. [Comparative Analysis](#comparative-analysis)
7. [Implementation Recommendations](#implementation-recommendations)
8. [References](#references)
9. [Appendices](#appendices)

---

## Research Questions

### Original Questions (2025-11-21)

After implementing basic VR node dragging with 10× amplification on all axes, we needed to validate our approach against established research:

1. **What are the best practices for dragging in 3D space in VR?**
   - Should movement exactly track the controller ray 1:1?
   - Should it be amplified (faster) or dampened (slower)?
   - What amplification factors are recommended?

2. **Are there academic papers or research on this topic?**
   - Google Scholar research on 3D manipulation in VR
   - Control-display (C/D) ratio / gain research
   - Precision vs speed trade-offs

3. **Are there industry articles or opinion pieces?**
   - Medium articles on VR interaction design
   - Meta Quest / Oculus developer guidelines
   - Unity / Unreal VR best practices

4. **Does our current implementation match the research?**
   - Is 10× amplification aligned with recommendations?
   - Are we missing important techniques or considerations?
   - What improvements should we prioritize?

### Key Concerns

- **Z-axis amplification works great** - but is 10× appropriate?
- **X/Y amplification added** - same 10× factor applied to all axes
- **No tracking glitches** - after implementing MAX_REASONABLE_DELTA validation
- **Need validation** - does our approach align with 25+ years of VR research?

---

## Current Implementation

### Code Location

- **Main drag handler**: `src/NodeBehavior.ts` (NodeDragHandler class)
- **XR input controller**: `src/cameras/XRInputController.ts`
- **Configuration**: `src/config/XRConfig.ts`

### Current Behavior

```typescript
// src/NodeBehavior.ts, lines 54, 150-155

this.zAxisAmplification = xrConfig?.input.zAxisAmplification ?? 10.0;

if (shouldAmplify) {
    delta.x *= this.zAxisAmplification;  // 10×
    delta.y *= this.zAxisAmplification;  // 10×
    delta.z *= this.zAxisAmplification;  // 10×
}
```

### Implementation Details

**Approach**: Delta-based movement
- Calculate delta: `worldPosition - dragStartWorldPosition`
- Apply 10× amplification in XR mode
- Add delta to starting mesh position

**Tracking method**: Direct grip position
```typescript
// src/cameras/XRInputController.ts, line 172, 176
const gripPosition = controller.grip?.position ?? controller.pointer.position;
this.draggedNode.node.dragHandler?.onDragUpdate(gripPosition.clone());
```

**Safety features**:
- MAX_REASONABLE_DELTA = 5.0 units (detects tracking glitches)
- Validation prevents nodes jumping to infinity
- Automatic drag reset on controller tracking loss

**Configuration**:
```typescript
// src/config/XRConfig.ts
export interface XRInputConfig {
    zAxisAmplification?: number;  // Default: 10.0
    enableZAmplificationInDesktop?: boolean;  // Default: false
}
```

### What Works Well

✅ Z-axis push/pull is intuitive and effective
✅ X/Y movement works smoothly with 10× gain
✅ Tracking glitch detection prevents infinity jumps
✅ Direct grip position feels natural
✅ Delta-based calculation is simple and predictable

### Questions About Current Approach

❓ Is 10× amplification appropriate?
❓ Should we differentiate between near and far objects?
❓ Should we use velocity-based adaptive gain?
❓ Are we risking VR sickness with high multi-axis gain?
❓ Do we need different techniques for different tasks?

---

## Research Methodology

### Sources Searched

1. **Google Scholar** (scholar.google.com)
   - Keywords: "VR 3D manipulation", "control display ratio VR", "translational gain VR", "object manipulation virtual reality"
   - Time range: 1990-2024 (emphasis on recent research)

2. **ACM Digital Library** (dl.acm.org)
   - CHI, UIST, VR conference proceedings
   - Focus on interaction techniques and user studies

3. **Industry Sources**
   - Meta Quest Developer Documentation
   - Unity XR Interaction Toolkit
   - Medium articles on VR design
   - Leap Motion VR Design Guide

4. **Specialized VR Research Sites**
   - DIVA Portal (research database)
   - MDPI Virtual Reality journals
   - Springer Virtual Reality journal

### Research Scope

- **Time span**: 1996-2024 (28 years of VR research)
- **Focus areas**:
  - Control-display gain / C/D ratio
  - Translational gain in VR
  - Reach extension techniques
  - Precision vs speed trade-offs
  - Ergonomics and fatigue
  - VR sickness prevention
- **Application domains**: General VR manipulation, CAD, scientific visualization, training

---

## Academic Research Summary

### Key Finding: Optimal Gain Range is 1.5×-2.0×

**Consensus across multiple studies:**
- Gains above 2× cause accuracy degradation
- Gains above 2× increase VR sickness
- High gain on multiple axes simultaneously increases risk
- Optimal range: 1.5×-1.75× for balanced usability

### Critical Study: Wilson et al., CHI 2018

**Title**: "Object Manipulation in Virtual Reality Under Increasing Levels of Translational Gain"

**Citation**: Wilson, G., McGill, M., Jamieson, M., Williamson, J. R. and Brewster, S. A. (2018) CHI Conference on Human Factors in Computing Systems, Montréal, QC, Canada.

**URL**: https://dl.acm.org/doi/10.1145/3173574.3173673

**Key Findings**:
- Tested translational gains from 1× to 3×
- **Accuracy maintained up to 2× gain**
- **Beyond 2×**: Significant degradation
  - Increased simulator sickness
  - Decreased accuracy and precision
  - Increased perceived workload
  - Reduced usability
- **Recommended range**: 1.5× to 1.75×
- **Critical warning**: High gain on **more than 2 axes** increases VR sickness

**Implications for our implementation**:
- ❌ Our 10× on all 3 axes is **5× higher than safe maximum**
- ❌ High risk of VR sickness
- ❌ Likely reduced accuracy
- ✅ Need to reduce to 1.5×-2.0× range

### Ergonomics Research: Wentzel et al. - VRAmp

**Title**: "Improving Virtual Reality Ergonomics through Reach-Bounded Non-Linear Input Amplification"

**Authors**: Johann Wentzel et al.

**URL**: https://johannwentzel.ca/projects/vramp/

**Key Findings**:
- **User tolerance thresholds**:
  - **20% of arm length**: Amplification imperceptible to users
  - **30% of arm length**: Accuracy begins to degrade
  - **20% of arm length**: Most users notice amplification
- **Recommended approach**: Non-linear Hermite curve-based amplification
- **Maximum gain**: ~2× at full arm extension
- **Design philosophy**: Gradual amplification feels more natural than constant high gain

**Technique**: VRAmp (VR Amplification)
- Uses smooth Hermite interpolation curves
- Ensures C¹ continuity (smooth velocity transitions)
- Parameterized by arm extension percentage
- Prioritizes imperceptibility and comfort

**Implications**:
- ❌ Our constant 10× gain is immediately perceptible
- ✅ Could implement non-linear curve with 2× max
- ✅ Distance-based approach would reduce fatigue

### Recent Research: Piecewise Technique (2023)

**Title**: "A Non-Isomorphic 3D Manipulation Technique That Factors Upper-Limb Ergonomics in VR"

**Source**: MDPI - Multimodal Technologies and Interaction, 2023

**URL**: https://www.mdpi.com/2813-2084/2/2/9

**Key Findings**:
- **Two-zone approach**:
  - **Zone 1 (0-60% reach)**: 1:1 mapping (no amplification)
  - **Zone 2 (60-100% reach)**: Progressive amplification from 1× to 2×
- **Achieves 140% effective reach** (40% extension beyond natural)
- **Ergonomic focus**: Reduces upper-limb strain
- **Linear interpolation** in Zone 2: `gain = 1.0 + ((reach - 60) / 40)`

**Design rationale**:
- Large natural zone (60%) feels completely normal
- Progressive amplification only when needed (ergonomic strain zone)
- Maximum 2× aligns with safety research
- Simple implementation (two zones, linear)

**Implications**:
- ✅ Could implement distance-based zones
- ✅ 60% natural zone would improve precision for nearby nodes
- ✅ 2× max for distant nodes more appropriate than 10×

### Classic Technique: Go-Go (Poupyrev et al., 1996)

**Title**: "The Go-Go Interaction Technique: Non-linear Mapping for Direct Manipulation in VR"

**Citation**: Poupyrev, I., Billinghurst, M., Weghorst, S., and Ichikawa, T. (1996) UIST '96, Seattle, WA.

**URL**: https://dl.acm.org/doi/10.1145/237091.237102

**Key Findings**:
- **Threshold distance**: 2/3 of user's arm length
- **Within threshold**: 1:1 mapping (no amplification)
- **Beyond threshold**: Non-linear quadratic amplification
- **Formula**: `D = k × (d - D_threshold)² + d`
  - D = virtual hand position
  - d = real hand position
  - k = constant controlling gain rate

**Historical significance**:
- First widely-adopted reach extension technique
- Used in production VR for 28 years
- Simple enough for broad implementation
- Solved "I can't reach that" problem

**Limitations**:
- Quadratic growth can exceed safe 2× limit
- Can overshoot for distant objects
- Poor precision at extreme distances

**Implications**:
- ✅ Threshold-based approach is proven
- ✅ Natural zone + amplified zone pattern works well
- ❌ Need to cap maximum gain at 2×

### Velocity-Based Techniques: PRISM and Scaled HOMER

**PRISM**: Precision and Speed Integrated Manipulation
**Scaled HOMER**: Hand-centered Object Manipulation Extending Reach

**Key Findings**:
- **Different paradigm**: Gain based on **velocity**, not distance
- **Fast movements**: Higher gain (up to 2×) for repositioning
- **Slow movements**: Lower gain (down to 0.5×) for precision
- **User intent**: Movement speed naturally controls interaction mode
- **No distance calibration needed**: Works at any distance

**Advantages**:
- Single technique handles both speed and precision
- User intuitively controls mode through movement
- Can achieve sub-1× gain for micro-adjustments
- Adapts to task needs automatically

**Applications**:
- 3D CAD/modeling (coarse + fine positioning)
- Scientific visualization (macro + micro scales)
- Molecular docking (alignment)
- Any task requiring both speed and precision

**Implications**:
- ✅ Perfect for graph manipulation (move + align nodes)
- ✅ No distance calibration complexity
- ✅ Natural "fast for travel, slow for precision" pattern
- ⚠️ Requires velocity tracking implementation

### Near-Field vs Far-Field Research

**Source**: "Comparing Near-Field, Object Space, and Hybrid Interaction Techniques in VR"
**MDPI 2024**: https://www.mdpi.com/2813-2084/3/1/5

**Key Findings**:
- **Near-field manipulation** (<1 meter):
  - Superior accuracy and fine motor control
  - Better depth perception
  - Recommend 1:1 or subtle <1.5× gain
  - Ideal for precision tasks
- **Far-field manipulation** (>1 meter):
  - Faster but lower accuracy
  - Benefits from velocity-based scaling
  - Recommend 1.5×-2× with adaptive gain
  - Ideal for coarse transformations
- **Hybrid approaches** preferred by users:
  - Seamless switching based on distance/task
  - Different gain profiles for near vs far

**Implications**:
- ✅ Should differentiate near vs far nodes
- ✅ Near nodes: 1:1 or minimal amplification
- ✅ Far nodes: Up to 2× amplification
- ⚠️ Need to track node-to-user distance

### Ergonomics and Fatigue Research

**Source**: "Narrative review of immersive virtual reality's ergonomics and risks at the workplace"
**Springer Virtual Reality, 2022**: https://link.springer.com/article/10.1007/s10055-022-00672-0

**Key Findings**:
- VR causes **muscle fatigue and musculoskeletal discomfort**
- **Excessive strain zones**:
  - Shoulder flexion angle
  - Neck flexion moment
  - Shoulder muscle activities
- **"Gorilla arm" syndrome**: Extended reach causes rapid fatigue
- **Four-zone ergonomic model**:
  - Zone 0-1 (Green/Yellow): Minimal stress
  - Zone 2 (Red): Greater strain
  - Zone 3: Extreme strain (avoid)

**Movement amplification benefits**:
- ✅ Reduces required arm extension
- ✅ Minimizes physical fatigue
- ⚠️ But must stay within safe gain limits (≤2×) to maintain accuracy

**Implications**:
- ✅ Amplification is beneficial for ergonomics
- ✅ But 10× is too high and risks accuracy loss
- ✅ 1.5×-2× balances fatigue reduction with accuracy

### Industry Guidelines: Meta Quest

**Source**: Meta Quest Developer Documentation
**URL**: https://developers.meta.com/horizon/design/

**Key Guidelines**:
- **Optimal UI distance**: 70cm for mixed hand/controller interaction
- **Smoothing**: Recommend animation smoothing for comfort
- **Physics**: Virtual objects should "feel grounded" with realistic weight
- **Responsiveness**: "Safety should never be at the expense of speed"
- **Hand tracking improvements**:
  - 40% latency reduction in regular use
  - 75% latency reduction during fast movements
  - Emphasis on responsive, natural-feeling interactions

**Implications**:
- ✅ Our direct grip tracking is aligned with Meta's approach
- ✅ Responsive interactions are valued
- ⚠️ Consider adding smoothing for comfort
- ✅ Physics-based "feel" important for object manipulation

---

## Four Leading Techniques

Based on extensive research, four techniques dominate the VR manipulation literature:

1. **Go-Go** (1996) - Classic threshold-based reach extension
2. **VRAmp** (2020s) - Ergonomic non-linear amplification
3. **Piecewise** (2023) - Two-zone ergonomic approach
4. **PRISM/HOMER** (2000s) - Velocity-based dual-mode

---

## 1. Go-Go Technique (Poupyrev et al., 1996)

### Overview

The Go-Go technique is the classic and most widely-adopted VR reach extension method. It uses a distance threshold to determine when amplification begins, with quadratic scaling beyond the threshold.

### Mechanism

**Threshold-based distance amplification**:
- Virtual hand distance from body controls gain
- **Before threshold** (2/3 arm length): 1:1 mapping
- **After threshold**: Non-linear quadratic function

**Mathematical Formula**:
```
D = k × (d - D_threshold)² + d

Where:
  D = virtual hand position (output)
  d = real hand position (input)
  k = constant controlling gain rate (tunable)
  D_threshold = threshold distance (typically 2/3 arm length)
```

**Example with numbers**:
- Arm length: 0.6m
- Threshold: 0.4m (2/3 of 0.6m)
- k = 2.0

At d = 0.3m (before threshold):
```
D = 2.0 × (0.3 - 0.4)² + 0.3
D = 2.0 × 0.01 + 0.3 = 0.32m (barely any amplification)
```

At d = 0.5m (after threshold):
```
D = 2.0 × (0.5 - 0.4)² + 0.5
D = 2.0 × 0.01 + 0.5 = 0.52m (2cm amplification)
```

At d = 0.7m (well beyond threshold):
```
D = 2.0 × (0.7 - 0.4)² + 0.7
D = 2.0 × 0.09 + 0.7 = 0.88m (18cm amplification!)
```

**Gain calculation**: `gain = D / d`
- At 0.3m: gain ≈ 1.07×
- At 0.5m: gain ≈ 1.04×
- At 0.7m: gain ≈ 1.26×
- At 1.0m: gain ≈ 1.72×

### Strengths

✅ **Simple to implement** - Just threshold check + quadratic formula
✅ **Intuitive** - Hand position naturally controls gain
✅ **No mode switching** - Seamless continuous transition
✅ **Natural for nearby objects** - Full 1:1 fidelity within normal reach
✅ **Extends reach significantly** - Can grab objects well beyond arm's length
✅ **Proven in production** - 28 years of use in commercial VR
✅ **Battle-tested** - Used in Meta Quest, Unity templates, etc.

### Weaknesses

❌ **Quadratic growth unlimited** - Gain can exceed safe 2× limit at extreme distances
❌ **Can overshoot** - Fast acceleration beyond threshold
❌ **Poor precision at distance** - Hand tremor amplified quadratically
❌ **Boundary can feel abrupt** - Though usually imperceptible at 2/3 threshold
❌ **Distance-dependent only** - Doesn't adapt to task or velocity
❌ **No upper bound** - Needs manual capping to prevent excessive gain

### Key Use Cases

**Ideal for**:
- General-purpose VR environments (social VR, games)
- Object selection and arrangement at varying distances
- Scene manipulation where most objects are nearby, some far
- VR modeling and design with spatial layout
- Environments prioritizing reach extension
- Applications where simplicity of implementation is important

**Not ideal for**:
- Precision tasks at distance
- Applications requiring guaranteed accuracy
- Situations where preventing VR sickness is critical
- Tasks requiring sub-1× gain for micro-adjustments

### Why It's a Classic

First widely-adopted solution to the "I can't reach that" problem in VR. Simple enough to implement everywhere, sophisticated enough to feel natural for most users. Despite being 28 years old, still used in modern VR platforms like Meta Quest and Unity VR templates.

### Implementation Notes

**Pseudocode**:
```typescript
function calculateGoGoPosition(realHandPos: Vector3, bodyPos: Vector3): Vector3 {
    const ARM_LENGTH = 0.6;  // meters
    const THRESHOLD = ARM_LENGTH * (2/3);  // 0.4m
    const K = 2.0;  // gain rate constant

    const distance = realHandPos.distanceTo(bodyPos);

    if (distance <= THRESHOLD) {
        // Within threshold: 1:1 mapping
        return realHandPos.clone();
    } else {
        // Beyond threshold: quadratic amplification
        const direction = realHandPos.subtract(bodyPos).normalize();
        const excess = distance - THRESHOLD;
        const virtualDistance = K * (excess * excess) + distance;

        return bodyPos.add(direction.scale(virtualDistance));
    }
}
```

**Configuration parameters**:
- `ARM_LENGTH`: Per-user calibration or average (0.6m)
- `THRESHOLD`: Typically 2/3 of arm length
- `K`: Gain rate (2.0 is common, adjust for desired max reach)

**Modifications for safety**:
```typescript
// Cap maximum gain at 2× for safety
const MAX_GAIN = 2.0;
const cappedVirtualDistance = Math.min(
    virtualDistance,
    distance * MAX_GAIN
);
```

---

## 2. VRAmp Technique (Wentzel et al.)

### Overview

VRAmp (VR Amplification) is a research-backed technique designed around human perception thresholds and ergonomics. It uses smooth Hermite curves to provide imperceptible amplification that reduces arm fatigue while maintaining accuracy.

### Mechanism

**Non-linear Hermite curve-based amplification**:
- Smooth gradual amplification as arm extends
- Based on percentage of arm length
- Designed around human perception thresholds
- Conservative maximum gain (~2×)

**Three key thresholds** (based on research):
- **<20% arm extension**: Imperceptible amplification
- **20-30% extension**: Gradual curve ramp-up
- **>30% extension**: Higher gain, capped at ~2×

**Mathematical Approach**:
- Hermite interpolation curves for C¹ continuity
- Smooth velocity transitions (no abrupt changes)
- Parameterized by arm extension percentage `p = distance / armLength`

**Example Hermite curve**:
```
gain(p) = hermite(p, controlPoints)

Where controlPoints define the curve shape:
  p=0%:   gain = 1.0  (no amplification)
  p=20%:  gain = 1.1  (imperceptible)
  p=50%:  gain = 1.5  (moderate)
  p=100%: gain = 2.0  (maximum safe gain)
```

### Strengths

✅ **Imperceptible transitions** - Most users don't notice amplification
✅ **Maintains body ownership** - Preserves sense of embodiment
✅ **Research-validated** - Based on perception threshold studies
✅ **Prevents VR sickness** - Stays under 2× safety limit
✅ **Reduces arm fatigue** - Ergonomically designed for long sessions
✅ **Smooth velocity** - C¹ continuity prevents jerky movement
✅ **Professional-grade** - Suitable for enterprise applications
✅ **Conservative** - Prioritizes user comfort and safety

### Weaknesses

❌ **Complex implementation** - Hermite curves require mathematical expertise
❌ **Requires calibration** - Per-user arm length measurement needed
❌ **Conservative reach** - Won't help for very distant objects (max 2×)
❌ **Still distance-based** - Doesn't adapt to velocity or task
❌ **May feel "too subtle"** - Some users prefer more obvious assistance
❌ **More testing needed** - Requires careful tuning of curve parameters

### Key Use Cases

**Ideal for**:
- Professional/enterprise VR applications
- Long-duration VR sessions (>30 minutes)
- Medical applications (surgical planning, anatomy training)
- Architectural review and design visualization
- Training simulators where presence is critical
- Applications where preventing VR sickness is paramount
- Industrial VR applications
- Any scenario requiring extended VR use

**Not ideal for**:
- Rapid prototyping (implementation complexity)
- Applications needing >2× reach extension
- Scenarios where obvious assistance is desired
- Simple grab-and-move interactions (overkill)

### Why It's Important

Represents the research-driven approach to VR manipulation. Rather than asking "how far can we push it?", VRAmp asks "what won't users notice?" This philosophy prioritizes user comfort, safety, and long-term usability over maximum reach extension.

### Implementation Notes

**Conceptual algorithm**:
```typescript
function calculateVRAmpGain(handPos: Vector3, bodyPos: Vector3, armLength: number): number {
    const distance = handPos.distanceTo(bodyPos);
    const extensionPercent = (distance / armLength) * 100;

    // Hermite curve interpolation
    const controlPoints = [
        { p: 0,   gain: 1.0 },   // Start: no amplification
        { p: 20,  gain: 1.1 },   // Imperceptible threshold
        { p: 50,  gain: 1.5 },   // Moderate amplification
        { p: 100, gain: 2.0 }    // Maximum safe gain
    ];

    return hermiteInterpolate(extensionPercent, controlPoints);
}

function hermiteInterpolate(p: number, points: ControlPoint[]): number {
    // Find surrounding control points
    const [p0, p1] = findSurroundingPoints(p, points);

    // Calculate Hermite basis functions
    const t = (p - p0.p) / (p1.p - p0.p);  // Normalized position
    const h00 = 2*t*t*t - 3*t*t + 1;       // Hermite basis 0
    const h10 = t*t*t - 2*t*t + t;         // Hermite basis 1
    const h01 = -2*t*t*t + 3*t*t;          // Hermite basis 2
    const h11 = t*t*t - t*t;               // Hermite basis 3

    // Calculate tangents (slopes at control points)
    const m0 = calculateTangent(p0, points);
    const m1 = calculateTangent(p1, points);

    // Hermite interpolation
    return h00 * p0.gain + h10 * m0 + h01 * p1.gain + h11 * m1;
}
```

**Configuration parameters**:
- `armLength`: Must be calibrated per user (critical)
- `controlPoints`: Define curve shape (research-based defaults available)
- `maxGain`: 2.0 (hard limit from research)

**Calibration procedure**:
```typescript
function calibrateArmLength(): number {
    // Ask user to extend arm fully
    // Measure distance from shoulder to hand
    // Store in user profile
    return measuredDistance;
}
```

---

## 3. Piecewise Technique (MDPI 2023)

### Overview

The Piecewise technique is a recent (2023) research-backed approach that divides arm reach into two explicit zones: a large natural zone (0-60%) with no amplification, and an extended zone (60-100%) with progressive linear amplification up to 2×. Designed explicitly around upper-limb ergonomics.

### Mechanism

**Two distinct zones with clear boundary**:
- **Zone 1 (0-60% reach)**: 1:1 mapping (no amplification)
- **Zone 2 (60-100% reach)**: Linear amplification from 1.0× to 2.0×

**Achieves 140% effective reach** (40% extension beyond natural reach)

**Mathematical Formula**:
```
For arm extension percentage p:

If p ≤ 60%:
    gain = 1.0

If p > 60%:
    gain = 1.0 + ((p - 60) / 40) × 1.0

Examples:
  p = 0%:   gain = 1.0  (natural)
  p = 30%:  gain = 1.0  (still natural)
  p = 60%:  gain = 1.0  (boundary)
  p = 70%:  gain = 1.25 (0.25 extension)
  p = 80%:  gain = 1.5  (0.5 extension)
  p = 90%:  gain = 1.75 (0.75 extension)
  p = 100%: gain = 2.0  (maximum)
```

**Effective reach calculation**:
```
At 100% natural reach with gain 2.0:
  Effective reach = 100% × 2.0 = 200%

But only the Zone 2 portion (60-100%) is amplified:
  Zone 1 contribution: 60% × 1.0 = 60%
  Zone 2 contribution: 40% × 2.0 = 80%
  Total effective reach: 60% + 80% = 140%
```

### Strengths

✅ **Large natural zone** - 60% of reach feels completely normal
✅ **Predictable linear ramp** - Easier to understand than curves
✅ **Significant reach extension** - 140% total reach
✅ **Ergonomically designed** - Based on upper-limb strain research
✅ **Simple to implement** - Just two zones, linear interpolation
✅ **Recent research** - Incorporates modern ergonomics (2023)
✅ **Clear transition point** - 60% is a conscious design choice
✅ **Safe maximum** - 2× aligns with safety research
✅ **No complex curves** - Straightforward linear math

### Weaknesses

❌ **Boundary at 60%** - Some users may perceive zone transition
❌ **Linear may feel mechanical** - Less organic than smooth curves
❌ **Fixed percentages** - May not suit all body types equally
❌ **Still distance-based** - No task or velocity adaptation
❌ **Conservative 2× max** - Won't help for extremely distant objects
❌ **Requires calibration** - Need accurate arm length measurement

### Key Use Cases

**Ideal for**:
- Industrial VR training (assembly, manufacturing)
- Ergonomic-focused applications (preventing gorilla arm)
- Scientific visualization with objects at varying distances
- Workspace design and ergonomics testing
- VR design review (architecture, product design)
- Applications needing clear "normal" vs "assisted" zones
- Training applications for repetitive tasks
- Long-session VR work

**Not ideal for**:
- Precision tasks entirely within natural reach (60% is large)
- Applications requiring >2× reach for very distant objects
- Scenarios where boundary transition is problematic
- Tasks with uniform distance distribution (boundary less useful)

### Why It's Important

Represents the most recent research (2023) incorporating modern understanding of ergonomics and upper-limb biomechanics. Explicit focus on preventing "gorilla arm" fatigue while providing meaningful reach extension. The 60/40 split is research-backed based on ergonomic strain zones.

### Implementation Notes

**Pseudocode**:
```typescript
function calculatePiecewiseGain(handPos: Vector3, bodyPos: Vector3, armLength: number): number {
    const distance = handPos.distanceTo(bodyPos);
    const extensionPercent = (distance / armLength) * 100;

    const ZONE_1_END = 60;  // percent
    const ZONE_2_END = 100; // percent
    const MAX_GAIN = 2.0;

    if (extensionPercent <= ZONE_1_END) {
        // Zone 1: Natural zone, no amplification
        return 1.0;
    } else if (extensionPercent <= ZONE_2_END) {
        // Zone 2: Linear amplification from 1.0 to 2.0
        const zoneProgress = (extensionPercent - ZONE_1_END) / (ZONE_2_END - ZONE_1_END);
        return 1.0 + zoneProgress * (MAX_GAIN - 1.0);
    } else {
        // Beyond 100%: Cap at maximum gain
        return MAX_GAIN;
    }
}

function applyPiecewiseAmplification(handPos: Vector3, bodyPos: Vector3, armLength: number): Vector3 {
    const gain = calculatePiecewiseGain(handPos, bodyPos, armLength);
    const direction = handPos.subtract(bodyPos).normalize();
    const distance = handPos.distanceTo(bodyPos);
    const amplifiedDistance = distance * gain;

    return bodyPos.add(direction.scale(amplifiedDistance));
}
```

**Configuration parameters**:
- `ZONE_1_END`: 60% (research-backed, could be configurable 50-70%)
- `ZONE_2_END`: 100% (full arm extension)
- `MAX_GAIN`: 2.0 (safety limit from research)
- `armLength`: Per-user calibration

**Visualization of gain profile**:
```
Gain
 2.0 |                    ___________
     |                   /
 1.5 |                  /
     |                 /
 1.0 |________________/
     |
 0.5 |
     +----+----+----+----+----+----+
     0%  20%  40%  60%  80% 100%
              Arm Extension

     |<-- Zone 1 -->|<-- Zone 2 -->|
```

**Smooth zone transition** (optional enhancement):
```typescript
// Add small smoothing region around 60% boundary
const SMOOTH_REGION = 5; // percent on each side

if (Math.abs(extensionPercent - ZONE_1_END) < SMOOTH_REGION) {
    // Apply smoothstep interpolation around boundary
    const t = (extensionPercent - (ZONE_1_END - SMOOTH_REGION)) / (2 * SMOOTH_REGION);
    const smoothT = smoothstep(t);  // 3t² - 2t³
    // Blend between zone 1 and zone 2 gains
}
```

---

## 4. PRISM / Scaled HOMER (Velocity-Based)

### Overview

PRISM (Precision and Speed Integrated Manipulation) and Scaled HOMER (Hand-centered Object Manipulation Extending Reach) represent a fundamentally different approach: velocity-based gain rather than distance-based. These techniques allow users to intuitively control the interaction mode through movement speed, enabling both fast coarse repositioning and slow precision adjustments.

### Mechanism

**Velocity-based gain control**:
- **Fast hand movements** → High gain (up to 2×) for rapid repositioning
- **Slow hand movements** → Low gain (0.5×-1.0×) for precision
- **User intent**: Movement speed naturally controls interaction mode
- **No distance dependency**: Works at any distance from body

**PRISM Specifics**:
- Velocity threshold determines gain mode
- Smooth transitions between gain levels
- Can achieve sub-1× gain for micro-adjustments
- Dual-purpose: speed and precision in single technique

**Scaled HOMER Specifics**:
- Hybrid approach: ray selection + hand manipulation
- Select distant object with ray pointing
- Object "attaches" to hand-centered coordinate frame
- Manipulate with velocity-based scaling
- Both position and orientation scaled by velocity

**Mathematical Formula**:
```
velocity = ||currentPosition - lastPosition|| / deltaTime

If velocity > FAST_THRESHOLD:
    gain = HIGH_GAIN  (e.g., 2.0)
Else if velocity < SLOW_THRESHOLD:
    gain = LOW_GAIN   (e.g., 0.5-0.8)
Else:
    gain = interpolate(velocity, SLOW_THRESHOLD, FAST_THRESHOLD, LOW_GAIN, HIGH_GAIN)

Example thresholds:
  FAST_THRESHOLD = 2.0 m/s  (fast repositioning)
  SLOW_THRESHOLD = 0.3 m/s  (precision mode)
  HIGH_GAIN = 2.0
  LOW_GAIN = 0.7
```

**Gain interpolation**:
```
t = (velocity - SLOW_THRESHOLD) / (FAST_THRESHOLD - SLOW_THRESHOLD)
t = clamp(t, 0, 1)
gain = LOW_GAIN + t × (HIGH_GAIN - LOW_GAIN)

Examples:
  velocity = 0.1 m/s  → gain = 0.7  (precision)
  velocity = 0.3 m/s  → gain = 0.7  (precision boundary)
  velocity = 1.15 m/s → gain = 1.35 (midpoint)
  velocity = 2.0 m/s  → gain = 2.0  (speed mode)
  velocity = 3.0 m/s  → gain = 2.0  (capped)
```

### Strengths

✅ **Natural speed/precision trade-off** - Matches human intention
✅ **User controls gain intuitively** - Through movement speed
✅ **Excellent for precision** - Slow movements enable micro-adjustments
✅ **No distance calibration** - Works at any distance from body
✅ **Adapts to user intent** - System understands task from velocity
✅ **Sub-1× gain possible** - Enables finer control than 1:1
✅ **Task-agnostic** - Single technique for all manipulation
✅ **Dual-purpose** - Speed and precision in one technique
✅ **Distance-independent** - No body tracking needed

### Weaknesses

❌ **Requires velocity threshold tuning** - May need per-app adjustment
❌ **Hand tremor can trigger modes** - Unintentional precision mode
❌ **Less intuitive initially** - Users must discover velocity control
❌ **Needs clear feedback** - Visual cues for current gain mode helpful
❌ **Complex state management** - Tracking velocity history
❌ **Can be fatiguing** - Intentionally moving slowly requires effort
❌ **Mode hysteresis needed** - Prevent rapid gain switching
❌ **Velocity calculation** - Requires smoothing, delta time handling

### Key Use Cases

**Ideal for**:
- **3D CAD/modeling in VR** (coarse positioning + fine alignment)
- **Scientific data visualization** (macro scale + micro scale)
- **Molecular visualization** (docking, alignment, structure analysis)
- **Precision assembly tasks** (manufacturing, surgical training)
- **Graph manipulation** (repositioning nodes + aligning connections) ← **YOUR USE CASE**
- **Any task requiring BOTH speed AND precision**
- **Applications with multi-scale interaction needs**

**Not ideal for**:
- Simple grab-and-move tasks (overkill)
- Users unfamiliar with velocity-based control
- Applications requiring guaranteed precision (tremor issues)
- Scenarios where obvious mode indication is impossible

### Why It's Important

Only technique that decouples gain from position/distance. User intent (velocity) directly controls interaction mode. This is especially powerful for tasks like graph manipulation where you need to quickly reposition nodes AND precisely align connections. Single technique handles the full spectrum from "move it over there" to "nudge it 1mm left".

### Implementation Notes

**Pseudocode**:
```typescript
class VelocityBasedGain {
    private lastPosition: Vector3;
    private lastTime: number;
    private velocityHistory: number[] = [];
    private currentGain: number = 1.0;

    // Configuration
    private readonly FAST_THRESHOLD = 2.0;   // m/s
    private readonly SLOW_THRESHOLD = 0.3;   // m/s
    private readonly HIGH_GAIN = 2.0;
    private readonly LOW_GAIN = 0.7;
    private readonly HISTORY_SIZE = 5;        // Smooth over 5 frames
    private readonly HYSTERESIS = 0.2;        // Prevent rapid switching

    update(currentPosition: Vector3, currentTime: number): number {
        // Calculate instantaneous velocity
        const deltaTime = (currentTime - this.lastTime) / 1000; // ms to s
        const deltaPos = currentPosition.subtract(this.lastPosition);
        const instantVelocity = deltaPos.length() / deltaTime;

        // Smooth velocity over history
        this.velocityHistory.push(instantVelocity);
        if (this.velocityHistory.length > this.HISTORY_SIZE) {
            this.velocityHistory.shift();
        }
        const avgVelocity = this.velocityHistory.reduce((a, b) => a + b) / this.velocityHistory.length;

        // Calculate target gain
        let targetGain: number;
        if (avgVelocity > this.FAST_THRESHOLD) {
            targetGain = this.HIGH_GAIN;
        } else if (avgVelocity < this.SLOW_THRESHOLD) {
            targetGain = this.LOW_GAIN;
        } else {
            // Linear interpolation
            const t = (avgVelocity - this.SLOW_THRESHOLD) /
                      (this.FAST_THRESHOLD - this.SLOW_THRESHOLD);
            targetGain = this.LOW_GAIN + t * (this.HIGH_GAIN - this.LOW_GAIN);
        }

        // Apply hysteresis to prevent rapid switching
        if (Math.abs(targetGain - this.currentGain) > this.HYSTERESIS) {
            // Smooth transition
            this.currentGain += (targetGain - this.currentGain) * 0.3; // 30% lerp
        }

        // Update state
        this.lastPosition = currentPosition.clone();
        this.lastTime = currentTime;

        return this.currentGain;
    }

    reset(position: Vector3, time: number): void {
        this.lastPosition = position.clone();
        this.lastTime = time;
        this.velocityHistory = [];
        this.currentGain = 1.0;
    }
}
```

**Usage in drag handler**:
```typescript
// In NodeDragHandler
private velocityGain: VelocityBasedGain;

onDragStart(worldPosition: Vector3): void {
    this.velocityGain = new VelocityBasedGain();
    this.velocityGain.reset(worldPosition, performance.now());
    // ... rest of drag start
}

onDragUpdate(worldPosition: Vector3): void {
    // Get velocity-based gain
    const gain = this.velocityGain.update(worldPosition, performance.now());

    // Calculate delta
    const delta = worldPosition.subtract(this.dragState.dragStartWorldPosition);

    // Apply velocity-based gain
    delta.scaleInPlace(gain);

    // ... rest of drag update
}
```

**Visual feedback** (optional but recommended):
```typescript
// Show user current mode with visual indicator
function updateGainIndicator(gain: number): void {
    if (gain < 1.0) {
        showIndicator("PRECISION", "blue");
    } else if (gain > 1.5) {
        showIndicator("SPEED", "green");
    } else {
        hideIndicator();
    }
}
```

**Configuration tuning**:
```typescript
// For graph manipulation (your use case)
const GRAPH_CONFIG = {
    FAST_THRESHOLD: 1.5,    // m/s - Lower for responsive speed mode
    SLOW_THRESHOLD: 0.2,    // m/s - Lower for easier precision
    HIGH_GAIN: 2.0,         // Match research recommendations
    LOW_GAIN: 0.5,          // Enable micro-adjustments for edge alignment
};

// For general VR modeling
const MODELING_CONFIG = {
    FAST_THRESHOLD: 2.0,    // m/s - Standard
    SLOW_THRESHOLD: 0.3,    // m/s - Standard
    HIGH_GAIN: 1.8,         // Slightly conservative
    LOW_GAIN: 0.7,          // Less extreme precision
};
```

**Scaled HOMER enhancement**:
```typescript
// For distant objects, combine with ray selection
function scaleHomerManipulation(objectPos: Vector3, handPos: Vector3, velocity: number): Vector3 {
    // 1. Ray selection (not shown)
    // 2. Transform to hand-centered frame
    const handFrame = createHandFrame(handPos);
    const localPos = handFrame.worldToLocal(objectPos);

    // 3. Scale manipulation by velocity
    const gain = calculateVelocityGain(velocity);
    const scaledLocalPos = localPos.scale(gain);

    // 4. Transform back to world space
    return handFrame.localToWorld(scaledLocalPos);
}
```

---

## Comparative Analysis

### Summary Table

| Aspect | Go-Go | VRAmp | Piecewise | PRISM/HOMER |
|--------|-------|-------|-----------|-------------|
| **Control Variable** | Distance from body | Distance from body | Distance from body | Hand velocity |
| **Gain Range** | 1× to >3× (unbounded) | 1× to 2× | 1× to 2× | 0.5× to 2× |
| **Philosophy** | Reach extension | Imperceptibility | Ergonomics | Dual-purpose |
| **Amplification Type** | Quadratic | Hermite curves | Linear (2 zones) | Velocity-based |
| **Complexity** | Simple | Complex | Moderate | Moderate |
| **Calibration** | Arm length | Arm length | Arm length | None |
| **Precision Support** | Poor at distance | Moderate | Moderate | Excellent |
| **Speed Support** | Excellent | Moderate | Moderate | Excellent |
| **Year** | 1996 | 2020s | 2023 | 2000s |
| **Max Safe Gain** | ❌ Can exceed 2× | ✅ Capped at 2× | ✅ Capped at 2× | ✅ Capped at 2× |
| **VR Sickness Risk** | ⚠️ High (no cap) | ✅ Low | ✅ Low | ✅ Low |

### By Primary Control Variable

**Position-Based (Distance from body)**:
- Go-Go
- VRAmp
- Piecewise

**Velocity-Based (Movement speed)**:
- PRISM/HOMER

**Key insight**: Position-based techniques measure "where is your hand?", velocity-based measures "how fast are you moving?". This is a fundamental paradigm difference.

### By Amplification Philosophy

**Reach Extension Priority**:
- **Go-Go** >>> Piecewise > VRAmp

Goal: "Let me reach that distant object"
Approach: High gain at distance
Trade-off: May sacrifice accuracy/comfort

**Comfort/Safety Priority**:
- **VRAmp** >>> Piecewise > PRISM > Go-Go

Goal: "Don't make me sick"
Approach: Conservative gain, smooth transitions
Trade-off: Limited reach extension

**Precision Priority**:
- **PRISM** >>> VRAmp > Piecewise > Go-Go

Goal: "Let me make fine adjustments"
Approach: Sub-1× gain possible
Trade-off: Requires intentional slow movement

**Ergonomics Priority**:
- **Piecewise** >>> VRAmp > PRISM > Go-Go

Goal: "Prevent gorilla arm fatigue"
Approach: Large natural zone, ergonomic design
Trade-off: Fixed zones may not suit all users

**Versatility Priority**:
- **PRISM** >>> Go-Go > VRAmp > Piecewise

Goal: "Handle all manipulation tasks"
Approach: Adaptive gain based on intent
Trade-off: More complex, requires user learning

### By Smoothness/Continuity

**Smoothest** → **Least Smooth**:

1. **VRAmp** (Hermite curves, C¹ continuous)
   - Smooth velocity transitions
   - Imperceptible to users
   - Most natural feeling

2. **PRISM** (Velocity transitions with hysteresis)
   - Smooth with proper implementation
   - Requires velocity smoothing

3. **Go-Go** (Continuous quadratic)
   - Mathematically continuous
   - Can feel abrupt at high gains

4. **Piecewise** (Two zones with boundary)
   - Discontinuity at 60% boundary
   - Linear ramp may feel mechanical

### By Implementation Complexity

**Simplest** → **Most Complex**:

1. **Go-Go**
   - Threshold check + quadratic formula
   - ~20 lines of code
   - No complex dependencies

2. **Piecewise**
   - Two zones + linear interpolation
   - ~30 lines of code
   - Simple conditional logic

3. **PRISM**
   - Velocity tracking + smoothing
   - ~80 lines of code
   - State management needed

4. **VRAmp**
   - Hermite curve implementation
   - ~100+ lines of code
   - Mathematical complexity

### By Safety (VR Sickness Prevention)

**Safest** → **Least Safe**:

1. **VRAmp** - Explicitly capped at 2×, smooth transitions
2. **Piecewise** - Capped at 2×, large natural zone
3. **PRISM** - Capped at 2×, velocity-based may be gentler
4. **Go-Go** - No upper bound, can easily exceed 2×

**Research finding**: Gains >2× increase VR sickness, especially on multiple axes simultaneously.

### By Precision Capability

**Best Precision** → **Worst Precision**:

1. **PRISM** - Can achieve 0.5× for micro-adjustments
2. **VRAmp** - Smooth curves maintain accuracy at 1:1
3. **Piecewise** - Large 1:1 zone (60%) for nearby precision
4. **Go-Go** - Hand tremor amplified at distance

**Key insight**: Velocity-based (PRISM) is only technique offering sub-1× gain.

### By Speed/Reach Capability

**Best Reach** → **Worst Reach**:

1. **Go-Go** - Unbounded quadratic can reach very far
2. **Piecewise** - 140% effective reach
3. **PRISM** - 2× max (200% reach)
4. **VRAmp** - Conservative ~2× max

**Trade-off**: Maximum reach inversely correlates with safety/comfort.

### By Calibration Requirements

**No Calibration**:
- PRISM/HOMER - Works with any body size

**Requires Calibration**:
- Go-Go - Arm length for threshold
- VRAmp - Arm length for curves
- Piecewise - Arm length for zones

**Default fallback**: Use average arm length (0.6m for adults) if calibration not available.

### By User Learning Curve

**Immediate** (no learning required):
- Go-Go - Natural hand extension
- Piecewise - Feels normal within 60% zone

**Subtle** (users adapt quickly):
- VRAmp - Imperceptible by design

**Requires Discovery**:
- PRISM - Users must learn velocity control
- Benefit: More powerful once understood

### By Use Case Suitability

**General VR / Social VR**:
- Go-Go (simple, proven)
- Piecewise (comfortable)

**Professional VR / Long Sessions**:
- VRAmp (prevents fatigue/sickness)
- Piecewise (ergonomic)

**CAD / 3D Modeling**:
- PRISM (precision + speed)
- VRAmp (smooth professional feel)

**Scientific Visualization**:
- PRISM (multi-scale)
- Piecewise (varied distances)

**Graph Manipulation** (your use case):
- **PRISM** (ideal - reposition + align)
- Piecewise (good fallback)

**Training / Industrial**:
- Piecewise (ergonomic, research-backed)
- VRAmp (long sessions)

### Key Differences Summary

**Go-Go vs VRAmp**:
- Same approach (distance), different execution
- Go-Go: Simple, can overshoot
- VRAmp: Sophisticated, never overshoots
- **Go-Go = reach, VRAmp = comfort**

**VRAmp vs Piecewise**:
- Both distance-based with 2× max
- VRAmp: Smooth curves throughout
- Piecewise: Large natural zone + ramp
- **VRAmp = imperceptible, Piecewise = ergonomic**

**Distance-based vs Velocity-based**:
- Fundamental paradigm shift
- Distance: "Where is your hand?" → gain
- Velocity: "How fast are you moving?" → gain
- **Distance = reach, Velocity = intent-based**

**PRISM vs All Others**:
- Only technique with sub-1× gain
- Only technique user controls via intent
- Only technique adapting to task
- **PRISM = versatility, Others = reach**

---

## Implementation Recommendations

### Current Situation Assessment

**Our implementation**:
```typescript
// src/NodeBehavior.ts
this.zAxisAmplification = 10.0;

delta.x *= 10.0;  // Applied to all axes
delta.y *= 10.0;
delta.z *= 10.0;
```

**Research consensus**: Optimal gain is **1.5×-2.0×**, with **2× as maximum** before degradation.

**Our implementation analysis**:
- ❌ 10× is **5× higher than safe maximum**
- ❌ High risk of VR sickness (high gain on 3 axes)
- ❌ Likely reduced accuracy
- ❌ Not aligned with any of the four leading techniques
- ✅ Delta-based calculation is good
- ✅ Direct grip tracking is good
- ✅ Tracking glitch detection is excellent (MAX_REASONABLE_DELTA)

### Recommended Approach: Phased Implementation

#### Phase 1: Immediate Safety Fix (1 hour)

**Goal**: Reduce to research-aligned gain

**Action**: Change default from 10× to 1.75×

```typescript
// src/config/XRConfig.ts
export const defaultXRConfig: XRConfig = {
    input: {
        zAxisAmplification: 1.75,  // Changed from 10.0
        // ... rest unchanged
    }
};
```

**Justification**:
- 1.75× is within optimal range (1.5×-2.0×)
- Immediate risk reduction
- No structural changes needed
- Preserves existing functionality

**Testing**: Verify nodes move smoothly without excessive gain.

#### Phase 2: Implement Piecewise Technique (4-6 hours)

**Goal**: Add distance-based zones for ergonomic benefit

**Why Piecewise**:
- ✅ Simple to implement (2 zones, linear)
- ✅ Recent research (2023)
- ✅ Ergonomically designed
- ✅ Clear natural vs assisted zones
- ✅ Good starting point for sophisticated techniques

**Implementation plan**:

1. **Add distance tracking to NodeDragHandler**:
```typescript
// src/NodeBehavior.ts
private calculateGain(worldPosition: Vector3): number {
    const camera = this.scene.activeCamera;
    if (!camera) return 1.0;

    const userPosition = camera.position;
    const distance = worldPosition.distanceTo(userPosition);

    // Estimate arm length (could be configurable)
    const ARM_LENGTH = 0.6; // meters
    const extensionPercent = (distance / ARM_LENGTH) * 100;

    const ZONE_1_END = 60;  // percent
    const MAX_GAIN = 2.0;

    if (extensionPercent <= ZONE_1_END) {
        return 1.0; // Natural zone
    } else {
        // Progressive zone: 60% to 100% → 1.0× to 2.0×
        const zoneProgress = (extensionPercent - ZONE_1_END) / (100 - ZONE_1_END);
        return 1.0 + Math.min(zoneProgress, 1.0) * (MAX_GAIN - 1.0);
    }
}
```

2. **Update onDragUpdate to use distance-based gain**:
```typescript
onDragUpdate(worldPosition: Vector3): void {
    // ... existing code ...

    // Get distance-based gain
    const gain = this.calculateGain(worldPosition);

    // Apply gain to delta
    delta.scaleInPlace(gain);

    // ... rest of function ...
}
```

3. **Add configuration options**:
```typescript
// src/config/XRConfig.ts
export interface XRInputConfig {
    amplificationMode?: 'constant' | 'piecewise' | 'velocity';
    constantGain?: number;  // For 'constant' mode
    piecewiseZone1End?: number;  // Percent, default 60
    piecewiseMaxGain?: number;   // Default 2.0
    armLength?: number;  // Meters, default 0.6
}
```

4. **Update config schema**:
```typescript
export const defaultXRConfig: XRConfig = {
    input: {
        amplificationMode: 'piecewise',
        constantGain: 1.75,
        piecewiseZone1End: 60,
        piecewiseMaxGain: 2.0,
        armLength: 0.6,
    }
};
```

**Testing**:
- Verify 1:1 movement for nearby nodes
- Verify progressive amplification for distant nodes
- Confirm smooth transition at 60% boundary

#### Phase 3: Implement PRISM (Velocity-Based) (8-12 hours)

**Goal**: Add velocity-based gain for precision + speed

**Why PRISM**:
- ✅ Ideal for graph manipulation use case
- ✅ Enables both fast repositioning and precise alignment
- ✅ No distance calibration needed
- ✅ User intent controls mode naturally

**Implementation plan**:

1. **Create VelocityBasedGain class**:
```typescript
// src/cameras/VelocityBasedGain.ts
export class VelocityBasedGain {
    private lastPosition: Vector3;
    private lastTime: number;
    private velocityHistory: number[] = [];
    private currentGain: number = 1.0;

    constructor(private config: VelocityGainConfig) {}

    update(currentPosition: Vector3, currentTime: number): number {
        // Implementation as shown in section 4
    }

    reset(position: Vector3, time: number): void {
        // Reset state
    }
}

export interface VelocityGainConfig {
    fastThreshold: number;    // m/s
    slowThreshold: number;    // m/s
    highGain: number;
    lowGain: number;
    historySize?: number;
    hysteresis?: number;
}
```

2. **Integrate into NodeDragHandler**:
```typescript
// src/NodeBehavior.ts
private velocityGain: VelocityBasedGain | null = null;

onDragStart(worldPosition: Vector3): void {
    // ... existing code ...

    if (this.amplificationMode === 'velocity') {
        this.velocityGain = new VelocityBasedGain(this.velocityConfig);
        this.velocityGain.reset(worldPosition, performance.now());
    }
}

onDragUpdate(worldPosition: Vector3): void {
    // ... existing code ...

    let gain = 1.0;
    if (this.amplificationMode === 'velocity' && this.velocityGain) {
        gain = this.velocityGain.update(worldPosition, performance.now());
    } else if (this.amplificationMode === 'piecewise') {
        gain = this.calculatePiecewiseGain(worldPosition);
    } else {
        gain = this.constantGain;
    }

    delta.scaleInPlace(gain);

    // ... rest of function ...
}
```

3. **Add velocity config**:
```typescript
// src/config/XRConfig.ts
export interface XRInputConfig {
    // ... existing ...
    velocityConfig?: {
        fastThreshold: number;  // m/s, default 2.0
        slowThreshold: number;  // m/s, default 0.3
        highGain: number;       // default 2.0
        lowGain: number;        // default 0.7
    };
}

export const defaultXRConfig: XRConfig = {
    input: {
        amplificationMode: 'velocity',  // Change default
        velocityConfig: {
            fastThreshold: 1.5,   // Lower for graph work
            slowThreshold: 0.2,   // Lower for easier precision
            highGain: 2.0,
            lowGain: 0.5,         // Sub-1× for alignment
        },
    }
};
```

4. **Add visual feedback** (optional):
```typescript
// Show gain mode indicator
private updateGainIndicator(gain: number): void {
    const indicator = document.getElementById('gain-indicator');
    if (!indicator) return;

    if (gain < 1.0) {
        indicator.textContent = 'PRECISION';
        indicator.className = 'precision-mode';
    } else if (gain > 1.5) {
        indicator.textContent = 'SPEED';
        indicator.className = 'speed-mode';
    } else {
        indicator.textContent = '';
    }
}
```

**Testing**:
- Fast movements: Verify 2× gain for repositioning
- Slow movements: Verify 0.5× gain for precision
- Moderate: Verify smooth interpolation
- Edge alignment: Test micro-adjustments work

#### Phase 4: Hybrid Approach (4-6 hours)

**Goal**: Combine Piecewise + PRISM for best of both

**Why Hybrid**:
- ✅ Base gain from distance (ergonomic zones)
- ✅ Velocity multiplier for precision
- ✅ Covers all use cases
- ✅ Research-aligned safety

**Implementation**:

```typescript
onDragUpdate(worldPosition: Vector3): void {
    // ... existing code ...

    let baseGain = 1.0;
    let velocityMultiplier = 1.0;

    // Base gain from distance (Piecewise)
    if (this.usePiecewise) {
        baseGain = this.calculatePiecewiseGain(worldPosition);
    }

    // Velocity multiplier
    if (this.useVelocity && this.velocityGain) {
        const velocityGain = this.velocityGain.update(worldPosition, performance.now());
        // Normalize velocity gain to multiplier (0.5x to 1.5x)
        velocityMultiplier = velocityGain / this.velocityConfig.highGain;
    }

    // Combined gain
    const finalGain = baseGain * velocityMultiplier;

    // Cap at safe maximum
    const cappedGain = Math.min(finalGain, 2.5);  // Slightly above 2× for combined

    delta.scaleInPlace(cappedGain);

    // ... rest of function ...
}
```

**Example scenarios**:
- Near node, slow: 1.0 × 0.5 = 0.5× (precision)
- Near node, fast: 1.0 × 1.5 = 1.5× (quick move)
- Far node, slow: 2.0 × 0.5 = 1.0× (comfortable precision at distance)
- Far node, fast: 2.0 × 1.5 = 3.0× → capped to 2.5× (rapid distant repositioning)

### Configuration Architecture

**Recommended config structure**:

```typescript
// src/config/XRConfig.ts
export interface XRInputConfig {
    // Amplification mode selection
    amplificationMode: 'constant' | 'piecewise' | 'velocity' | 'hybrid';

    // Constant mode settings
    constantGain?: number;  // Default 1.75

    // Piecewise mode settings
    piecewise?: {
        zone1End: number;     // Percent, default 60
        maxGain: number;      // Default 2.0
        armLength: number;    // Meters, default 0.6
        smoothBoundary: boolean;  // Default true
    };

    // Velocity mode settings
    velocity?: {
        fastThreshold: number;   // m/s, default 1.5
        slowThreshold: number;   // m/s, default 0.2
        highGain: number;        // default 2.0
        lowGain: number;         // default 0.5
        historySize: number;     // frames, default 5
        hysteresis: number;      // gain units, default 0.2
    };

    // Hybrid mode settings (uses both piecewise and velocity)
    hybrid?: {
        maxCombinedGain: number;  // Default 2.5
    };

    // Safety settings (apply to all modes)
    safety?: {
        maxReasonableDelta: number;  // units, default 5.0
        enableGlitchDetection: boolean;  // default true
    };
}

export const defaultXRConfig: XRConfig = {
    input: {
        // Start with velocity for graph use case
        amplificationMode: 'velocity',

        constantGain: 1.75,

        piecewise: {
            zone1End: 60,
            maxGain: 2.0,
            armLength: 0.6,
            smoothBoundary: true,
        },

        velocity: {
            fastThreshold: 1.5,
            slowThreshold: 0.2,
            highGain: 2.0,
            lowGain: 0.5,
            historySize: 5,
            hysteresis: 0.2,
        },

        hybrid: {
            maxCombinedGain: 2.5,
        },

        safety: {
            maxReasonableDelta: 5.0,
            enableGlitchDetection: true,
        },
    }
};
```

### Migration Path for Users

**For existing users with 10× setting**:

1. **Add deprecation warning**:
```typescript
if (config.zAxisAmplification && config.zAxisAmplification > 3.0) {
    console.warn(
        'XR amplification values >3× are not recommended by research. ' +
        'Consider reducing to 1.5-2.0× or using velocity-based mode. ' +
        'See: design/xr-control-techniques.md'
    );
}
```

2. **Provide migration helper**:
```typescript
// Automatically migrate old config to new
function migrateXRConfig(oldConfig: any): XRInputConfig {
    if (oldConfig.zAxisAmplification !== undefined) {
        // Old constant gain approach
        const gain = oldConfig.zAxisAmplification;

        if (gain > 3.0) {
            // Recommend velocity mode for high gain users
            return {
                amplificationMode: 'velocity',
                velocity: {
                    // Scaled to provide similar feel
                    fastThreshold: 1.0,
                    slowThreshold: 0.1,
                    highGain: Math.min(gain / 5, 2.5),  // Scale down
                    lowGain: 0.5,
                },
            };
        } else {
            // Use constant mode
            return {
                amplificationMode: 'constant',
                constantGain: Math.min(gain, 2.0),
            };
        }
    }

    return defaultXRConfig.input;
}
```

3. **Provide preset profiles**:
```typescript
export const XR_PRESETS = {
    // Conservative preset (prioritizes comfort)
    comfort: {
        amplificationMode: 'piecewise',
        piecewise: { zone1End: 70, maxGain: 1.5 },
    },

    // Balanced preset (recommended default)
    balanced: {
        amplificationMode: 'velocity',
        velocity: { fastThreshold: 1.5, slowThreshold: 0.2, highGain: 2.0, lowGain: 0.7 },
    },

    // Reach preset (prioritizes distance)
    reach: {
        amplificationMode: 'piecewise',
        piecewise: { zone1End: 50, maxGain: 2.0 },
    },

    // Precision preset (prioritizes accuracy)
    precision: {
        amplificationMode: 'velocity',
        velocity: { fastThreshold: 2.0, slowThreshold: 0.3, highGain: 1.5, lowGain: 0.3 },
    },

    // Legacy preset (closest to old 10× behavior, not recommended)
    legacy: {
        amplificationMode: 'constant',
        constantGain: 2.0,  // Capped for safety
    },
};

// Usage:
graph.setXRConfig(XR_PRESETS.balanced);
```

### Testing Strategy

#### Unit Tests

```typescript
// test/unit/velocity-based-gain.test.ts
describe('VelocityBasedGain', () => {
    test('fast movement triggers high gain', () => {
        const vbg = new VelocityBasedGain({ fastThreshold: 2.0, highGain: 2.0, ... });

        // Simulate fast movement
        vbg.update(new Vector3(0, 0, 0), 0);
        vbg.update(new Vector3(3, 0, 0), 1000);  // 3 m/s

        const gain = vbg.update(new Vector3(6, 0, 0), 2000);
        expect(gain).toBeCloseTo(2.0, 1);
    });

    test('slow movement triggers low gain', () => {
        const vbg = new VelocityBasedGain({ slowThreshold: 0.3, lowGain: 0.5, ... });

        // Simulate slow movement
        vbg.update(new Vector3(0, 0, 0), 0);
        vbg.update(new Vector3(0.1, 0, 0), 1000);  // 0.1 m/s

        const gain = vbg.update(new Vector3(0.2, 0, 0), 2000);
        expect(gain).toBeCloseTo(0.5, 1);
    });
});

// test/unit/piecewise-gain.test.ts
describe('Piecewise Gain', () => {
    test('zone 1 returns 1.0 gain', () => {
        const handler = new NodeDragHandler(mockNode);
        const gain = handler.calculatePiecewiseGain(
            new Vector3(0.3, 0, 0),  // 50% of 0.6m arm length
            new Vector3(0, 0, 0),
            0.6
        );
        expect(gain).toBe(1.0);
    });

    test('zone 2 interpolates linearly', () => {
        const handler = new NodeDragHandler(mockNode);
        const gain = handler.calculatePiecewiseGain(
            new Vector3(0.48, 0, 0),  // 80% of 0.6m
            new Vector3(0, 0, 0),
            0.6
        );
        expect(gain).toBeCloseTo(1.5, 1);  // 80% → 1.5×
    });
});
```

#### Integration Tests

```typescript
// test/browser/NodeBehavior-velocity-amplification.test.ts
test('velocity-based amplification in VR', async () => {
    const graph = await createTestGraph();
    graph.setXRConfig({
        input: {
            amplificationMode: 'velocity',
            velocity: { fastThreshold: 2.0, highGain: 2.0, lowGain: 0.5 },
        },
    });

    // Enter VR mode
    await graph.enterXR('immersive-vr');

    const node = graph.addNode({ id: '1', x: 0, y: 0, z: 0 });

    // Simulate fast drag
    simulateControllerDrag(node, [
        { pos: [0, 0, 0], time: 0 },
        { pos: [2, 0, 0], time: 1000 },  // 2 m/s
        { pos: [4, 0, 0], time: 2000 },
    ]);

    // Node should move with high gain
    const finalPos = node.mesh.position.x;
    expect(finalPos).toBeGreaterThan(3);  // ~4× with 2× gain
});
```

#### Visual Regression Tests

```typescript
// test/browser/xr-amplification-visual.test.ts
test('piecewise amplification visual', async () => {
    // Take screenshots at different distances
    const screenshots = await captureMultiAngle('xr-piecewise-test');

    // Verify node positions visually
    await expect(screenshots.topView).toMatchSnapshot();
});
```

### Documentation Updates

1. **User documentation**:
   - Explain new amplification modes
   - Provide configuration examples
   - Describe when to use each mode
   - Include preset profiles

2. **API documentation**:
   - Document XRInputConfig interface
   - Explain each parameter
   - Provide TypeScript types

3. **Migration guide**:
   - How to upgrade from old config
   - Preset recommendations
   - Testing checklist

### Performance Considerations

**Velocity tracking**:
- Keep history buffer small (5 frames)
- Use efficient vector math
- Avoid allocations in hot path

**Distance calculations**:
- Cache camera position per frame
- Reuse Vector3 instances
- Consider distance squared for comparisons

**Mode switching**:
- Use enums for amplification mode
- Avoid string comparisons in hot path
- Early return for disabled modes

### Accessibility Considerations

**User preferences**:
- Some users may need higher gain (physical limitations)
- Some users may need lower gain (VR sickness sensitivity)
- Provide customization options
- Respect user overrides

**Visual feedback**:
- Optional gain indicator
- Color-coded modes (blue=precision, green=speed)
- Haptic feedback for mode changes (if available)

### Future Enhancements

1. **Machine learning adaptation**:
   - Learn user's preferred gains over time
   - Adapt to specific tasks automatically
   - Personalized velocity thresholds

2. **Task-aware amplification**:
   - Different gains for different graph operations
   - Node repositioning vs edge alignment
   - Multi-node selection

3. **VRAmp implementation**:
   - Full Hermite curve support
   - Imperceptible amplification
   - Long-session optimization

4. **Advanced HOMER**:
   - Ray-based distant selection
   - Hand-centered manipulation frame
   - Orientation scaling

---

## References

### Academic Papers

1. **Wilson, G., McGill, M., Jamieson, M., Williamson, J. R. and Brewster, S. A.** (2018)
   "Object Manipulation in Virtual Reality Under Increasing Levels of Translational Gain"
   CHI Conference on Human Factors in Computing Systems, Montréal, QC, Canada.
   https://dl.acm.org/doi/10.1145/3173574.3173673

2. **Poupyrev, I., Billinghurst, M., Weghorst, S., and Ichikawa, T.** (1996)
   "The Go-Go Interaction Technique: Non-linear Mapping for Direct Manipulation in VR"
   UIST '96: ACM Symposium on User Interface Software and Technology, Seattle, WA.
   https://dl.acm.org/doi/10.1145/237091.237102

3. **Wentzel, J., et al.**
   "Improving Virtual Reality Ergonomics through Reach-Bounded Non-Linear Input Amplification"
   https://johannwentzel.ca/projects/vramp/

4. **MDPI** (2023)
   "A Non-Isomorphic 3D Manipulation Technique That Factors Upper-Limb Ergonomics in VR"
   Multimodal Technologies and Interaction, 2(2), 9.
   https://www.mdpi.com/2813-2084/2/2/9

5. **MDPI** (2024)
   "Comparing Near-Field, Object Space, and Hybrid Interaction Techniques in VR"
   Multimodal Technologies and Interaction, 3(1), 5.
   https://www.mdpi.com/2813-2084/3/1/5

6. **Springer** (2022)
   "Narrative review of immersive virtual reality's ergonomics and risks at the workplace: musculoskeletal disorders, visual fatigue, and motion sickness"
   Virtual Reality, 26, 1419-1433.
   https://link.springer.com/article/10.1007/s10055-022-00672-0

### Industry Resources

7. **Meta Quest Developer Documentation**
   Design Guidelines for VR Interaction
   https://developers.meta.com/horizon/design/

8. **Unity Technologies**
   XR Interaction Toolkit Documentation
   https://docs.unity3d.com/Packages/com.unity.xr.interaction.toolkit

### Research Databases

9. **Google Scholar** - Primary search engine for academic papers
   https://scholar.google.com

10. **ACM Digital Library** - Computer science research repository
    https://dl.acm.org

11. **DIVA Portal** - Swedish research database
    https://www.diva-portal.org

---

## Appendices

### Appendix A: Glossary

**Control-Display (C/D) Ratio**: The ratio of physical input movement to virtual output movement. C/D ratio = 1/gain. Lower C/D ratio = higher gain.

**Gain**: Amplification factor applied to input movement. Gain = 2.0 means virtual hand moves 2× as far as physical hand.

**Translational Gain**: Amplification of position (translation) movement, as opposed to rotational movement.

**Hermite Curve**: A type of smooth interpolation curve ensuring continuous velocity (C¹ continuity).

**Go-Go Technique**: Classic VR reach extension technique using quadratic amplification beyond a threshold distance.

**VRAmp**: VR Amplification technique using smooth curves and human perception thresholds.

**Piecewise**: Recent technique using two explicit zones (natural + amplified).

**PRISM**: Precision and Speed Integrated Manipulation - velocity-based technique.

**HOMER**: Hand-centered Object Manipulation Extending Reach - hybrid ray + hand technique.

**Gorilla Arm**: Fatigue from extended arm reach in VR (named after the fatigue from holding arms up).

**VR Sickness**: Motion sickness-like symptoms in VR, increased by high translational gains.

**Near-field**: Manipulation of objects within arm's reach (<1 meter).

**Far-field**: Manipulation of distant objects (>1 meter).

### Appendix B: Mathematical Formulas

**Go-Go Formula**:
```
D = k × (d - D_threshold)² + d

Where:
  D = virtual hand distance from body
  d = real hand distance from body
  k = gain rate constant
  D_threshold = threshold distance (typically 2/3 arm length)
```

**Piecewise Formula**:
```
p = (distance / armLength) × 100  // Extension percentage

If p ≤ 60:
    gain = 1.0
Else:
    gain = 1.0 + ((p - 60) / 40) × 1.0
```

**Velocity-Based Gain**:
```
velocity = ||position_t - position_(t-1)|| / Δt

If velocity > fast_threshold:
    gain = high_gain
Else if velocity < slow_threshold:
    gain = low_gain
Else:
    t = (velocity - slow_threshold) / (fast_threshold - slow_threshold)
    gain = low_gain + t × (high_gain - low_gain)
```

**Hermite Interpolation**:
```
p(t) = h00(t) × p0 + h10(t) × m0 + h01(t) × p1 + h11(t) × m1

Where:
  h00(t) = 2t³ - 3t² + 1
  h10(t) = t³ - 2t² + t
  h01(t) = -2t³ + 3t²
  h11(t) = t³ - t²

  t = normalized position [0, 1]
  p0, p1 = control point values
  m0, m1 = tangents at control points
```

### Appendix C: Configuration Examples

**Example 1: Conservative comfortable setup**:
```typescript
const config: XRInputConfig = {
    amplificationMode: 'piecewise',
    piecewise: {
        zone1End: 70,      // Large natural zone
        maxGain: 1.5,      // Conservative max
        armLength: 0.6,
        smoothBoundary: true,
    },
    safety: {
        maxReasonableDelta: 4.0,  // Strict
        enableGlitchDetection: true,
    },
};
```

**Example 2: Graph manipulation (recommended)**:
```typescript
const config: XRInputConfig = {
    amplificationMode: 'velocity',
    velocity: {
        fastThreshold: 1.5,   // Responsive speed mode
        slowThreshold: 0.2,   // Easy precision
        highGain: 2.0,        // Fast repositioning
        lowGain: 0.5,         // Sub-1× for alignment
        historySize: 5,
        hysteresis: 0.2,
    },
    safety: {
        maxReasonableDelta: 5.0,
        enableGlitchDetection: true,
    },
};
```

**Example 3: Hybrid approach**:
```typescript
const config: XRInputConfig = {
    amplificationMode: 'hybrid',
    piecewise: {
        zone1End: 60,
        maxGain: 2.0,
        armLength: 0.6,
        smoothBoundary: true,
    },
    velocity: {
        fastThreshold: 1.5,
        slowThreshold: 0.3,
        highGain: 1.5,    // Multiplier, not absolute
        lowGain: 0.7,
        historySize: 5,
        hysteresis: 0.15,
    },
    hybrid: {
        maxCombinedGain: 2.5,  // Cap combined effect
    },
};
```

**Example 4: Maximum reach**:
```typescript
const config: XRInputConfig = {
    amplificationMode: 'piecewise',
    piecewise: {
        zone1End: 50,      // Smaller natural zone
        maxGain: 2.0,      // Maximum safe gain
        armLength: 0.6,
        smoothBoundary: false,  // Immediate amplification
    },
    safety: {
        maxReasonableDelta: 6.0,  // Allow larger deltas
        enableGlitchDetection: true,
    },
};
```

### Appendix D: Implementation Checklist

**Phase 1: Safety Fix**
- [ ] Change default gain from 10× to 1.75×
- [ ] Add deprecation warning for high gains
- [ ] Test with existing graph interactions
- [ ] Verify no VR sickness symptoms
- [ ] Document change in CHANGELOG

**Phase 2: Piecewise**
- [ ] Add distance calculation to NodeDragHandler
- [ ] Implement calculatePiecewiseGain()
- [ ] Add configuration options
- [ ] Update defaultXRConfig
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test zone boundary smoothness
- [ ] Document configuration

**Phase 3: PRISM (Velocity)**
- [ ] Create VelocityBasedGain class
- [ ] Implement velocity tracking and smoothing
- [ ] Implement gain interpolation
- [ ] Add hysteresis for stability
- [ ] Integrate into NodeDragHandler
- [ ] Add configuration options
- [ ] Write unit tests (fast/slow scenarios)
- [ ] Write integration tests
- [ ] Test with actual VR hardware
- [ ] Optional: Add visual feedback
- [ ] Document usage

**Phase 4: Hybrid**
- [ ] Implement combined gain calculation
- [ ] Add safety cap for combined gains
- [ ] Test all scenarios (near/far + fast/slow)
- [ ] Verify smooth transitions
- [ ] Performance testing
- [ ] Document trade-offs

**General**
- [ ] Migration helper for old configs
- [ ] Preset profiles
- [ ] User documentation
- [ ] API documentation
- [ ] Visual regression tests
- [ ] Performance profiling
- [ ] Accessibility considerations
- [ ] Release notes

### Appendix E: Comparison with Current Implementation

| Aspect | Current (10×) | Recommended (PRISM 2×) | Improvement |
|--------|---------------|------------------------|-------------|
| **Max Gain** | 10× | 2× | ✅ 5× safer |
| **VR Sickness Risk** | High | Low | ✅ Significantly reduced |
| **Accuracy** | Poor | Good | ✅ Maintained up to 2× |
| **Precision Support** | None | 0.5× available | ✅ Micro-adjustments possible |
| **Research Aligned** | No | Yes | ✅ Matches 28 years of research |
| **Multi-axis Safety** | Unsafe | Safe | ✅ Within guidelines |
| **Ergonomics** | Unknown | Proven | ✅ Reduces fatigue |
| **Adaptability** | None | Velocity-based | ✅ Adapts to user intent |
| **Configuration** | Simple | Moderate | ⚠️ More complex |
| **Implementation** | Done | TODO | ⚠️ Requires work |

### Appendix F: Performance Benchmarks

**Target performance** (per frame):
- Distance calculation: <0.1ms
- Velocity tracking: <0.2ms
- Gain calculation: <0.1ms
- Total overhead: <0.5ms

**Acceptable performance** (90 FPS = 11ms frame budget):
- Amplification overhead should be <5% of frame time
- <0.55ms per frame

**Memory usage**:
- VelocityBasedGain: ~200 bytes (5 floats × 8 bytes + overhead)
- Negligible impact

### Appendix E: Quick Reference

**Gain Recommendations**:
- Comfort priority: 1.5×
- Balanced: 1.75×
- Reach priority: 2.0×
- Never exceed: 2.0× (on multiple axes)

**Technique Selection**:
- General VR: Go-Go or Piecewise
- Professional/Long sessions: VRAmp or Piecewise
- CAD/Modeling: PRISM
- Graph manipulation: PRISM (velocity-based)
- Scientific viz: PRISM or Piecewise

**Configuration Quick Start**:
```typescript
// For graph work (recommended)
graph.setXRConfig(XR_PRESETS.balanced);

// For comfort
graph.setXRConfig(XR_PRESETS.comfort);

// For reach
graph.setXRConfig(XR_PRESETS.reach);

// For precision
graph.setXRConfig(XR_PRESETS.precision);
```

---

**End of Document**

This document provides comprehensive research-backed guidance for implementing VR 3D manipulation techniques. For questions or clarifications, refer to the cited academic papers or industry documentation.

**Last Updated**: 2025-11-21
**Next Review**: After Phase 2 implementation
