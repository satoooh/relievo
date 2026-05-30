# Study 002: Interactive Point-Field Directions

Relievo should stay a 2.5D relief plane in navigable 3D space. The stronger direction is not adding more depth models, but giving the point field a more authored behavior: the viewer should feel that each point is part of a responsive material.

## References

- [CLOUDS](https://cloudsdocumentary.com/) pairs real-time visual systems with an openFrameworks documentary format. The relevant lesson is that the interface can be both a viewing surface and an executable artwork.
- [ScanLAB Projects](https://scanlabprojects.co.uk/) treats precise spatial scans as an aesthetic material, not just measurement data. The useful cue is the tension between documentary source and abstract point texture.
- [Depthkit](https://www.depthkit.tv/) frames volumetric capture as a workflow for spatial video. For Relievo, the takeaway is to keep the source legible while making the depth surface feel live.
- [Refik Anadol Studio](https://refikanadol.com/works/) positions data, machine intelligence, and architecture as public-scale media art. The useful cue is not the scale, but the idea of motion systems that feel like authored data behavior.
- [MediaPipe Hand Landmarker for Web](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/web_js) is a good candidate for a later interaction layer when pointer movement is not enough. It should drive masks or force fields over the existing relief plane rather than replace Depth Anything as the depth source.

## Directions

1. Interaction field

   Pointer movement creates a local field over the relief plane. Nearby particles lift, ripple, and slightly spread while the viewer orbits. This makes the browser demo immediately tactile without changing the source media or the 2.5D premise.

2. Local memory trails

   Instead of a global trail smear, store recent depth deltas or motion energy and let only recently changed regions glow or lag. This is especially strong for webcam hands, faces, and product motion.

3. Phase-locked particles

   Every point has a seed phase, but similar depth bands can synchronize into soft waves. This can make still images feel alive without becoming generic noise.

4. Edge-lit relief

   Depthkit-like partial video suggests bright dotted structure around silhouettes, clothing folds, hands, and high-frequency source detail. In Relievo this belongs inside the canonical relief field as an edge-lit particle surface, not as a separate mode.

5. Semantic pressure fields

   MediaPipe hand or face landmarks could become local attractors, cuts, or pressure points over the same relief plane. This should be treated as a force field on the existing material, not as a separate recognition UI.

## Parked Ideas

Depth contours, section scans, and broad phase waves were implemented as early studies, but they weakened the source image or felt less specific than the memory direction. They are parked until a stronger visual reason appears.

## Implemented Note

The first step was an interaction field: moving or dragging over the canvas disturbs nearby particles in the shader. It is intentionally modest so the source image still reads, but it gives the point field a material response that belongs to the browser artwork.

The current study switcher is intentionally narrow:

- Relief field: the canonical readable surface.
- Memory trails: recent local motion and depth changes leave a brighter, drifting particle afterimage.

These are shader and buffer-level studies, not separate presets. They keep the same media source and the same 2.5D plane so each mode can be judged as a material treatment rather than a new scene.

The relief field now includes a depth/color edge buffer that brightens and slightly enlarges particles around silhouettes and local folds. This is the current path toward the Depthkit partial-video texture: keep the main mode readable, but let high-frequency geometry become a white dotted surface.

Relief field material patterns are intentionally narrower than full modes:

- Depthkit field: the default balance of source readability, white dotted edge light, and surface depth.
- Silhouette trace: stronger contour particles around depth and color discontinuities.
- Soft fabric: lower-contrast woven particle texture for cloth, skin, and fine local detail.
- Sparse particles: more negative space and larger point presence for checking whether the field reads as particles instead of video noise.

MediaPipe should be introduced only if memory trails or the interaction field benefit from semantic control. The likely first use is a hand or face force field: detected landmarks would become local attractors, cuts, or pressure points over the depth surface. That keeps the artwork in the Relievo material language while making webcam interaction more performative.
