import { ColorMode, RGBColor, daltonize } from "daltonize";

const imageCache: Record<string, ImageBitmap | true> = {};
const processedCache: Map<ColorMode | null, Map<ImageBitmap, Map<number, Map<string, ImageBitmap>>>> = new Map();

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
  colorMode: ColorMode | null = null
): ImageBitmap | null => {
  const image = imageCache[url];

  if (image === true) {
    return null;
  } else if (image) {
    let colorModeMap = processedCache.get(colorMode)

    if (!colorModeMap) {
      colorModeMap = new Map()
      processedCache.set(colorMode, colorModeMap)
    }

    let opacityMap = colorModeMap!.get(image);

    if (!opacityMap) {
      opacityMap = new Map()
      colorModeMap?.set(image, opacityMap)
    }
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
      if (colorMode !== null) {
        const imageData = context.getImageData(0, 0, image.width, image.height)
        for (let i = 0; i < imageData.data.length; i += 4) {
          const [r, g, b] = Array.from(imageData.data.slice(i, i + 3)) as RGBColor

          const correctedRgb = daltonize([r, g, b], colorMode) as [number, number, number]


          for (let j = 0; j < 3; j++) {
            imageData.data[i + j] = correctedRgb[j]
          }
        }
        context.putImageData(imageData, 0, 0)
      }
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
      const map = new Map([[bitmap, new Map([[100, new Map([['', bitmap]])]])]])
      processedCache.set(null, map)
      loadImageAsset(url, opacity, filter, colorMode)
      return
    })
  imageCache[url] = true;
  return null;
};
