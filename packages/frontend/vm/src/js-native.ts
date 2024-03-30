//import { getQuickJS, QuickJSContext } from 'quickjs-emscripten'
import {
  EventDescriptor,
  Trigger,
  Tick,
  BackdropDescriptor,
} from '@startcoding/types'

let gameWorker: Worker

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

export const createNativeVM = ({
  update,
  updateBackdrop
}: {
  update: (elements: ArrayBuffer, tick: Tick) => void,
  updateBackdrop: (backdrop: BackdropDescriptor) => void
}) => {
  if (gameWorker) {
    gameWorker.terminate()
  }

  return {
    callTick,
    trigger,
    reload: (code: string) => {
      const url = URL.createObjectURL(
        new Blob([code], {
          type: 'text/javascript',
        })
      )
    
      gameWorker = new Worker(url)
    
      connectUpdate(update, updateBackdrop)
    }
  }
}
