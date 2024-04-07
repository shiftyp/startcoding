import {
  CircleDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
// @ts-ignore
import hexToHSL from 'hex-to-hsl'

export const CircleSprite = (
  descriptor: CircleDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
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
  const [h, s, l]  = hexToHSL(spriteContext.fillStyle) as [number, number, number]
  spriteContext.fillStyle = `HSLA(${(h + colorEffect) % 360}deg, ${s}%, ${l}%, ${(opacity / 100).toFixed(2)})`
  spriteContext.fill();
  spriteContext.closePath();
};
