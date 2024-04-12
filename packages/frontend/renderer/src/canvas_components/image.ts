import { ImageDescriptor, WorkerStageContext } from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const ImageSprite = (
  descriptor: ImageDescriptor,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY, colorMode } = stageContext;
  const { url, x, y, width, height, angle, opacity, colorEffect } = descriptor;

  let filter = ''

  if (colorEffect !== 0) {
    const clampedColorEffect = (Math.round(colorEffect * 10) / 10) % 360
    filter = `hue-rotate(${clampedColorEffect}deg)`
  }

  let image = loadImageAsset(url, opacity, filter, colorMode);

  if (image) {
    const transform = new DOMMatrix()
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
    spriteContext.setTransform(transform);
    spriteContext.drawImage(image, -width / 2, -height / 2, width, height);
  }
};
