import { ColorMode, RGBColor, daltonize } from "daltonize"

addEventListener('message', (message: MessageEvent<[action: 'applyFilters', bitmap: ImageBitmap, url: string, colorMode: ColorMode, opacity: number, filter: string] | [action: 'applyColorMode', bitmap: ImageBitmap, url: string, colorMode: ColorMode]>) => {
  const [action] = message.data

  if (action === 'applyFilters') {
    const [_, image, url, colorMode, clampedOpacity, filter] = message.data

    const processingCanvas = new OffscreenCanvas(image.width, image.height)
    const context = processingCanvas.getContext('2d')!
    context.globalCompositeOperation = "lighten";
    context.globalAlpha = clampedOpacity / 100
    context.filter = filter
    context.drawImage(image, 0, 0)
    const processedImage = processingCanvas.transferToImageBitmap()
    postMessage(['filtersApplied', url, colorMode, clampedOpacity, filter, processedImage], {
      transfer: [processedImage]
    })
  } else if (action === 'applyColorMode') {
    const [_, image, url, colorMode] = message.data
    if (colorMode !== null) {
      const processingCanvas = new OffscreenCanvas(image.width, image.height)
      const context = processingCanvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const imageData = context.getImageData(0, 0, image.width, image.height)
      for (let i = 0; i < imageData.data.length; i += 4) {
        const [r, g, b] = Array.from(imageData.data.slice(i, i + 3)) as RGBColor

        const correctedRgb = daltonize([r, g, b], colorMode) as [number, number, number]


        for (let j = 0; j < 3; j++) {
          imageData.data[i + j] = correctedRgb[j]
        }
      }
      context.putImageData(imageData, 0, 0)
      const processedImage = processingCanvas.transferToImageBitmap()
      postMessage(['colorModeApplied', url, colorMode, processedImage], {
        transfer: [processedImage]
      })
    } else {
      postMessage(['colorModeApplied', url, colorMode, image], {
        transfer: [image]
      })
    }
  }
})