//import { getQuickJS, QuickJSContext } from 'quickjs-emscripten'
import {
  EventDescriptor,
  Trigger,
  Tick,
  BackdropDescriptor,
} from '@startcoding/types'

// @ts-ignore
import GameWorker from '@startcoding/game?worker'

let lastURL: string
const gameWorker = new GameWorker() as Worker

const connectUpdate = (update: (elements: ArrayBuffer, tick: Tick) => void, updateBackdrop: (backdrop: BackdropDescriptor) => void) => {
  gameWorker.addEventListener(
    'message',
    (
      message: MessageEvent<
        | [action: 'update', changes: ArrayBuffer, tick: Tick]
        | [action: 'updateBackdrop', backdrop: BackdropDescriptor]
      >
    ) => {
      const [action] = message.data
      if (action === 'update') {
        const [_, changes, tick] = message.data
        update(changes, tick)
      } else if (action === 'updateBackdrop') {
        const [_, backdrop] = message.data

        updateBackdrop(backdrop)
      }
    }
  )
}

const trigger: Trigger = (descriptor: EventDescriptor) => {
  gameWorker.postMessage(['trigger', descriptor])
}

const callTick = (tick: Tick) => {
  gameWorker.postMessage(['callTick', tick])
}

export const createNativeVM = async ({
  update,
  updateBackdrop
}: {
  update: (elements: ArrayBuffer, tick: Tick) => void,
  updateBackdrop: (backdrop: BackdropDescriptor) => void
}) => {
  connectUpdate(update, updateBackdrop)
  
  return {
    callTick,
    trigger,
    reload: (code: string) => {
      if (lastURL) {
        URL.revokeObjectURL(lastURL)
      }

      lastURL = URL.createObjectURL(
        new Blob([code], {
          type: 'text/javascript',
        })
      )

      gameWorker.postMessage(['start', lastURL])
    }
  }
}
