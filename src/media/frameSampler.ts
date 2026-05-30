import type { FrameSample, SourceKind } from "../types";

export class FrameSampler {
  private readonly canvas = document.createElement("canvas");
  private readonly context = this.canvas.getContext("2d", { willReadFrequently: true });

  sample(element: CanvasImageSource, width: number, height: number, sourceKind: SourceKind): FrameSample {
    if (!this.context) {
      throw new Error("2D canvas context is unavailable.");
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(element, 0, 0, width, height);

    return {
      data: this.context.getImageData(0, 0, width, height),
      width,
      height,
      sourceKind,
      timestamp: performance.now(),
    };
  }
}

export function createDemoCanvas(width = 1280, height = 720): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  if (!context) {
    return canvas;
  }

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#06131d");
  gradient.addColorStop(0.42, "#1a766f");
  gradient.addColorStop(1, "#f0b66a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255,255,255,0.08)";
  for (let i = 0; i < 34; i += 1) {
    const x = (i * 97) % width;
    const y = (i * 53) % height;
    context.beginPath();
    context.arc(x, y, 18 + ((i * 7) % 48), 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "rgba(246,250,255,0.88)";
  context.beginPath();
  context.ellipse(width * 0.5, height * 0.43, width * 0.12, height * 0.18, -0.08, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(20,28,36,0.92)";
  context.beginPath();
  context.moveTo(width * 0.34, height * 0.84);
  context.bezierCurveTo(width * 0.39, height * 0.58, width * 0.62, height * 0.58, width * 0.68, height * 0.84);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(236,255,247,0.42)";
  context.lineWidth = 3;
  for (let y = 0; y < 8; y += 1) {
    context.beginPath();
    const yy = height * (0.18 + y * 0.09);
    context.moveTo(width * 0.08, yy);
    context.bezierCurveTo(width * 0.3, yy - 30, width * 0.58, yy + 45, width * 0.92, yy - 10);
    context.stroke();
  }

  return canvas;
}
