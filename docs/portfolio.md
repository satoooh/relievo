# Relievo Portfolio Notes

## Landing Page Structure

1. Hero
   - Title: Relievo
   - Subtitle: Real-time depth relief renderer for images, video, and webcam input.
   - Visual: Full-bleed canvas capture showing a point relief in motion.
   - Primary action: Try the demo.

2. Concept
   - Relievo transforms flat media into an interactive 2.5D particle sculpture.
   - It is a browser-based expression tool, not a metric 3D reconstruction system.

3. Interaction
   - Upload image or video.
   - Start webcam.
   - Tune depth scale, point size, opacity, temporal smoothing, scan reveal, and presets.
   - Save screenshots or short WebM clips.

4. Technical Highlights
   - TypeScript + Vite + Tailwind CSS.
   - Three.js point cloud renderer with OrbitControls.
   - CPU heuristic depth backend with isolated estimator boundary.
   - Decoupled inference and render loops.
   - MediaRecorder export.

5. Constraints
   - Monocular depth cues are expressive, not physically exact.
   - The MVP uses a deterministic local estimator for portability.
   - Future neural backends can fit behind the same depth-estimator interface.

## Article Outline

Title candidates:

- Building Relievo: a Browser-Based Depth Relief Renderer
- 2.5D, Not 3D: Turning Video Into a Particle Relief in Three.js
- Designing an Honest Monocular Depth Visual Instrument

Outline:

1. Why depth relief instead of reconstruction
2. The core loop: sample frame, estimate depth, smooth, displace points
3. Keeping render and inference loops separate
4. Presets as visual language, not just settings
5. Exporting screenshots and short recordings
6. Current limits and future neural depth backends

## Demo Capture Checklist

- [x] Capture at least one still image using Ghost Relief: `docs/assets/relievo-ghost-relief.jpg`.
- [x] Capture one LiDAR Scan scene with scan reveal enabled: `docs/assets/relievo-lidar-scan.jpg`.
- [x] Capture one Topographic close-up candidate: `docs/assets/relievo-topographic.jpg`.

## Current Representative Assets

| Asset | Use |
| --- | --- |
| `docs/assets/relievo-ghost-relief.jpg` | Soft introductory portfolio image |
| `docs/assets/relievo-lidar-scan.jpg` | Default interactive demo state |
| `docs/assets/relievo-topographic.jpg` | Depth-band / technical article visual |
