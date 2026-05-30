import type { ReliefPreset } from "../types";

export const presets: ReliefPreset[] = [
  {
    id: "ghost-relief",
    name: "Ghost Relief",
    description: "Soft translucent relief with gentle depth and slow breathing.",
    params: {
      depthScale: 2.5,
      pointSize: 2.8,
      pointOpacity: 0.56,
      colorStrength: 0.42,
      backgroundFade: 0.72,
      foregroundBoost: 0.2,
      temporalSmoothing: 0.82,
      breathing: 0.14,
      scanReveal: 0.82,
      monochrome: true,
    },
  },
  {
    id: "lidar-scan",
    name: "LiDAR Scan",
    description: "Sharper cyan-green scan styling with foreground emphasis.",
    params: {
      depthScale: 3.3,
      pointSize: 2.2,
      pointOpacity: 0.88,
      colorStrength: 0.95,
      backgroundFade: 0.38,
      foregroundBoost: 0.38,
      temporalSmoothing: 0.7,
      scanReveal: 0.72,
      scanDirection: "left-right",
      monochrome: false,
    },
  },
  {
    id: "topographic",
    name: "Topographic",
    description: "Quantized contour-like relief for readable depth bands.",
    params: {
      depthScale: 3,
      pointSize: 2.4,
      pointOpacity: 0.8,
      colorStrength: 0.74,
      backgroundFade: 0.52,
      foregroundBoost: 0.34,
      depthQuantize: 9,
      temporalSmoothing: 0.78,
      scanReveal: 1,
    },
  },
  {
    id: "soft-hologram",
    name: "Soft Hologram",
    description: "Airy blue-violet relief for portrait-like material.",
    params: {
      depthScale: 2.2,
      pointSize: 3.1,
      pointOpacity: 0.5,
      colorStrength: 0.34,
      backgroundFade: 0.78,
      foregroundBoost: 0.18,
      temporalSmoothing: 0.86,
      breathing: 0.2,
      monochrome: true,
    },
  },
  {
    id: "depth-sculpture",
    name: "Depth Sculpture",
    description: "Dense, high-contrast sculptural depth for still captures.",
    params: {
      depthScale: 4.1,
      pointSize: 2,
      pointOpacity: 0.92,
      colorStrength: 0.68,
      backgroundFade: 0.34,
      foregroundBoost: 0.52,
      temporalSmoothing: 0.72,
      scanReveal: 1,
    },
  },
  {
    id: "glitch-field",
    name: "Glitch Field",
    description: "Noisier relief with scan artifacts for motion experiments.",
    params: {
      depthScale: 3.7,
      pointSize: 1.9,
      pointOpacity: 0.72,
      colorStrength: 1,
      backgroundFade: 0.44,
      foregroundBoost: 0.46,
      temporalSmoothing: 0.52,
      scanReveal: 0.64,
      glitchAmount: 0.18,
      trailAmount: 0.18,
    },
  },
];

export const initialPresetId = "lidar-scan";

export function findPreset(id: string): ReliefPreset {
  return presets.find((preset) => preset.id === id) ?? presets[0]!;
}
