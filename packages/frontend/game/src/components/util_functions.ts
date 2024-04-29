import { Hook } from 'console-feed'
import { AbstractElement } from './abstract_element';
import { addAsyncTick, addTick } from '../loop';
import { Tick } from '@startcoding/types';
import { validate } from '../utils';

export const randomX = () => {
  return Math.random() * self.width + self.minX;
};

export const randomY = () => {
  return Math.random() * self.height + self.minY;
};

Hook(
  console,
  (log) => postMessage(['printToConsole', log])
)

const wrapConsoleMethod = (method: 'log' | 'error' | 'debug' | 'info') => {
  const oldMethod = console[method].bind(console)

  console[method] = (...args) => {
    const newArgs = args.map(arg => {
      if (arg instanceof AbstractElement) {
        return arg.toJSON()
      } else {
        return arg
      }
    })

    oldMethod(...newArgs)
  }
}

(['log', 'error', 'debug', 'info'] as const).forEach(wrapConsoleMethod)

const nextTick = () => {
  return new Promise<Tick>((resolve, reject) => {
    const remove = addTick((tick) => {
      remove()
      resolve(tick)
    }, 2)
  })
}

export const until = async (condition: (timePassed: number) => boolean) => {
  let timePassed = 0

  while (!condition(timePassed)) {
    const tick = await nextTick()
    timePassed += tick.timing.deltaTime
  }
}

export const repeatUntil = async (condition: (timePassed: number) => boolean) => {
  let timePassed = 0
  const tick = await nextTick()
  return !condition(timePassed)
}

export const range = function*(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i
  }
}

export const wait = validate(
  { type: 'number', min: 0 },
  { type: 'string', pattern: /second[s]?|millisecond[s]?/ },
)(
  (duration: number, unit: 'seconds' | 'second' | 'milliseconds' | 'millisecond') => {
    return until((timePassed) => {
      switch (unit) {
        case 'second':
        case 'seconds':
          return timePassed >= duration * 1000;
          break;
        case 'millisecond':
        case 'milliseconds':
          return timePassed >= duration;
          break;
      }
    })
  }
)

export const always = async () => {
  await nextTick()
  return true
}

export const run = <T>(fn: () => Promise<T>): Promise<T> => {
  return addAsyncTick(fn)
}

declare global {
  interface WorkerGlobalScope {
    until: typeof until,
    repeatUntil: typeof repeatUntil
    wait: typeof wait
    run: typeof run
    always: typeof always
    randomX: typeof randomX
    randomY: typeof randomY
  }
}

self.until = until
self.repeatUntil = repeatUntil
self.wait = wait
self.run = run
self.always = always
self.randomX = randomX
self.randomY = randomY

export { }