import { ColorMode, RGBColor, daltonize } from "daltonize";
// @ts-expect-error
import ImageCacheWorker from './image_cache_worker?worker'

const worker = new ImageCacheWorker() as Worker
const imageCache: Record<string, ImageBitmap | true> = {};
const processedCache: Map<ColorMode | null, Map<string, Map<number, Map<string, ImageBitmap | true>>>> = new Map();

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

    let opacityMap = colorModeMap!.get(url);

    if (!opacityMap) {
      opacityMap = new Map()
      colorModeMap?.set(url, opacityMap)
    }
    const clampedOpacity = Math.round(opacity)
    let processedMap = opacityMap.get(clampedOpacity)

    if (!processedMap) {
      processedMap = new Map()
      opacityMap.set(clampedOpacity, processedMap)
    }

    if (!processedMap.has(filter)) {
      worker.postMessage(['applyFilters', image, url, colorMode, clampedOpacity, filter])
      processedMap.set(filter, true)
      return null
    } else if (processedMap.get(filter) === true) {
      return null
    }

    return processedMap.get(filter)! as ImageBitmap
  }
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob))
    .then((bitmap) => {
      imageCache[url] = bitmap
      const map = new Map([[url, new Map([[100, new Map([['', bitmap]])]])]])
      processedCache.set(null, map)
      loadImageAsset(url, opacity, filter, colorMode)
      return
    })
  imageCache[url] = true;
  return null;
};

worker.addEventListener('message', (message: MessageEvent<[action: 'filtersApplied', url: string, colorMode: ColorMode, clampedOpacity: number, filter: string, processedImage: ImageBitmap]>) => {
  const [action] = message.data
  if (action === 'filtersApplied') {
    const [_, url, colorMode, clampedOpacity, filter, processedImage] = message.data
    processedCache.get(colorMode)!.get(url)!.get(clampedOpacity)!.set(filter, processedImage)
  }
})
