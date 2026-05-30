import type { ReliefParams } from "./types";

export const defaultParams: ReliefParams = {
  gridWidth: 420,
  gridHeight: 236,
  depthScale: 2.15,
  depthGamma: 1.42,
  pointSize: 0.28,
  pointOpacity: 0.98,
  colorStrength: 0.18,
  temporalSmoothing: 0.78,
  backgroundFade: 0,
  foregroundBoost: 0.18,
  nearThreshold: 0.08,
  farThreshold: 0.78,
  brightness: 2.05,
  textureMix: 0.18,
  inferenceFPS: 12,
  renderScale: 1,
  adaptiveQuality: true,
  morphAmount: 1,
  morphSpeed: 0.34,
  scanReveal: 1,
  scanDirection: "left-right",
  trailAmount: 0.02,
  breathing: 0.02,
  depthQuantize: 0,
  monochrome: true,
  glitchAmount: 0,
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
