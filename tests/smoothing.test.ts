import { describe, expect, it } from "vitest";
import { TemporalSmoother } from "../src/depth/smoothing";

describe("TemporalSmoother", () => {
  it("blends current depth with the previous frame", () => {
    const smoother = new TemporalSmoother();
    expect(Array.from(smoother.smooth(new Float32Array([0, 1]), 0.5))).toEqual([0, 1]);
    expect(Array.from(smoother.smooth(new Float32Array([1, 0]), 0.5))).toEqual([0.5, 0.5]);
  });

  it("resets accumulated state", () => {
    const smoother = new TemporalSmoother();
    smoother.smooth(new Float32Array([0]), 0.8);
    smoother.reset();
    expect(Array.from(smoother.smooth(new Float32Array([1]), 0.8))).toEqual([1]);
  });
});
