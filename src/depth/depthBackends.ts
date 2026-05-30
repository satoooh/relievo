import type { DepthBackend, DepthBackendSelection } from "../types";

interface DepthBackendMeta {
  dtype?: "fp32" | "q4";
  id: DepthBackendSelection;
  invertDepth?: boolean;
  label: string;
  modelId?: string;
  useExternalDataFormat?: boolean;
}

export const depthBackendOptions: DepthBackendMeta[] = [
  {
    id: "depth-anything-v2-small",
    label: "Depth Anything V2 Small",
    modelId: "onnx-community/depth-anything-v2-small",
    dtype: "q4",
  },
  {
    id: "depth-anything-v2-base",
    label: "Depth Anything V2 Base",
    modelId: "onnx-community/depth-anything-v2-base",
    dtype: "q4",
  },
  {
    id: "apple-depth-pro-sharp",
    label: "Apple Depth Pro Sharp",
    modelId: "onnx-community/DepthPro-ONNX",
    dtype: "q4",
    invertDepth: true,
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
  return id !== "worker-cpu-heuristic";
}

export function isHighCostDepthBackend(id: DepthBackendSelection): boolean {
  return id === "depth-anything-v2-base" || id === "apple-depth-pro-sharp";
}
