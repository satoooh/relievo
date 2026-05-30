# Relievo Portfolio Notes

## Landing Page Structure

1. Hero
   - Title: Relievo
   - Subtitle: Real-time browser depth relief renderer for images, video, and webcam input.
   - Visual: Full-bleed browser capture showing media frames becoming a point relief in motion.
   - Primary action: Try the demo.

2. Concept
   - Relievo transforms flat media into an interactive 2.5D relief plane in a 3D scene.
   - It keeps sampling, depth inference, WebGL rendering, tuning, and export in the browser.
   - It begins from a blank point field so media input feels like a deformation of the same surface, not a separate mode.

3. Interaction
   - Upload image or video.
   - Start webcam.
   - Tune depth scale, point size, opacity, temporal smoothing, scan reveal, and quality mode.
   - Hide the control surface with performance mode for projection, recording, and installation tests.
   - Share repeatable blank/demo states through URL hashes.
   - Test symbolic micro-texture with emoji mosaic mode while keeping the relief plane as the primary spatial object.
   - Save screenshots or short MP4/WebM clips.

4. Technical Highlights
   - TypeScript + Vite + Tailwind CSS.
   - Three.js point-field relief renderer with OrbitControls.
   - CPU heuristic, Depth Anything V2, and Apple Depth Pro Sharp depth backends with an isolated estimator boundary.
   - Decoupled inference and render loops.
   - Shader-driven point relief animation.
   - MediaRecorder export with Web/Archive quality, MP4 preference, and WebM fallback.

5. Technical Direction
   - The deterministic local estimator remains useful for fast startup and portability.
   - Neural backends trade startup/model cost for stronger depth structure.
   - Demo materials should emphasize real-time browser inference and live visual control.
   - The repository should read as an open-source artwork rather than a community-first SDK.

## Article Outline

Title candidates:

- Building Relievo: a Browser-Based Depth Relief Renderer
- 2.5D in 3D Space: Turning Video Into a Particle Relief Plane in Three.js
- Designing an Honest Monocular Depth Visual Instrument

Outline:

1. Why depth relief instead of reconstruction
2. The core loop: sample frame, estimate depth, smooth, displace points
3. Keeping render and inference loops separate
4. A focused LiDAR visual language, not a pile of broken looks
5. Exporting screenshots and short recordings
6. Depth backend tradeoffs and future visual directions

## Demo Capture Checklist

- [x] Capture one LiDAR Scan scene with scan reveal enabled: `docs/assets/relievo-lidar-scan.jpg`.

## Current Representative Assets

| Asset | Use |
| --- | --- |
| `docs/assets/relievo-lidar-scan.jpg` | Default interactive demo state |
