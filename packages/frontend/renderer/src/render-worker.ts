import { ImageSprite } from './components/image'
import {
  Component,
  ElementDescriptor,
  Language,
  Tick,
  Trigger,
  WorkerStageContext,
} from '@startcoding/types'

let spriteCanvas = new OffscreenCanvas(0, 0)
let stageContext: WorkerStageContext = {
  spriteContext: spriteCanvas.getContext('2d', {})!,
  width: 0,
  height: 0,
  fromStageX: (x: number) => {
    return x + (stageContext.width || 0) / 2
  },
  fromStageY: (y: number) => {
    return y + (stageContext.height || 0) / 2
  },
  fromClientX: (x: number) => {
    return x - (stageContext.width || 0) / 2
  },
  fromClientY: (y: number) => {
    return y - (stageContext.height || 0) / 2
  },
}

const render = (changes: Record<number, ElementDescriptor>, tick: Tick) => {
  if (stageContext.width !== tick.globals.width) {
    stageContext.width = spriteCanvas.width = tick.globals.width
  }
  if (stageContext.height !== tick.globals.height) {
    stageContext.height = spriteCanvas.height = tick.globals.height
  }

  for (let index of Object.keys(changes)) {
    const change = changes[parseInt(index)]
    if (change !== null) {
      switch (change.kind) {
        case 'image':
          // @ts-ignore
          ImageSprite(index, change, stageContext)
      }
    }
  }

  const frame = spriteCanvas.transferToImageBitmap()

  postMessage(['renderSprites', frame, tick], { transfer: [frame] })
}

addEventListener(
  'message',
  async (
    message: MessageEvent<[action: 'update', changes: ArrayBuffer, tick: Tick]>
  ) => {
    const [action] = message.data

    if (action === 'update') {
      const [_, changes, tick] = message.data
      const string = new TextDecoder().decode(changes)

      render(JSON.parse(string), tick)
    }
  }
)
