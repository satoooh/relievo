import type { DemoSceneId, ExportQuality, ReliefParams, SourceKind } from "../types";

export interface ShareableState {
  demoSceneId: DemoSceneId;
  emojiMode: boolean;
  exportQuality: ExportQuality;
  performanceMode: boolean;
  presetId: string;
  sourceKind: SourceKind;
  params: ReliefParams;
}

const numericParamKeys = [
  "depthScale",
  "depthGamma",
  "pointSize",
  "pointOpacity",
  "colorStrength",
  "temporalSmoothing",
  "backgroundFade",
  "foregroundBoost",
  "nearThreshold",
  "farThreshold",
  "brightness",
  "textureMix",
  "inferenceFPS",
  "renderScale",
  "morphAmount",
  "morphSpeed",
  "particleInertia",
  "scanReveal",
  "trailAmount",
  "breathing",
  "depthQuantize",
  "glitchAmount",
] as const;

const booleanParamKeys = ["adaptiveQuality", "monochrome"] as const;

export function encodeShareableState(state: ShareableState): string {
  const query = new URLSearchParams();
  query.set("preset", state.presetId);
  query.set("source", shareableSourceKind(state.sourceKind));
  query.set("scene", state.demoSceneId);
  query.set("perform", state.performanceMode ? "1" : "0");
  query.set("emoji", state.emojiMode ? "1" : "0");
  query.set("export", state.exportQuality);
  query.set("art", state.params.artMode);
  query.set("material", state.params.reliefMaterial);
  query.set("backend", state.params.depthBackend);
  query.set("qualityMode", state.params.qualityMode);

  for (const key of numericParamKeys) {
    query.set(key, formatParamNumber(state.params[key]));
  }

  for (const key of booleanParamKeys) {
    query.set(key, state.params[key] ? "1" : "0");
  }

  return `#${query.toString()}`;
}

export function decodeShareableState(hash: string): Partial<ShareableState> {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  const query = new URLSearchParams(normalized);
  const params: Partial<ReliefParams> = {};

  for (const key of numericParamKeys) {
    const value = query.get(key);
    if (value !== null && value.trim() !== "") {
      params[key] = Number(value);
    }
  }

  for (const key of booleanParamKeys) {
    const value = query.get(key);
    if (value !== null) {
      params[key] = value === "1" || value === "true";
    }
  }

  const backend = query.get("backend");
  if (
    backend === "depth-anything-v2-base" ||
    backend === "depth-anything-v2-small" ||
    backend === "worker-cpu-heuristic"
  ) {
    params.depthBackend = backend;
  }

  const artMode = query.get("art");
  if (artMode === "relief" || artMode === "memory") {
    params.artMode = artMode;
  }

  const reliefMaterial = query.get("material");
  if (reliefMaterial === "depthkit" || reliefMaterial === "fabric") {
    params.reliefMaterial = reliefMaterial;
  }

  const qualityMode = query.get("qualityMode");
  if (qualityMode === "visual" || qualityMode === "balanced" || qualityMode === "quality") {
    params.qualityMode = qualityMode;
  }

  return {
    demoSceneId: parseDemoSceneId(query.get("scene")),
    emojiMode: parseBoolean(query.get("emoji")),
    exportQuality: parseExportQuality(query.get("export")),
    performanceMode: parseBoolean(query.get("perform")),
    presetId: query.get("preset") ?? undefined,
    sourceKind: parseSourceKind(query.get("source")),
    params: Object.keys(params).length > 0 ? (params as ReliefParams) : undefined,
  };
}

function shareableSourceKind(kind: SourceKind): SourceKind {
  return kind === "image" || kind === "video" || kind === "webcam" ? "blank" : kind;
}

function parseSourceKind(value: string | null): SourceKind | undefined {
  if (value === "blank" || value === "demo") {
    return value;
  }
  return undefined;
}

function parseDemoSceneId(value: string | null): DemoSceneId | undefined {
  if (value === "studio" || value === "mountain" || value === "product" || value === "alley" || value === "motion-sweep") {
    return value;
  }
  return undefined;
}

function parseExportQuality(value: string | null): ExportQuality | undefined {
  if (value === "web" || value === "archive") {
    return value;
  }
  return undefined;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) {
    return undefined;
  }
  return value === "1" || value === "true";
}

function formatParamNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
