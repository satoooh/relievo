# Relievo

Relievo is a browser-based depth relief renderer. It is not a 3D reconstruction tool.

It turns images, video files, or webcam input into an interactive 2.5D particle relief by estimating a lightweight depth field, displacing a point grid in Three.js, and exposing visual controls for live tuning.

## What It Does

- Loads a still image, local video file, webcam stream, or built-in demo frame.
- Estimates a depth-like relief map in a Web Worker with a CPU heuristic backend.
- Renders a 256 x 144 point relief by default, with adaptive quality for weaker machines.
- Separates rendering from frame inference so camera movement stays responsive while frames are being analyzed.
- Provides presets such as Ghost Relief, LiDAR Scan, Topographic, Soft Hologram, Depth Sculpture, and Glitch Field.
- Captures PNG screenshots and short WebM recordings from the canvas.

## What It Is Not

- It does not recover metric 3D geometry.
- It does not create stable multi-view meshes.
- It does not perform WebXR or cloud processing.
- It does not upload media anywhere.

Relievo treats monocular depth cues as an expressive signal for a visual instrument, not as ground truth geometry.

## Local Development

This project is managed with Nix so Node and npm do not need to be installed globally.

```sh
nix develop
npm install
npm run dev
```

Useful commands:

```sh
npm run typecheck
npm run test
npm run build
npm run preview
```

## Implementation Notes

The current MVP uses a deterministic heuristic depth estimator rather than a neural model. That keeps the first portfolio build small, offline, and predictable. The estimator runs behind a worker-backed `DepthPipeline` boundary under `src/depth`, so a Depth Anything / ONNX / Transformers.js backend can be added later without changing the renderer or UI contract.

Core modules:

- `src/depth`: worker-backed heuristic depth estimation and temporal smoothing.
- `src/renderer`: Three.js point relief renderer and animation loop.
- `src/presets`: visual preset definitions and defaults.
- `src/media`: image, video, webcam, and demo sources.
- `src/export`: screenshot and MediaRecorder helpers.
- `src/ui`: Tailwind-backed controls and lil-gui bridge.

## Portfolio Copy

Relievo is a real-time browser visual instrument that turns flat media into a moving depth relief. It uses monocular image cues to lift a particle grid into 3D space, letting the viewer orbit, tune, scan, and export the result directly from the browser.

The important constraint is also the concept: this is 2.5D relief rendering, not reconstruction. The output is designed to feel sculptural and legible, while staying honest about what a single camera view can infer.

## Representative Captures

- [Ghost Relief](docs/assets/relievo-ghost-relief.jpg)
- [LiDAR Scan](docs/assets/relievo-lidar-scan.jpg)
- [Topographic](docs/assets/relievo-topographic.jpg)
