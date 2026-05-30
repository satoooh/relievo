import { estimateHeuristicDepth } from "./heuristicDepth";
import type { DepthResult, FrameSample } from "../types";

interface DepthWorkerRequest {
  id: number;
  sample: FrameSample;
}

interface DepthWorkerResponse {
  id: number;
  result: DepthResult;
}

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<DepthWorkerRequest>) => void) | null;
  postMessage: (message: DepthWorkerResponse, transfer: Transferable[]) => void;
};

workerScope.onmessage = (event) => {
  const result = estimateHeuristicDepth(event.data.sample);
  result.backend = "worker-cpu-heuristic";
  workerScope.postMessage({ id: event.data.id, result }, [result.depth.buffer]);
};
