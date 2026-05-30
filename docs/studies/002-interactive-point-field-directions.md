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

2. Phase-locked particles

   Every point has a seed phase, but similar depth bands can synchronize into soft waves. This can make still images feel alive without becoming generic noise.

3. Depth contours

   Add optional contour bands that are derived from the depth map and rendered as subtle brightness or point-size strata. This would make the relief read like a topographic drawing while preserving the image.

4. Local memory trails

   Instead of a global trail smear, store recent depth deltas or motion energy and let only recently changed regions glow or lag. This is especially strong for webcam hands, faces, and product motion.

5. Section scan

   A moving slice can temporarily reveal a thin cross-section of the relief. The full image remains visible, but the scan exposes the structure as if the viewer is inspecting a spatial instrument.

6. Micro material layer

   Emoji or glyph replacement should stay sparse and scale-aware. It works best as an inspection layer at close camera distances, not as the default surface.

## Implemented Note

The first step was an interaction field: moving or dragging over the canvas disturbs nearby particles in the shader. It is intentionally modest so the source image still reads, but it gives the point field a material response that belongs to the browser artwork.

The next step is a study mode switcher:

- Relief field: the canonical readable surface.
- Memory trails: recent local motion and depth changes glow, lift, and drift slightly.
- Depth contours: topographic bands emphasize depth strata without replacing the image.
- Section scan: a moving slice inspects the relief surface as a spatial instrument.
- Phase waves: points in similar depth bands move with subtly synchronized phase.

These are shader and buffer-level studies, not separate presets. They keep the same media source and the same 2.5D plane so each mode can be judged as a material treatment rather than a new scene.

MediaPipe should be introduced only if one of these modes benefits from semantic control. The likely first use is a hand or face force field: detected landmarks would become local attractors, cuts, or pressure points over the depth surface. That keeps the artwork in the Relievo material language while making webcam interaction more performative.
