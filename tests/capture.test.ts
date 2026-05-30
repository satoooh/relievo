import { describe, expect, it } from "vitest";
import { estimateRecordingVideoBitsPerSecond, selectRecordingFormat } from "../src/export/capture";

describe("selectRecordingFormat", () => {
  it("prefers mp4 when the browser supports it", () => {
    const format = selectRecordingFormat((mimeType) => mimeType === 'video/mp4;codecs="avc1.42E01E"');
    expect(format).toEqual({
      extension: "mp4",
      mimeType: 'video/mp4;codecs="avc1.42E01E"',
    });
  });

  it("falls back to webm when mp4 is unavailable", () => {
    const format = selectRecordingFormat((mimeType) => mimeType === "video/webm;codecs=vp9");
    expect(format).toEqual({
      extension: "webm",
      mimeType: "video/webm;codecs=vp9",
    });
  });
});

describe("estimateRecordingVideoBitsPerSecond", () => {
  it("allocates substantially more bitrate for high-resolution point-field captures", () => {
    expect(estimateRecordingVideoBitsPerSecond(3450, 2340, 30)).toBe(53_281_800);
  });

  it("keeps low-resolution captures above a useful quality floor", () => {
    expect(estimateRecordingVideoBitsPerSecond(1280, 720, 30)).toBe(16_000_000);
  });

  it("supports lighter web exports for quick sharing", () => {
    expect(estimateRecordingVideoBitsPerSecond(1280, 720, 30, "web")).toBe(6_000_000);
  });
});
