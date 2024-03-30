const imageCache: Record<string, ImageBitmap | true> = {};
const opacityCache: Map<ImageBitmap, Map<number, ImageBitmap>> = new Map();

addEventListener(
  "message",
  (
    message: MessageEvent<
      [action: "imageFetched", url: string, data: ImageBitmap]
    >
  ) => {
    const [action, url, data] = message.data;
    if (action === "imageFetched") {
      imageCache[url] = data;
    }
  }
);

export const loadImageAsset = (
  url: string,
  opacity: number
): ImageBitmap | null => {
  const image = imageCache[url];

  if (image === true) {
    return null;
  } else if (image) {
    const opacityMap = opacityCache.get(image)!;
    const clampedOpacity = Math.round(Math.max(0, Math.min(1, opacity)) / 0.05) * 0.05
    let opacityImage = opacityMap.get(clampedOpacity)

    if (opacityImage) {
      return opacityImage
    } else {
      const opacityCanvas = new OffscreenCanvas(image.width, image.height)
      const context = opacityCanvas.getContext('2d')!
      context.globalCompositeOperation = "lighten";
      context.globalAlpha = clampedOpacity
      context.drawImage(image, 0, 0)
      //context.drawImage(opacityCanvas, 0, 0)
      opacityImage = opacityCanvas.transferToImageBitmap()
      opacityMap.set(clampedOpacity, opacityImage)
      return opacityImage
    }
  }
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob))
    .then((bitmap) => {
      imageCache[url] = bitmap
      const opacityMap = new Map([[1, bitmap]])
      opacityCache.set(bitmap, opacityMap)
      loadImageAsset(url, opacity)
      return
    })
  imageCache[url] = true;
  return null;
};
