import { ImageDescriptor, WorkerStageContext } from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const ImageSprite = (
  descriptor: ImageDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY } = stageContext;
  const { url, x, y, width, height, angle, opacity } = descriptor;

  let image = loadImageAsset(url, opacity);

  if (image) {
    const transform = new DOMMatrix()
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
    spriteContext.setTransform(transform);
    spriteContext.drawImage(image, -width / 2, -height / 2, width, height);
  }
};
