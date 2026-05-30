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
        pointSize: 0.22,
        scanDirection: "top-bottom",
      },
    });

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
      pointSize: 0.22,
      scanDirection: "top-bottom",
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
