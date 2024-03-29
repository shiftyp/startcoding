import { testImageFormat } from 'pixi.js'
import { fetchImage } from './fetch-image'

const imageCache: Record<string, ImageBitmap | true> = {}

type Asset<Kind extends 'image'> = Kind extends 'image'
  ? ImageBitmap
  : never

addEventListener('message', (message: MessageEvent<[action: 'imageFetched', url: string, data: ImageBitmap]>) => {
  const [action, url, data] = message.data
  if (action === 'imageFetched') {
    imageCache[url] = data
  }
})

export const loadImageAsset = <Kind extends 'image'>(
  url: string,
  kind: Kind,
): Asset<Kind> | null => {
  if (kind === 'image') {
    if (imageCache[url] === true) {
      return null
    } else if (imageCache[url]) {
      return imageCache[url] as Asset<Kind>
    } else {
      fetch(url).then(res => res.blob()).then(blob => createImageBitmap(blob)).then(bitmap => imageCache[url] = bitmap)
      imageCache[url] = true
      return null
    }
  }

  throw new ReferenceError(`Unable to retrieve asset of type ${kind} at ${url}`)
}
