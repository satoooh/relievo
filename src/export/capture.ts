export function downloadCanvasPNG(canvas: HTMLCanvasElement, basename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create screenshot blob."));
        return;
      }

      downloadBlob(blob, `${basename}.png`);
      resolve();
    }, "image/png");
  });
}

export class CanvasRecorder {
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private format: RecordingFormat = fallbackRecordingFormat;
  private stopTimer = 0;

  get recording(): boolean {
    return this.recorder?.state === "recording";
  }

  static isSupported(canvas: HTMLCanvasElement): boolean {
    return typeof MediaRecorder !== "undefined" && typeof canvas.captureStream === "function";
  }

  start(canvas: HTMLCanvasElement, fps: number, maxDurationMs = 15_000): string | undefined {
    if (this.recording) {
      return undefined;
    }

    if (!CanvasRecorder.isSupported(canvas)) {
      return "Recording is not supported in this browser.";
    }

    this.chunks = [];
    const stream = canvas.captureStream(fps);
    const formats = getSupportedRecordingFormats();
    const videoBitsPerSecond = estimateRecordingVideoBitsPerSecond(canvas.width, canvas.height, fps);

    const recorder = createMediaRecorder(stream, formats, videoBitsPerSecond);
    if (!recorder) {
      stopStream(stream);
      return "Recording could not start with the current canvas stream.";
    }

    this.recorder = recorder.recorder;
    this.format = recorder.format;

    this.recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    });
    this.recorder.addEventListener("stop", () => {
      window.clearTimeout(this.stopTimer);
      stopStream(stream);

      if (this.chunks.length === 0) {
        return;
      }

      const blob = new Blob(this.chunks, { type: this.format.mimeType });
      downloadBlob(blob, `relievo-${timestamp()}.${this.format.extension}`);
    });
    this.recorder.start();

    this.stopTimer = window.setTimeout(() => {
      this.stop();
    }, maxDurationMs);

    return undefined;
  }

  stop(): void {
    if (this.recording) {
      this.recorder?.stop();
    }
  }
}

export interface RecordingFormat {
  extension: "mp4" | "webm";
  mimeType: string;
}

const fallbackRecordingFormat: RecordingFormat = {
  extension: "webm",
  mimeType: "video/webm",
};

const recordingFormatCandidates: RecordingFormat[] = [
  {
    extension: "mp4",
    mimeType: 'video/mp4;codecs="avc1.42E01E"',
  },
  {
    extension: "mp4",
    mimeType: "video/mp4;codecs=h264",
  },
  {
    extension: "mp4",
    mimeType: "video/mp4",
  },
  {
    extension: "webm",
    mimeType: "video/webm;codecs=vp9",
  },
  {
    extension: "webm",
    mimeType: "video/webm;codecs=vp8",
  },
  fallbackRecordingFormat,
];

export function selectRecordingFormat(isTypeSupported: (mimeType: string) => boolean): RecordingFormat {
  return recordingFormatCandidates.find((format) => isTypeSupported(format.mimeType)) ?? fallbackRecordingFormat;
}

export function estimateRecordingVideoBitsPerSecond(width: number, height: number, fps: number): number {
  const pixelsPerSecond = Math.max(width, 1) * Math.max(height, 1) * Math.max(fps, 1);
  const targetBitsPerPixel = 0.22;
  const minBitrate = 16_000_000;
  const maxBitrate = 90_000_000;

  return Math.min(maxBitrate, Math.max(minBitrate, Math.round(pixelsPerSecond * targetBitsPerPixel)));
}

function getSupportedRecordingFormats(): RecordingFormat[] {
  const isTypeSupported = MediaRecorder.isTypeSupported?.bind(MediaRecorder);
  if (!isTypeSupported) {
    return [fallbackRecordingFormat];
  }

  return [
    ...recordingFormatCandidates.filter((format) => isTypeSupported(format.mimeType)),
    fallbackRecordingFormat,
  ];
}

function createMediaRecorder(
  stream: MediaStream,
  formats: RecordingFormat[],
  videoBitsPerSecond: number,
): { format: RecordingFormat; recorder: MediaRecorder } | undefined {
  for (const format of formats) {
    try {
      return {
        format,
        recorder: new MediaRecorder(stream, {
          mimeType: format.mimeType,
          videoBitsPerSecond,
        }),
      };
    } catch {
      // Browser MIME support checks can be optimistic, so try the next container.
    }
  }

  return undefined;
}

function stopStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

export function timestamp(): string {
  return new Date().toISOString().replaceAll(":", "-").replace(/\.\d+Z$/, "Z");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
