import {
  LineDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
// @ts-ignore
import hexToHSL from 'hex-to-hsl'
import colorspace from 'color-space'
import { ColorMode, daltonize } from "daltonize";

export const LineSprite = (
  descriptor: LineDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY, colorMode } = stageContext;
  const { color, x, y, x1, y1, width, opacity, colorEffect /* angle is ignored */ } = descriptor;

  spriteContext.setTransform(new DOMMatrix())

  spriteContext.beginPath();
  spriteContext.lineWidth = width;
  spriteContext.moveTo(fromStageX(x), fromStageY(y));
  spriteContext.lineTo(fromStageX(x1), fromStageY(y1));
  spriteContext.strokeStyle = color
  let [h, s, l]  = hexToHSL(spriteContext.strokeStyle) as [number, number, number]
  h += colorEffect
  let rgb = colorspace.hsl.rgb([h, s, l])
  if (colorMode) {
    rgb = daltonize(rgb, colorMode)
  }
  spriteContext.strokeStyle = `RGBA(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${(opacity / 100).toFixed(2)})`
  spriteContext.stroke;
  spriteContext.stroke();
  spriteContext.closePath();
};
