import { getQuickJS, QuickJSContext } from 'quickjs-emscripten'
import LightningFS from '@isomorphic-git/lightning-fs'
import {
  ElementDescriptor,
  EventDescriptor,
  Listen,
  Register,
  Trigger,
  Tick,
} from '@startcoding/types'
import { getGameIndex } from '@startcoding/game'

const connectPerfNow = (vm: QuickJSContext) => {
  const __perfNow__ = vm.newFunction('__perfNow__', () => {
    return {
      value: vm.newNumber(performance.now())
    }
  })

  vm.setProp(vm.global, '__perfNow__', __perfNow__)
}

const connectUpdate = (vm: QuickJSContext, update: (elements: Record<number, ElementDescriptor>) => void) => {
  const __update__ = vm.newFunction('__update__', (elements) => {
    update(vm.dump(elements))
  })

  vm.setProp(vm.global, '__update__', __update__)
}

const connectListen = (vm: QuickJSContext, listen: Listen) => {
  const __listen__ = vm.newFunction('__listen__', (descriptor) => {
    const { remove } = listen(vm.dump(descriptor) as EventDescriptor)
    const value = vm.newFunction('remove', () => {
      remove()
    })

    return {
      value,
    }
  })

  vm.setProp(vm.global, '__listen__', __listen__)
}

const connectLog = (vm: QuickJSContext) => {
  const log = vm.newFunction('__listen__', (...args) => {
    console.log('VM:', ...args.map(vm.dump))
  })

  vm.setProp(vm.global, 'log', log)
}

const connectTrigger =
  (vm: QuickJSContext): Trigger =>
  (descriptor) => {
    vm.evalCode(`__trigger__(${JSON.stringify(descriptor)})`)
  }

const connectCallTick = (vm: QuickJSContext) => {
  return (tick: Tick) => {
    vm.evalCode(`__tick__(${JSON.stringify(tick)})`)
  }
}

export const runJS = async ({
  code,
  update,
  setCallTick,
  setTrigger,
}: {
  code: string
  update: (elements: Record<number, ElementDescriptor>) => void
  setTrigger: (trigger: Trigger) => void
  setCallTick: (callTick: (tick: Tick) => void) => void
}) => {
  const quickjs = await getQuickJS()
  const vm = quickjs.newContext()

  connectPerfNow(vm)
  connectLog(vm)
  connectUpdate(vm, update)
  setTrigger(connectTrigger(vm))
  setCallTick(connectCallTick(vm))

  // @ts-ignore
  const index = await getGameIndex('javascript')

  let result

  result = vm.evalCode(`
    ${index}
    ${code}
  `)
}
