# Relievo Manifesto

Relievo is a browser instrument for turning media into depth relief surfaces in a 3D scene.

It treats monocular depth as an expressive signal rather than a promise of reconstruction. A frame is sampled, inferred, displaced, shaded, tuned, and exported on the local browser loop. The important material is not only the source image, but the uncertainty between image and space.

The work begins as a flat field of points placed in 3D space. An image, video, or webcam stream enters the field and bends it into a 2.5D relief plane. The viewer can drag through the space and feel the surface, but the artwork keeps its relief logic: it is a plane with depth, not a reconstructed world. The surface can stay calm, scan across the frame, glitch, breathe, or collapse into another material. Relievo should feel less like a filter and more like a digital relief surface that can be played.

## Principles

- Keep the media local. Browser-side inference is part of the artwork, not only an implementation detail.
- Preserve immediacy. Tuning should feel live enough for performance and installation.
- Let point, depth, scan, and motion carry the visual language.
- Make every state shareable when it does not depend on private local media.
- Treat export quality as part of the artwork, because digital relief needs archival output as much as preview output.
- Keep the source open as an artifact of the work, without making community scale the primary goal.

## Current Direction

Relievo is moving toward a real-time 3D-space depth relief instrument:

- a blank point field in 3D space that can become media-driven 2.5D relief without a hard scene change,
- Depth Anything V2 as the primary creative ML backend,
- performance mode for projection and exhibition,
- keyboard and canvas gestures that let the work move between edit surface and exhibition surface without adding visible UI,
- shareable URL hashes for repeatable artwork states,
- high-quality canvas recording for documentation,
- experimental micro/macro materials such as emoji mosaic.

The emoji mosaic direction is deliberately strange, but it should keep the point-field scale and should not replace the 3D scene as the main artwork. Emoji glyphs belong on the same 2.5D relief plane as the points, so dragging the scene still reveals one spatial surface. From a distance, the viewer should still read a fine relief surface; up close, some points decompose into small symbolic fragments. That shift between macro shape and micro language is a useful path for making Relievo feel like more than a point-field renderer without losing the dense dot texture.
