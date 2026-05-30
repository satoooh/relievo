import type { ReliefParams } from "./types";

export const defaultParams: ReliefParams = {
  gridWidth: 256,
  gridHeight: 144,
  depthScale: 2.8,
  depthGamma: 1.28,
  pointSize: 2.6,
  pointOpacity: 0.78,
  colorStrength: 0.82,
  temporalSmoothing: 0.74,
  backgroundFade: 0.46,
  foregroundBoost: 0.28,
  inferenceFPS: 12,
  renderScale: 1,
  adaptiveQuality: true,
  morphAmount: 1,
  morphSpeed: 0.28,
  scanReveal: 1,
  scanDirection: "left-right",
  trailAmount: 0.08,
  breathing: 0.08,
  depthQuantize: 0,
  monochrome: false,
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
