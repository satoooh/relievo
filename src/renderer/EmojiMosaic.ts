import type { FrameSample } from "../types";

interface EmojiSwatch {
  emoji: string;
  rgb: [number, number, number];
}

const swatches: EmojiSwatch[] = [
  { emoji: "⬛", rgb: [8, 9, 11] },
  { emoji: "🌑", rgb: [24, 26, 32] },
  { emoji: "🪨", rgb: [84, 78, 72] },
  { emoji: "🪵", rgb: [105, 72, 42] },
  { emoji: "🍂", rgb: [142, 82, 36] },
  { emoji: "🟫", rgb: [126, 82, 52] },
  { emoji: "🟧", rgb: [236, 129, 42] },
  { emoji: "🟨", rgb: [240, 198, 71] },
  { emoji: "🟩", rgb: [72, 164, 92] },
  { emoji: "🌿", rgb: [52, 128, 72] },
  { emoji: "🟦", rgb: [56, 132, 220] },
  { emoji: "🧊", rgb: [120, 205, 224] },
  { emoji: "🟪", rgb: [150, 91, 202] },
  { emoji: "🌸", rgb: [230, 126, 170] },
  { emoji: "⬜", rgb: [218, 224, 226] },
  { emoji: "✨", rgb: [245, 232, 152] },
];

export class EmojiMosaic {
  private sample?: FrameSample;
  private depth?: Float32Array;
  private lastRender = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {}

  setFrame(sample: FrameSample, depth: Float32Array): void {
    this.sample = sample;
    this.depth = depth;
  }

  render(enabled: boolean): void {
    this.canvas.classList.toggle("hidden", !enabled);
    if (!enabled) {
      return;
    }

    const now = performance.now();
    if (now - this.lastRender < 100) {
      return;
    }
    this.lastRender = now;

    const parent = this.canvas.parentElement;
    const displayWidth = parent?.clientWidth ?? window.innerWidth;
    const displayHeight = parent?.clientHeight ?? window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const width = Math.max(1, Math.floor(displayWidth * pixelRatio));
    const height = Math.max(1, Math.floor(displayHeight * pixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;
    }

    const context = this.canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);
    if (!this.sample || !this.depth) {
      return;
    }

    drawEmojiField(context, this.sample, this.depth, width, height, pixelRatio);
  }
}

function drawEmojiField(
  context: CanvasRenderingContext2D,
  sample: FrameSample,
  depth: Float32Array,
  width: number,
  height: number,
  pixelRatio: number,
): void {
  const columns = Math.min(112, Math.max(64, Math.floor(width / (10 * pixelRatio))));
  const rows = Math.max(36, Math.floor(columns * (sample.height / sample.width)));
  const fieldWidth = Math.min(width * 0.86, height * 0.86 * (sample.width / sample.height));
  const fieldHeight = fieldWidth * (sample.height / sample.width);
  const originX = (width - fieldWidth) * 0.5;
  const originY = (height - fieldHeight) * 0.5;
  const cell = fieldWidth / columns;
  const data = sample.data.data;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${Math.max(7, cell * 0.66)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const sx = Math.min(sample.width - 1, Math.floor(((col + 0.5) / columns) * sample.width));
      const sy = Math.min(sample.height - 1, Math.floor(((row + 0.5) / rows) * sample.height));
      const sampleIndex = sy * sample.width + sx;
      const pixelIndex = sampleIndex * 4;
      const z = depth[sampleIndex] ?? 0;
      const alpha = 0.1 + Math.pow(z, 0.72) * 0.52;
      const emoji = nearestEmoji(data[pixelIndex] ?? 0, data[pixelIndex + 1] ?? 0, data[pixelIndex + 2] ?? 0);
      const lift = (z - 0.5) * cell * 0.42;
      context.globalAlpha = alpha;
      context.fillText(emoji, originX + (col + 0.5) * cell, originY + (row + 0.5) * (fieldHeight / rows) - lift);
    }
  }

  context.restore();
}

function nearestEmoji(red: number, green: number, blue: number): string {
  let best = swatches[0]!;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const swatch of swatches) {
    const dr = red - swatch.rgb[0];
    const dg = green - swatch.rgb[1];
    const db = blue - swatch.rgb[2];
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      best = swatch;
      bestDistance = distance;
    }
  }

  return best.emoji;
}
