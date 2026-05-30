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
    const mimeType = MediaRecorder.isTypeSupported?.("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    try {
      this.recorder = new MediaRecorder(stream, { mimeType });
    } catch {
      return "Recording could not start with the current canvas stream.";
    }

    this.recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    });
    this.recorder.addEventListener("stop", () => {
      window.clearTimeout(this.stopTimer);
      for (const track of stream.getTracks()) {
        track.stop();
      }

      if (this.chunks.length === 0) {
        return;
      }

      const blob = new Blob(this.chunks, { type: mimeType });
      downloadBlob(blob, `relievo-${timestamp()}.webm`);
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
