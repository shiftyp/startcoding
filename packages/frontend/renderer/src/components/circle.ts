import {
  CircleDescriptor,
  ImageDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
import { loadImageAsset } from "../worker-cache";

export const CircleSprite = (
  descriptor: CircleDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, radius /* angle is ignored */ } = descriptor;

  const transform = new DOMMatrix().translateSelf(
    fromStageX(x),
    fromStageY(y),
    0
  );

  spriteContext.setTransform(transform);
  spriteContext.beginPath();
  spriteContext.arc(0, 0, radius, 0, 2 * Math.PI);
  spriteContext.fillStyle = color;
  spriteContext.fill();
  spriteContext.closePath();
};
