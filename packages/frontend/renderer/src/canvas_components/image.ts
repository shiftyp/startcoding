import { ImageDescriptor, WorkerStageContext } from "@startcoding/types";
import { loadImageAsset } from "../image_cache";

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
  } else {
    const transform = new DOMMatrix()
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
    spriteContext.setTransform(transform);
    spriteContext.fillStyle = 'rgba(100, 100, 100, 0.5)'
    spriteContext.fillRect(-width / 2, -height / 2, width, height)
    spriteContext.font = `${width / 5}px uicons`;
    spriteContext.fillStyle = 'rgba(255, 255, 255, 0.5)'
    const textSize = spriteContext.measureText("\ufb40")
    spriteContext.fillText("\ufb40", -textSize.width / 2, 0)
  }
};
