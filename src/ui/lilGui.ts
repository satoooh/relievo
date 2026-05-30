import GUI from "lil-gui";
import type { ReliefParams } from "../types";

export function createAdvancedGui(params: ReliefParams, onChange: () => void): GUI {
  const gui = new GUI({ title: "Relievo advanced" });
  gui.close();

  const depth = gui.addFolder("Depth");
  depth.add(params, "depthScale", 0, 6, 0.05).onChange(onChange);
  depth.add(params, "depthGamma", 0.3, 2.4, 0.01).onChange(onChange);
  depth.add(params, "temporalSmoothing", 0, 0.96, 0.01).onChange(onChange);
  depth.add(params, "foregroundBoost", 0, 1, 0.01).onChange(onChange);
  depth.add(params, "backgroundFade", 0.05, 1, 0.01).onChange(onChange);

  const render = gui.addFolder("Render");
  render.add(params, "pointSize", 0.5, 6, 0.1).onChange(onChange);
  render.add(params, "pointOpacity", 0.05, 1, 0.01).onChange(onChange);
  render.add(params, "colorStrength", 0, 1, 0.01).onChange(onChange);
  render.add(params, "renderScale", 0.5, 1.25, 0.05).onChange(onChange);

  const motion = gui.addFolder("Motion");
  motion.add(params, "morphAmount", 0, 1, 0.01).onChange(onChange);
  motion.add(params, "morphSpeed", 0.05, 1, 0.01).onChange(onChange);
  motion.add(params, "scanReveal", 0, 1, 0.01).onChange(onChange);
  motion.add(params, "breathing", 0, 0.4, 0.01).onChange(onChange);
  motion.add(params, "glitchAmount", 0, 0.35, 0.01).onChange(onChange);

  return gui;
}
