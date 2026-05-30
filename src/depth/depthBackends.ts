import type { DepthBackend, DepthBackendSelection } from "../types";

interface DepthBackendMeta {
  id: DepthBackendSelection;
  label: string;
  modelId?: string;
}

export const depthBackendOptions: DepthBackendMeta[] = [
  {
    id: "depth-anything-v2-small",
    label: "Depth Anything V2 Small",
    modelId: "onnx-community/depth-anything-v2-small",
  },
  {
    id: "depth-anything-v2-base",
    label: "Depth Anything V2 Base",
    modelId: "onnx-community/depth-anything-v2-base",
  },
  {
    id: "worker-cpu-heuristic",
    label: "Heuristic",
  },
];

export function getDepthBackendMeta(id: DepthBackendSelection): DepthBackendMeta {
  return depthBackendOptions.find((option) => option.id === id) ?? depthBackendOptions[0]!;
}

export function depthBackendLabel(id: DepthBackend): string {
  if (id === "cpu-heuristic") {
    return "Heuristic";
  }
  return getDepthBackendMeta(id).label;
}

export function isDepthAnythingBackend(id: DepthBackendSelection): boolean {
  return id === "depth-anything-v2-small" || id === "depth-anything-v2-base";
}
