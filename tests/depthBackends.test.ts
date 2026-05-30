import { describe, expect, it } from "vitest";
import { depthBackendLabel, depthBackendOptions, getDepthBackendMeta } from "../src/depth/depthBackends";
import { defaultParams } from "../src/params";

describe("depth backend metadata", () => {
  it("exposes depth anything v2 small and base model ids", () => {
    expect(getDepthBackendMeta("depth-anything-v2-small").modelId).toBe("onnx-community/depth-anything-v2-small");
    expect(getDepthBackendMeta("depth-anything-v2-base").modelId).toBe("onnx-community/depth-anything-v2-base");
  });

  it("exposes Apple Depth Pro as an experimental sharp-boundary backend", () => {
    const depthPro = getDepthBackendMeta("apple-depth-pro-sharp");
    expect(depthPro.modelId).toBe("onnx-community/DepthPro-ONNX");
    expect(depthPro.invertDepth).toBe(true);
  });

  it("keeps small as the first selectable backend for lower-cost fallback", () => {
    expect(depthBackendOptions[0]?.id).toBe("depth-anything-v2-small");
  });

  it("defaults to depth anything v2 base for highest-quality startup rendering", () => {
    expect(defaultParams.depthBackend).toBe("depth-anything-v2-base");
  });

  it("labels the old renderer fallback without exposing internal worker naming", () => {
    expect(depthBackendLabel("cpu-heuristic")).toBe("Heuristic");
    expect(depthBackendLabel("worker-cpu-heuristic")).toBe("Heuristic");
  });
});
