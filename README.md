# Relievo

Relievo is a browser-based depth relief renderer for turning images, video, and webcam input into live 2.5D point-cloud sculptures.

It runs media sampling, depth inference, WebGL point rendering, live tuning, and capture export directly in the browser.

## Demo

<video src="docs/assets/relievo-realtime-browser-demo.mp4" poster="docs/assets/relievo-realtime-browser-demo-poster.jpg" controls muted loop playsinline width="100%"></video>

[View the lightweight MP4 demo](docs/assets/relievo-realtime-browser-demo.mp4)

## What It Does

- Loads a still image, local video file, webcam stream, or built-in demo frame.
- Estimates a depth-like relief map in a Web Worker with selectable heuristic and Depth Anything V2 backends.
- Renders a 256 x 144 point relief by default, with adaptive quality for weaker machines.
- Separates rendering from frame inference so camera movement stays responsive while frames are being analyzed.
- Provides presets such as Ghost Relief, LiDAR Scan, Topographic, Soft Hologram, Depth Sculpture, and Glitch Field.
- Captures PNG screenshots and short canvas recordings, preferring MP4 when the browser supports it and falling back to WebM.

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
- `src/presets`: visual preset definitions and defaults.
- `src/media`: image, video, webcam, and demo sources.
- `src/export`: screenshot and MediaRecorder helpers.
- `src/ui`: Tailwind-backed controls and lil-gui bridge.

## Portfolio Copy

Relievo is a real-time browser visual instrument that turns flat media into a moving depth relief. It uses monocular image cues to lift a particle grid into 3D space, letting the viewer orbit, tune, scan, and export the result directly from the browser.

The output is designed to feel sculptural and legible while keeping the interaction immediate: every frame can be sampled, inferred, displaced, shaded, and captured on a local browser loop.

## Representative Captures

- [Ghost Relief](docs/assets/relievo-ghost-relief.jpg)
- [LiDAR Scan](docs/assets/relievo-lidar-scan.jpg)
- [Topographic](docs/assets/relievo-topographic.jpg)
