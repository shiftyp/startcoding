import { KIND, Tick } from "@startcoding/types";
import { getLayers, reset } from "./register";
import { backdropDescriptor } from "./components/backdrop";
import StackTrace from "stacktrace-js";
import { buildSpriteTree } from "./collisions";
import protobuf from 'protobufjs'
// @ts-ignore
import protoUrl from '@startcoding/types/changeset.proto?url'
import { MinGCWriter } from './writer'

let error: Error | null = null

let scriptURL = ''

let tickCallbacks: Map<number, Set<(tick: Tick) => void>> = new Map();

const protoPromise = protobuf.load(protoUrl)

export const addTick = (callback: (tick: Tick) => void, priority: number) => {
  if (!tickCallbacks.has(priority)) {
    tickCallbacks.set(priority, new Set())
  }

  const callbacks = tickCallbacks.get(priority)!
  callbacks.add(callback)

  return () => {
    callbacks.delete(callback)
  }
};

export const addAsyncTick = <T>(callback: (tick: Tick) => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const remove = addTick(async (tick) => {
      remove()
      try {
        resolve(await callback(tick))
      } catch (e) {
        if (e instanceof Error) {
          reportError(e)
        } else if (typeof e === 'string') {
          reportError(new Error(e))
        } else {
          throw new TypeError('Unable to report thrown error')
        }
      }
    }, 1)
  })
  
}

export const execute = async (url: string) => {
  reset()
  scriptURL = url
  try {
    await import(url)
  } catch(e) {
    if (e instanceof Error) {
      reportError(e, 'loadError')
    }
  }
}

const reportError = async (e: Error, kind: 'tickError' | 'loadError' = 'tickError') => {
  let messages = [e.message]
  const stack = await StackTrace.fromError(e)

  const firstTrace = stack.find(trace => {
    return trace.fileName === scriptURL
  })!
  
  postMessage([kind, {
    line: firstTrace.lineNumber,
    column: firstTrace.columnNumber,
    messages
  }])
}

export const getError = () => error

export const callTick = (tick: Tick) => {
  for (const key in tick.globals) {
    // @ts-expect-error
    self[key as keyof Tick["globals"]] = tick.globals[key as keyof Tick["globals"]];
  }

  const tickCallbackArray = Array.from(tickCallbacks.entries()).sort(([priorityA], [priorityB]) => {
    return priorityA - priorityB
  })

  tickCallbackArray.map(([_, callbacks]) => {
    try {
      callbacks.forEach(callback => callback(tick));
      return true
    } catch(e: any) {
      if (e instanceof Error) {
        reportError(e)
        error = e
        throw e
      }
    }
  });

  error = null

  update(tick);
  
  return Promise.resolve().then(buildSpriteTree)
};

const update = async (tick: Tick) => {
  const root = await protoPromise
  const layerProto = root.lookupType('types.ChangeSet')
  const toSerialize = {
    layers: Array.from(getLayers().entries())
    .sort(([aIndex], [bIndex]) => aIndex - bIndex)
    .map(([index, layer]) => ({
      index,
      layer: Array.from(layer)
    }))
  }

  const buffer = layerProto.encode(layerProto.create(toSerialize), new MinGCWriter()).finish()
  postMessage(["update", buffer.buffer, tick], {
    transfer: [buffer.buffer]
  });  
};

export const resetTickCallbacks = () => {
  tickCallbacks = 
    tickCallbacks.has(0) ? 
     new Map([[0, tickCallbacks.get(0)!]]) :
     new Map();
}