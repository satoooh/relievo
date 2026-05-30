export class TemporalSmoother {
  private previous?: Float32Array;

  reset(): void {
    this.previous = undefined;
  }

  smooth(current: Float32Array, amount: number): Float32Array {
    const alpha = Math.min(0.98, Math.max(0, amount));

    if (!this.previous || this.previous.length !== current.length || alpha === 0) {
      this.previous = new Float32Array(current);
      return new Float32Array(current);
    }

    const output = new Float32Array(current.length);
    const previousWeight = alpha;
    const currentWeight = 1 - alpha;

    for (let index = 0; index < current.length; index += 1) {
      output[index] = (this.previous[index] ?? 0) * previousWeight + (current[index] ?? 0) * currentWeight;
    }

    this.previous = output;
    return output;
  }
}
