import {
  CircleDescriptor,
  ImageDescriptor,
  LineDescriptor,
  WorkerStageContext,
} from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const LineSprite = (
  descriptor: LineDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { color, x, y, x1, y1, width /* angle is ignored */ } = descriptor;

  spriteContext.setTransform(new DOMMatrix())

  spriteContext.beginPath();
  spriteContext.lineWidth = width;
  spriteContext.moveTo(fromStageX(x), fromStageY(y));
  spriteContext.lineTo(fromStageX(x1), fromStageY(y1));
  spriteContext.strokeStyle = color;
  spriteContext.stroke;
  spriteContext.stroke();
  spriteContext.closePath();
};
