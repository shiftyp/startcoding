import {
  CircleDescriptor,
  ImageDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const CircleSprite = (
  descriptor: CircleDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, radius, opacity /* angle is ignored */ } = descriptor;

  const transform = new DOMMatrix().translateSelf(
    fromStageX(x),
    fromStageY(y),
    0
  );

  spriteContext.setTransform(transform);
  spriteContext.beginPath();
  spriteContext.arc(0, 0, radius, 0, 2 * Math.PI);
  spriteContext.fillStyle = color;
  spriteContext.fillStyle = spriteContext.fillStyle.substring(0, 7) + Math.floor(opacity * 255).toString(16)
  spriteContext.fill();
  spriteContext.closePath();
};
