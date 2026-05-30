import type { DepthBackendSelection, DepthResult, FrameSample } from "../types";

interface PendingRequest {
  reject: (reason?: unknown) => void;
  resolve: (value: DepthResult) => void;
}

interface DepthWorkerResponse {
  id: number;
  error?: string;
  result?: DepthResult;
}

export class DepthPipeline {
  private readonly worker = new Worker(new URL("./depthWorker.ts", import.meta.url), { type: "module" });
  private readonly pending = new Map<number, PendingRequest>();
  private nextId = 1;

  constructor() {
    this.worker.addEventListener("message", (event: MessageEvent<DepthWorkerResponse>) => {
      const request = this.pending.get(event.data.id);
      if (!request) {
        return;
      }

      if (event.data.error) {
        this.pending.delete(event.data.id);
        request.reject(new Error(event.data.error));
        return;
      }

      if (event.data.result) {
        this.pending.delete(event.data.id);
        request.resolve(event.data.result);
      }
    });

    this.worker.addEventListener("error", (event) => {
      this.rejectAll(new Error(event.message));
    });

    this.worker.addEventListener("messageerror", () => {
      this.rejectAll(new Error("Depth worker could not deserialize the frame."));
    });
  }

  get busy(): boolean {
    return this.pending.size > 0;
  }

  estimate(sample: FrameSample, backend: DepthBackendSelection): Promise<DepthResult> {
    const id = this.nextId;
    this.nextId += 1;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ backend, id, sample });
    });
  }

  dispose(): void {
    this.worker.terminate();
    this.rejectAll(new Error("Depth pipeline disposed."));
  }

  private rejectAll(error: Error): void {
    for (const request of this.pending.values()) {
      request.reject(error);
    }
    this.pending.clear();
  }
}
