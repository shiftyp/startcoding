import { AnimationDescriptor, Animations, WorkerStageContext, animationInfo } from "@startcoding/types";
import { loadImageAsset } from "../image_cache";

const sheetLength = 8

const transform = new DOMMatrix()

export const AnimationSprite = <Image extends keyof Animations, Costume extends keyof Animations[Image], Animation extends keyof Animations[Image][Costume]>(
  descriptor: AnimationDescriptor<Image, Costume, Animation>,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY, colorMode } = stageContext;
  const { image, animation, costume, frame, x, y, size, angle, opacity, colorEffect } = descriptor;
  const sizeRatio = size / 100
  // @ts-ignore
  const { url, frameHeight, frameWidth, frames } = animationInfo[image][costume][animation]
  const height = frameHeight * sizeRatio
  const width = frameWidth * sizeRatio
  
  let filter = ''
  let clampedFrame = frame % frames

  if (colorEffect !== 0) {
    const clampedColorEffect = (Math.round(colorEffect * 10) / 10) % 360
    filter = `hue-rotate(${clampedColorEffect}deg)`
  }

  let imageBitmap = loadImageAsset(url, opacity, filter, colorMode);

  if (!transform.isIdentity) {
    transform.a = transform.d = 1;
    transform.b = transform.c = transform.e = transform.f = 0;
  }

  if (imageBitmap) {
    transform
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
    spriteContext.setTransform(transform);
    spriteContext.drawImage(imageBitmap, (clampedFrame % Math.ceil(frames / sheetLength)) * frameWidth, Math.floor(clampedFrame / Math.ceil(frames / sheetLength)) * frameHeight, frameWidth, frameHeight, -width / 2, -height / 2, width, height);
  } else {
    transform
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
      spriteContext.setTransform(transform);
      spriteContext.fillStyle = 'rgba(100, 100, 100, 0.5)'
      spriteContext.fillRect(-width / 2, -height / 2, width, height)
      spriteContext.font = `${width / 2}px uicons`;
      spriteContext.fillStyle = 'rgba(255, 255, 255, 0.5)'
      const textSize = spriteContext.measureText("\ufb40")
      spriteContext.fillText("\ufb40", -textSize.width / 2, (textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent) / 2)
  }
};
