import { KIND, Tick } from "@startcoding/types";
import { getLayers, reset } from "./register";
import { backdropDescriptor } from "./components/backdrop";
import StackTrace from "stacktrace-js";
import { ZodError } from "zod";

let scriptURL = ''

let tickCallbacks: Map<number, Set<(tick: Tick) => void>> = new Map();

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

export const execute = async (url: string) => {
  reset()
  scriptURL = url
  await import(url)
}

export const callTick = async (tick: Tick) => {
  for (const key in tick.globals) {
    // @ts-expect-error
    self[key as keyof Tick["globals"]] = tick.globals[key as keyof Tick["globals"]];
  }

  const tickCallbackArray = Array.from(tickCallbacks.entries()).sort(([priorityA], [priorityB]) => {
    return priorityA - priorityB
  })

  tickCallbackArray.forEach(async ([_, callbacks]) => {
    try {
      callbacks.forEach(callback => callback(tick));
    } catch(e: any) {
      if (e instanceof Error) {
        let messages = [e.message]

        if (e instanceof ZodError) {
          const formatted = e.format()
          // @ts-expect-error
          messages = recursiveMessages(formatted)
        }

        const stack = await StackTrace.fromError(e)

        const firstTrace = stack.find(trace => {
          return trace.fileName === scriptURL
        })!

        if (!firstTrace) {
          throw e
        }

        postMessage(['tickError', {
          line: firstTrace.lineNumber,
          column: firstTrace.columnNumber,
          messages
        }])
      }
    }
  });

  update(tick);
};

const update = async (tick: Tick) => {
  const serialized = Array.from(getLayers().entries())
    .sort(([aIndex], [bIndex]) => aIndex - bIndex)
    .map(([index, layer]) => [index, Array.from(layer).map(({ [KIND]: kind, ...rest }) => ({ kind, descriptor: rest }))]);

  if (backdropDescriptor) {
    // @ts-expect-error
    (serialized as ChangeSet).unshift([-1e10, [{ kind: 'backdrop', descriptor: backdropDescriptor }]])
  }

  const buffer = new TextEncoder().encode(JSON.stringify(serialized)).buffer;

  postMessage(["update", buffer, tick], {
    transfer: [buffer]
  });
};

export const resetTickCallbacks = () => {
  tickCallbacks = 
    tickCallbacks.has(0) ? 
     new Map([[0, tickCallbacks.get(0)!]]) :
     new Map();
}