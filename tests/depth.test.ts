import { describe, expect, it } from "vitest";
import { estimateHeuristicDepth, normalizeDepth } from "../src/depth/heuristicDepth";
import type { FrameSample } from "../src/types";

describe("estimateHeuristicDepth", () => {
  it("returns normalized depth with the same grid size", () => {
    const image = {
      data: new Uint8ClampedArray(4 * 2 * 4),
      width: 4,
      height: 2,
      colorSpace: "srgb",
    } as ImageData;
    for (let index = 0; index < image.data.length; index += 4) {
      image.data[index] = index;
      image.data[index + 1] = 255 - index;
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }

    const sample: FrameSample = {
      data: image,
      width: 4,
      height: 2,
      sourceKind: "image",
      timestamp: 0,
    };

    const result = estimateHeuristicDepth(sample);

    expect(result.depth).toHaveLength(8);
    expect(result.width).toBe(4);
    expect(result.height).toBe(2);
    expect(Math.min(...result.depth)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...result.depth)).toBeLessThanOrEqual(1);
  });
});

describe("normalizeDepth", () => {
  it("handles flat depth arrays without NaN", () => {
    const depth = new Float32Array([0.4, 0.4, 0.4]);
    normalizeDepth(depth);
    expect(Array.from(depth)).toEqual([0, 0, 0]);
  });
});
