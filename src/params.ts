import type { ReliefParams } from "./types";

export const defaultParams: ReliefParams = {
  artMode: "relief",
  depthBackend: "depth-anything-v2-base",
  gridWidth: 420,
  gridHeight: 236,
  depthScale: 3.3,
  depthGamma: 1.42,
  pointSize: 0.12,
  pointOpacity: 0.64,
  colorStrength: 1,
  temporalSmoothing: 0.7,
  backgroundFade: 0.72,
  foregroundBoost: 0.72,
  nearThreshold: 0,
  farThreshold: 1,
  brightness: 0.72,
  textureMix: 0.62,
  inferenceFPS: 20,
  renderScale: 1.25,
  adaptiveQuality: true,
  qualityMode: "balanced",
  morphAmount: 1,
  morphSpeed: 0.66,
  particleInertia: 0.42,
  scanReveal: 1,
  scanDirection: "left-right",
  trailAmount: 0,
  breathing: 0.01,
  depthQuantize: 0,
  monochrome: false,
  glitchAmount: 0.01,
};

export function copyParams(params: ReliefParams): ReliefParams {
  return { ...params };
}

export function applyParams(base: ReliefParams, patch: Partial<ReliefParams>): ReliefParams {
  return { ...base, ...patch };
}

export function qualityLabel(params: ReliefParams): string {
  return `${params.gridWidth}x${params.gridHeight} / ${Math.round(params.renderScale * 100)}%`;
}
