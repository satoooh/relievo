export type SourceKind = "blank" | "demo" | "image" | "video" | "webcam";

export type ScanDirection = "left-right" | "right-left" | "top-bottom" | "bottom-top";

export type DemoSceneId = "studio" | "mountain" | "product" | "alley" | "motion-sweep";

export type QualityMode = "visual" | "balanced" | "quality";

export type ArtMode = "relief" | "memory";

export type ReliefMaterial = "depthkit" | "fabric";

export type DepthBackendSelection =
  | "worker-cpu-heuristic"
  | "depth-anything-v2-small"
  | "depth-anything-v2-base";

export type DepthBackend = "cpu-heuristic" | DepthBackendSelection;

export interface ReliefParams {
  artMode: ArtMode;
  reliefMaterial: ReliefMaterial;
  depthBackend: DepthBackendSelection;
  gridWidth: number;
  gridHeight: number;
  depthScale: number;
  depthGamma: number;
  pointSize: number;
  pointOpacity: number;
  colorStrength: number;
  temporalSmoothing: number;
  backgroundFade: number;
  foregroundBoost: number;
  nearThreshold: number;
  farThreshold: number;
  brightness: number;
  textureMix: number;
  inferenceFPS: number;
  renderScale: number;
  adaptiveQuality: boolean;
  qualityMode: QualityMode;
  morphAmount: number;
  morphSpeed: number;
  particleInertia: number;
  scanReveal: number;
  scanDirection: ScanDirection;
  trailAmount: number;
  breathing: number;
  depthQuantize: number;
  monochrome: boolean;
  glitchAmount: number;
}

export type ExportQuality = "web" | "archive";

export interface ReliefPreset {
  id: string;
  name: string;
  description: string;
  params: Partial<ReliefParams>;
}

export interface FrameSample {
  data: ImageData;
  width: number;
  height: number;
  sourceKind: SourceKind;
  timestamp: number;
}

export interface DepthResult {
  depth: Float32Array;
  width: number;
  height: number;
  backend: DepthBackend;
  inferenceMs: number;
}

export interface RuntimeStats {
  renderFPS: number;
  inferenceFPS: number;
  inferenceMs: number;
  backend: DepthBackend;
  sourceKind: SourceKind;
  webgpuAvailable: boolean;
  recordingSupported: boolean;
  recording: boolean;
  quality: string;
  pipeline: string;
  message: string;
  loading: boolean;
  loadingLabel: string;
}

export interface MediaSourceHandle {
  kind: SourceKind;
  element?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
  stop: () => void;
}
