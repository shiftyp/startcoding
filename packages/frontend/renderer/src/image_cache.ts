import { ColorMode, RGBColor, daltonize } from "daltonize";
// @ts-expect-error
import ImageCacheWorker from './image_cache_worker?worker'

const worker = new ImageCacheWorker() as Worker
const imageCache: Map<`${string}|${ColorMode | null}`, ImageBitmap | true> = new Map();
const processedCache: Map<ColorMode | null, Map<string, Map<number, Map<string, ImageBitmap | true>>>> = new Map();
const urlCache: Map<ImageBitmap | true, string | true> = new Map()

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
  const image = imageCache.get(`${url}|${colorMode}`);

  if (image === true) {
    return null;
  } else if (image) {
    let colorModeMap = processedCache.get(colorMode)!
    let opacityMap = colorModeMap!.get(url)!

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
  Promise.resolve(imageCache.get(`${url}|${null}`))
    .then(image => image ? image : fetch(url)
      .then((res) => res.blob())
      .then((blob) => createImageBitmap(blob))
    )
    .then((bitmap) => {
      imageCache.set(`${url}|${null}`, bitmap)
      if (colorMode !== null) worker.postMessage(['applyColorMode', bitmap, url, colorMode])
      processedCache.get(null)!.get(url)!.get(100)!.set('', bitmap)
      return
    })
  imageCache.set(`${url}|${null}`, true)
  imageCache.set(`${url}|${colorMode}`, true);

  const colorModeNullMap = processedCache.get(null)
  const colorModeMap = processedCache.get(colorMode)

  if (!colorModeNullMap) {
    processedCache.set(null, new Map([[url, new Map([[100, new Map<string, true | ImageBitmap>([['', true]])]])]]))
  } else {
    colorModeNullMap.set(url, new Map([[100, new Map<string, true | ImageBitmap>([['', true]])]]))
  }

  if (!colorModeMap) {
    processedCache.set(colorMode, new Map([[url, new Map([[100, new Map<string, true | ImageBitmap>([['', true]])]])]]))
  } else {
    colorModeMap.set(url, new Map([[100, new Map<string, true | ImageBitmap>([['', true]])]]))
  }
  return null;
};

export const loadImageURL = (...args: [
  url: string,
  opacity: number,
  filter?: string,
  colorMode?: ColorMode | null
]) => {
  const image = loadImageAsset(...args)

  if (image) {
    const url = urlCache.get(image)
    if (typeof url === 'string') {
      return url
    } else if (url === true) {
      return null
    } else {
      const canvas = new OffscreenCanvas(image.width, image.height)
      canvas.getContext('2d')?.drawImage(image, 0, 0)

      urlCache.set(image, true)
      !(async () => {
          urlCache.set(image, URL.createObjectURL(await canvas.convertToBlob()))
      })()
    }
  }

  return null
}

worker.addEventListener('message', (message: MessageEvent<[action: 'filtersApplied', url: string, colorMode: ColorMode, clampedOpacity: number, filter: string, processedImage: ImageBitmap] | [action: 'colorModeApplied', url: string, colorMode: ColorMode, image: ImageBitmap]>) => {
  const [action] = message.data
  if (action === 'filtersApplied') {
    const [_, url, colorMode, clampedOpacity, filter, processedImage] = message.data
    processedCache.get(colorMode)!.get(url)!.get(clampedOpacity)!.set(filter, processedImage)
  } else if (action === 'colorModeApplied') {
    const [_, url, colorMode, processedImage] = message.data
    imageCache.set(`${url}|${colorMode}`, processedImage)
    processedCache.get(colorMode)!.get(url)!.get(100)!.set('', processedImage)
  }
})
