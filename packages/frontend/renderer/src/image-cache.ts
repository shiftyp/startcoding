const imageCache: Record<string, ImageBitmap | true> = {};
const processedCache: Map<ImageBitmap, Map<number, Map<string, ImageBitmap>>> = new Map();

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
  opacity: number,
  filter: string = '',
): ImageBitmap | null => {
  const image = imageCache[url];

  if (image === true) {
    return null;
  } else if (image) {
    const opacityMap = processedCache.get(image)!;
    const clampedOpacity = Math.round(opacity)
    let processedMap = opacityMap.get(clampedOpacity)

    if (!processedMap) {
      processedMap = new Map()
      opacityMap.set(clampedOpacity, processedMap)
    }

    if (!processedMap.has(filter)) {
      const processingCanvas = new OffscreenCanvas(image.width, image.height)
      const context = processingCanvas.getContext('2d')!
      context.globalCompositeOperation = "lighten";
      context.globalAlpha = clampedOpacity / 100
      context.filter = filter
      context.drawImage(image, 0, 0)
      const processedImage = processingCanvas.transferToImageBitmap()
      processedMap.set(filter, processedImage)
    }

    return processedMap.get(filter)!
  }
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob))
    .then((bitmap) => {
      imageCache[url] = bitmap
      const processedMap = new Map([[100, new Map([['', bitmap]])]])
      processedCache.set(bitmap, processedMap)
      loadImageAsset(url, opacity)
      return
    })
  imageCache[url] = true;
  return null;
};
