import { ElementDescriptor, EventDescriptor, Listen, Register, Trigger } from "@startcoding/types"
import { QuickJSContext } from "quickjs-emscripten"

export const connectRegister = (
  vm: QuickJSContext,
  register: Register
) => {
  const __register__ = vm.newFunction('__register__', (kind) => {
    const { update, dispose, id } = register(vm.dump(kind) as ElementDescriptor["kind"])

    const value = vm.newObject()

    vm.setProp(value, 'update', vm.newFunction('update', (descriptor) => {
      update(vm.dump(descriptor))
    }))
    vm.setProp(value, 'dispose', vm.newFunction('dispose', (descriptor) => {
      dispose()
    }))
    vm.setProp(value, 'id', vm.newNumber(id))

    return {
      value
    }
  })

  vm.setProp(vm.global, '__register__', __register__)
}

export const connectListen = (
  vm: QuickJSContext,
  listen: Listen
) => {
  const __listen__ = vm.newFunction('__listen__', (descriptor) => {
    const { remove } = listen(vm.dump(descriptor) as EventDescriptor)
    const value = vm.newFunction('remove', () => {
      remove()
    })

    return {
      value
    }
  })

  vm.setProp(vm.global, '__listen__', __listen__)
}

export const connectLog = (
  vm: QuickJSContext,
) => {
  const log = vm.newFunction('__listen__', (...args) => {
    console.log('VM:', ...args.map(vm.dump))
  })

  vm.setProp(vm.global, 'log', log)
}

export const connectTrigger = (vm: QuickJSContext): Trigger => (descriptor) => {
  vm.evalCode(`__trigger__(${JSON.stringify(descriptor)})`)
}

export const connectCallTick = (vm: QuickJSContext) => {
  let lastTime = performance.now()

  return (delta: number) => {
    const deltaTime = performance.now() - lastTime
    lastTime = performance.now()
    vm.evalCode(`__tick__(${deltaTime})`)
  }
}