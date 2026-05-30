# Relievo

Relievo is a browser-based depth relief instrument for turning images, video, and webcam input into live 2.5D surfaces in a 3D scene.

It runs media sampling, Depth Anything V2 inference, WebGL point rendering, live tuning, and capture export directly in the browser.

## Demo

![Relievo real-time browser demo](docs/assets/relievo-realtime-browser-demo.gif)

[View the lightweight MP4 demo](docs/assets/relievo-realtime-browser-demo.mp4). The capture shows local video frames being sampled, inferred, displaced, shaded, and tuned in real time inside the browser.

## What It Does

- Starts from a quiet blank point field that can bend into image, video, or webcam-driven relief.
- Loads a still image, local video file, webcam stream, or built-in demo frame.
- Estimates a depth-like relief map in a Web Worker with selectable heuristic and Depth Anything V2 backends.
- Renders a dense point-field relief by default, with adaptive quality for weaker machines.
- Separates rendering from frame inference so dragging and orbiting the 3D scene stays responsive while frames are being analyzed.
- Switches between the canonical relief field and memory trails without changing the source media.
- Provides Relief field material patterns for comparing Depthkit-like edge lighting and fabric-like point texture.
- Saves shareable URL hashes for repeatable artwork states when the source is blank or demo media.
- Provides a performance mode that hides controls for projection, recording, and installation tests.
- Includes an experimental emoji mosaic mode that places small symbolic glyphs on the same 3D relief plane as the point field.
- Keeps one focused LiDAR Scan visual language so the source image remains legible across stills, video, and webcam input.
- Captures PNG screenshots and short canvas recordings with Web and Archive quality modes, preferring MP4 when the browser supports it and falling back to WebM.

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

The current build keeps a deterministic heuristic depth estimator for fast offline startup, and adds a Transformers.js Depth Anything V2 path for higher-quality monocular depth. Both estimators run behind a worker-backed `DepthPipeline` boundary under `src/depth`, so the renderer and UI can switch backends without changing their contract.

Core modules:

- `src/depth`: worker-backed heuristic depth estimation and temporal smoothing.
- `src/renderer`: Three.js point relief renderer and animation loop.
- `src/presets`: focused LiDAR Scan visual defaults.
- `src/media`: image, video, webcam, and demo sources.
- `src/export`: screenshot and MediaRecorder helpers.
- `src/ui`: Tailwind-backed exhibition controls.

## Portfolio Copy

Relievo is a real-time browser visual instrument that turns flat media into a moving depth relief. It uses monocular image cues to lift a particle grid as a 2.5D plane inside a 3D scene, letting the viewer drag, orbit, tune, scan, and export the result directly from the browser.

The output is designed to feel like a relief surface in navigable 3D space while keeping the interaction immediate: every frame can be sampled, inferred, displaced, shaded, and captured on a local browser loop.

## Artwork Notes

- [Relievo Manifesto](docs/vision.md)
- [Study 001: Guitar Relief](docs/studies/001-guitar-relief.md)
- [Study 002: Interactive Point-Field Directions](docs/studies/002-interactive-point-field-directions.md)

## Representative Captures

- [LiDAR Scan](docs/assets/relievo-lidar-scan.jpg)
