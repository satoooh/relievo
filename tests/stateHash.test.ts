import { describe, expect, it } from "vitest";
import { defaultParams } from "../src/params";
import { decodeShareableState, encodeShareableState } from "../src/share/stateHash";

describe("shareable state hash", () => {
  it("round-trips artwork controls that are safe to share", () => {
    const hash = encodeShareableState({
      demoSceneId: "motion-sweep",
      emojiMode: true,
      exportQuality: "archive",
      performanceMode: true,
      presetId: "lidar-scan",
      sourceKind: "demo",
      params: {
        ...defaultParams,
        artMode: "memory",
        reliefMaterial: "fabric",
        particleInertia: 0.52,
        pointSize: 0.22,
        qualityMode: "visual",
      },
    });
    expect(hash).not.toContain("scanDir");

    const decoded = decodeShareableState(hash);
    expect(decoded).toMatchObject({
      demoSceneId: "motion-sweep",
      emojiMode: true,
      exportQuality: "archive",
      performanceMode: true,
      presetId: "lidar-scan",
      sourceKind: "demo",
    });
    expect(decoded.params).toMatchObject({
      artMode: "memory",
      reliefMaterial: "fabric",
      particleInertia: 0.52,
      pointSize: 0.22,
      qualityMode: "visual",
    });
  });

  it("does not serialize local media source kinds as shareable state", () => {
    const hash = encodeShareableState({
      demoSceneId: "studio",
      emojiMode: false,
      exportQuality: "web",
      performanceMode: false,
      presetId: "lidar-scan",
      sourceKind: "webcam",
      params: defaultParams,
    });

    expect(decodeShareableState(hash).sourceKind).toBe("blank");
  });
});
