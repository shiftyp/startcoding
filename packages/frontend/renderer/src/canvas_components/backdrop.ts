import { BackdropDescriptor, ImageDescriptor, WorkerStageContext } from "@startcoding/types";
import { loadImageAsset } from "../image_cache";

export const BackdropSprite = (
  descriptor: BackdropDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, width, height } = stageContext;
  const { url, style } = descriptor;


  let image = loadImageAsset(url, 100, '');

  if (image) {
    const transform = new DOMMatrix()
    spriteContext.setTransform(transform)
    spriteContext.drawImage(image, 0, 0, width, height);
  }
};
