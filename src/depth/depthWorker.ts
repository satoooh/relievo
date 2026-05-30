import { estimateDepthAnything } from "./depthAnything";
import { estimateHeuristicDepth } from "./heuristicDepth";
import type { DepthBackendSelection, DepthResult, FrameSample } from "../types";

interface DepthWorkerRequest {
  backend: DepthBackendSelection;
  id: number;
  sample: FrameSample;
}

interface DepthWorkerResponse {
  error?: string;
  id: number;
  result?: DepthResult;
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<DepthWorkerRequest>) => void) | null;
  postMessage: (message: DepthWorkerResponse, transfer: Transferable[]) => void;
};

workerScope.onmessage = (event) => {
  void estimate(event.data)
    .then((result) => {
      workerScope.postMessage({ id: event.data.id, result }, [result.depth.buffer]);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      workerScope.postMessage({ error: message, id: event.data.id }, []);
    });
};

async function estimate(request: DepthWorkerRequest): Promise<DepthResult> {
  if (request.backend === "worker-cpu-heuristic") {
    const result = estimateHeuristicDepth(request.sample);
    result.backend = "worker-cpu-heuristic";
    return result;
  }

  return estimateDepthAnything(request.sample, request.backend);
}
