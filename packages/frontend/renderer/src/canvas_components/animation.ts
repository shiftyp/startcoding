import { AnimationDescriptor, Animations, WorkerStageContext, animationInfo } from "@startcoding/types";
import { loadImageAsset } from "../image-cache";

export const AnimationSprite = <Image extends keyof Animations, Costume extends keyof Animations[Image], Animation extends keyof Animations[Image][Costume]>(
  descriptor: AnimationDescriptor<Image, Costume, Animation>,
  stageContext: WorkerStageContext
) => {
  const { spriteContext, fromStageX, fromStageY, colorMode } = stageContext;
  const { image, animation, costume, frame, x, y, width, height, angle, opacity, colorEffect } = descriptor;

  // @ts-ignore
  const { url, frameHeight, frameWidth, frames } = animationInfo[image][costume][animation]
  
  let filter = ''
  let clampedFrame = frame % frames

  if (colorEffect !== 0) {
    const clampedColorEffect = (Math.round(colorEffect * 10) / 10) % 360
    filter = `hue-rotate(${clampedColorEffect}deg)`
  }

  let imageBitmap = loadImageAsset(url, opacity, filter, colorMode);

  if (imageBitmap) {
    const transform = new DOMMatrix()
      .translateSelf(fromStageX(x), fromStageY(y), 0)
      .rotateSelf(-angle - 180);
    spriteContext.setTransform(transform);
    spriteContext.drawImage(imageBitmap, (clampedFrame % Math.ceil(frames / 16)) * frameWidth, Math.floor(clampedFrame / Math.ceil(frames / 16)) * frameHeight, frameWidth, frameHeight, -width / 2, -height / 2, width, height);
  }
};
