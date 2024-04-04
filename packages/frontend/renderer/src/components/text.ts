import {
  TextDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
// @ts-ignore
import hexToHSL from 'hex-to-hsl'

export const TextSprite = (
   descriptor: TextDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, size, fontFamily, textAlign, opacity, angle, text, colorEffect} = descriptor;

  spriteContext.setTransform(new DOMMatrix().rotateSelf(angle))

  spriteContext.textAlign = textAlign
  spriteContext.font = size + "px " + fontFamily;
  spriteContext.fillStyle = color;
  const [h, s, l]  = hexToHSL(spriteContext.fillStyle) as [number, number, number]
  spriteContext.fillStyle = `HSLA(${(h + colorEffect) % 360}deg, ${s}%, ${l}%, ${(opacity / 100).toFixed(2)})`
  spriteContext.textAlign = textAlign;
  spriteContext.strokeText(text, x, y)
};
