import {
  CircleDescriptor,
  ImageDescriptor,
  LineDescriptor,
  TextDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const TextSprite = (
   descriptor: TextDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, size, fontFamily, textAlign, opacity, angle, text} = descriptor;

  spriteContext.setTransform(new DOMMatrix().rotateSelf(angle))

  spriteContext.textAlign = textAlign
  spriteContext.font = size + "px " + fontFamily;
  spriteContext.fillStyle = color;
  spriteContext.textAlign = textAlign;
  spriteContext.strokeText(text, x, y)
};
