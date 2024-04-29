//import { getQuickJS, QuickJSContext } from 'quickjs-emscripten'
import {
  EventDescriptor,
  Trigger,
  Tick,
  BackdropDescriptor,
} from '@startcoding/types'
import { Message } from 'console-feed/lib/definitions/Component'

// @ts-ignore
import GameWorker from '@startcoding/game?worker'

let lastURL: string
const gameWorker = new GameWorker() as Worker

let onError: (info: {
  line: number,
  column: number,
  message: string[]
}) => void = () => {}

const connectUpdate = (update: (elements: ArrayBuffer, tick: Tick) => void, onLog: (log: Message) => void) => {
  gameWorker.addEventListener(
    'message',
    (
      message: MessageEvent<
        | [action: 'update', changes: ArrayBuffer, tick: Tick]
        | [action: 'tickError', info: {
            line: number,
            column: number,
            message: string[]
          }]
        | [action: 'loadError', info: {
            line: number,
            column: number,
            message: string[]
          }]
        | [action: 'printToConsole', log: Message ]
      >
    ) => {
      const [action] = message.data
      if (action === 'update') {
        const [_, changes, tick] = message.data
        update(changes, tick)
      } else if (action === 'tickError' || action === 'loadError') {
        const [_, info] = message.data
        onError(info)
      } else if (action === 'printToConsole') {
        const [_, log] = message.data
        onLog(log)
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
  onLog
}: {
  update: (elements: ArrayBuffer, tick: Tick) => void,
  onLog: (log: Message) => void
}) => {
  connectUpdate(update, onLog)
  
  return {
    callTick,
    trigger,
    reload: async (code: string) => {
      if (lastURL) {
        URL.revokeObjectURL(lastURL)
      }

      lastURL = URL.createObjectURL(
        new Blob([code], {
          type: 'text/javascript',
        })
      )

      await new Promise<void>((resolve, reject) => {
        const listener = (message: MessageEvent<[action: 'loaded'] | [action: 'loadError', e: 'string']>) => {
          const [action] = message.data

          if (action === 'loaded') {
            resolve()
            gameWorker.removeEventListener('message', listener)
          } else if (action === 'loadError') {
            reject(message.data[1])
            gameWorker.removeEventListener('message', listener)
          }
          
        }

        gameWorker.addEventListener('message', listener)
        gameWorker.postMessage(['start', lastURL])
      })
    },
    setOnError: (handler: typeof onError) => {
      onError = handler
    }
  }
}
