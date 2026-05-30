export class RateMeter {
  private frames = 0;
  private last = performance.now();
  private value = 0;

  tick(now = performance.now()): number {
    this.frames += 1;
    const elapsed = now - this.last;

    if (elapsed >= 500) {
      this.value = (this.frames * 1000) / elapsed;
      this.frames = 0;
      this.last = now;
    }

    return this.value;
  }

  current(): number {
    return this.value;
  }
}

export function detectWebGPU(): boolean {
  return "gpu" in navigator;
}
