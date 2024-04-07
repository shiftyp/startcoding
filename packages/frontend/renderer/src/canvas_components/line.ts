import {
  LineDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
// @ts-ignore
import hexToHSL from 'hex-to-hsl'

export const LineSprite = (
  descriptor: LineDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, x1, y1, width, opacity, colorEffect /* angle is ignored */ } = descriptor;

  spriteContext.setTransform(new DOMMatrix())

  spriteContext.beginPath();
  spriteContext.lineWidth = width;
  spriteContext.moveTo(fromStageX(x), fromStageY(y));
  spriteContext.lineTo(fromStageX(x1), fromStageY(y1));
  spriteContext.strokeStyle = color
  const [h, s, l]  = hexToHSL(spriteContext.strokeStyle) as [number, number, number]
  spriteContext.strokeStyle = `HSLA(${h + colorEffect}deg, ${s}%, ${l}%, ${(opacity / 100).toFixed(2)})`
  spriteContext.stroke;
  spriteContext.stroke();
  spriteContext.closePath();
};
