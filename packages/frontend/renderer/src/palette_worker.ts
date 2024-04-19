import { Tick } from "@startcoding/types"
import RGBQuant from 'rgbquant'

let paletteCanvas = new OffscreenCanvas(0, 0)
let paletteResizeCanvas = new OffscreenCanvas(0, 0)
let paletteContext = paletteCanvas.getContext('2d', {
  willReadFrequently: true,
  desynchronized: true
})!
let paletteResizeContext = paletteResizeCanvas.getContext('2d', {
  desynchronized: true
})!

onmessage = async (message: MessageEvent<[action: 'generatePalette', tick: Tick, image: ImageBitmap[]]>) => {
  const [action] = message.data
  if (action === 'generatePalette') {
    const [_, lastRenderedTick, images] = message.data
    if (lastRenderedTick) {
      paletteCanvas.height = Math.floor(lastRenderedTick?.globals.height)
      paletteCanvas.width = Math.floor(lastRenderedTick?.globals.width)
      paletteContext.imageSmoothingEnabled = false

      for (let i = 0; i < images.length; i++) {
        paletteContext.drawImage(images[i], 0, 0, paletteCanvas.width, paletteCanvas.height)
      }

      const quant = new RGBQuant({ colors: 16 })
      const imageData = paletteContext.getImageData(0, 0, paletteCanvas.width, paletteCanvas.height)
      quant.sample(imageData.data)
      const paletteArray = quant.palette(false, false)
      const paletteData = new ImageData(16, paletteArray.length / 16)
      var buffer = new Uint8Array(paletteData.data.buffer);
      buffer.set(paletteArray);
      paletteCanvas.width = paletteData.width
      paletteCanvas.height = paletteData.height
      paletteResizeCanvas.height = Math.ceil(paletteData.height * 426 / 16)
      paletteResizeCanvas.width = 426
      paletteContext.imageSmoothingEnabled = false
      paletteResizeContext.imageSmoothingEnabled = false
      paletteContext.putImageData(paletteData, 0, 0)
      paletteResizeContext.drawImage(paletteCanvas, 0, 0, paletteCanvas.width, paletteCanvas.height, 0, 0, paletteResizeCanvas.width, paletteResizeCanvas.height)
      const url = URL.createObjectURL(await paletteResizeCanvas.convertToBlob())
      postMessage(['updatePalette', url])
    }
  }
}