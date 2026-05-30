import type { DepthResult, FrameSample } from "../types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function luminance(data: Uint8ClampedArray, index: number): number {
  const r = data[index] ?? 0;
  const g = data[index + 1] ?? 0;
  const b = data[index + 2] ?? 0;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation(data: Uint8ClampedArray, index: number): number {
  const r = (data[index] ?? 0) / 255;
  const g = (data[index + 1] ?? 0) / 255;
  const b = (data[index + 2] ?? 0) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

export function estimateHeuristicDepth(sample: FrameSample): DepthResult {
  const started = performance.now();
  const { data, width, height } = sample.data;
  const depth = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    const yn = height <= 1 ? 0 : y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const xn = width <= 1 ? 0 : x / (width - 1);
      const index = (y * width + x) * 4;
      const center = luminance(data, index);
      const left = luminance(data, (y * width + Math.max(0, x - 1)) * 4);
      const right = luminance(data, (y * width + Math.min(width - 1, x + 1)) * 4);
      const up = luminance(data, (Math.max(0, y - 1) * width + x) * 4);
      const down = luminance(data, (Math.min(height - 1, y + 1) * width + x) * 4);
      const edge = Math.abs(right - left) + Math.abs(down - up);
      const sat = saturation(data, index);
      const verticalPrior = 1 - yn;
      const cx = xn - 0.5;
      const cy = yn - 0.52;
      const centerPrior = 1 - clamp01(Math.sqrt(cx * cx + cy * cy) * 1.9);
      const contrast = Math.abs(center - 0.5) * 2;

      depth[y * width + x] = clamp01(
        center * 0.34 +
          edge * 1.35 +
          sat * 0.18 +
          verticalPrior * 0.16 +
          centerPrior * 0.24 +
          contrast * 0.08,
      );
    }
  }

  normalizeDepth(depth);

  return {
    depth,
    width,
    height,
    backend: "cpu-heuristic",
    inferenceMs: performance.now() - started,
  };
}

export function normalizeDepth(depth: Float32Array): void {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of depth) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  const span = Math.max(0.0001, max - min);
  for (let index = 0; index < depth.length; index += 1) {
    depth[index] = clamp01(((depth[index] ?? 0) - min) / span);
  }
}
