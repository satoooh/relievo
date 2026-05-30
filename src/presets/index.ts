import type { ReliefPreset } from "../types";

export const presets: ReliefPreset[] = [
  {
    id: "lidar-scan",
    name: "LiDAR Scan",
    description: "Default point-field relief language tuned to preserve the source image.",
    params: {
      artMode: "relief",
      gridWidth: 420,
      gridHeight: 236,
      depthScale: 3.3,
      depthGamma: 1.42,
      pointSize: 0.12,
      pointOpacity: 0.64,
      colorStrength: 1,
      backgroundFade: 0.72,
      foregroundBoost: 0.72,
      nearThreshold: 0,
      farThreshold: 1,
      brightness: 0.72,
      textureMix: 0.62,
      temporalSmoothing: 0.7,
      inferenceFPS: 20,
      renderScale: 1.25,
      qualityMode: "balanced",
      morphAmount: 1,
      morphSpeed: 0.66,
      particleInertia: 0.42,
      scanReveal: 1,
      scanDirection: "left-right",
      trailAmount: 0,
      breathing: 0.01,
      depthQuantize: 0,
      glitchAmount: 0.01,
      monochrome: false,
    },
  },
];

export const initialPresetId = "lidar-scan";

export function findPreset(id: string): ReliefPreset {
  return presets.find((preset) => preset.id === id) ?? presets[0]!;
}
