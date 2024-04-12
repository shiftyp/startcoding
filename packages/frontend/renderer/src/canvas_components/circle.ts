import {
  CircleDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
// @ts-ignore
import hexToHSL from 'hex-to-hsl'
import colorspace from 'color-space'
import { ColorMode, daltonize } from "daltonize";

export const CircleSprite = (
  descriptor: CircleDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY, colorMode } = stageContext;
  const { color, x, y, radius, opacity, colorEffect /* angle is ignored */ } = descriptor;

  const transform = new DOMMatrix().translateSelf(
    fromStageX(x),
    fromStageY(y),
    0
  );

  spriteContext.setTransform(transform);
  spriteContext.beginPath();
  spriteContext.arc(0, 0, radius, 0, 2 * Math.PI);
  spriteContext.fillStyle = color;
  let [h, s, l]  = hexToHSL(spriteContext.fillStyle) as [number, number, number]
  h += colorEffect
  let rgb = colorspace.hsl.rgb([h, s, l])
  if (colorMode) {
    rgb = daltonize(rgb, colorMode)
  }
  spriteContext.fillStyle = `RGBA(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(opacity / 100).toFixed(2)})`
  spriteContext.fill();
  spriteContext.closePath();
};
