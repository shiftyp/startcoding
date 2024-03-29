import LightningFS from '@isomorphic-git/lightning-fs'
import {
  ElementDescriptor,
  EventDescriptor,
  Listen,
  Register,
  Tick,
  Trigger,
} from '@startcoding/types'
import { loadPyodide, PyodideInterface } from 'pyodide'
import { getGameIndex } from '@startcoding/game'

const connectListen = (globals: any, listen: Listen) => {
  // @ts-ignore
  globals.set('__listen__', (descriptor: { toJs: () => Map<string, any>}) =>
    listen(Object.fromEntries(descriptor.toJs().entries()) as EventDescriptor)
  )
}

const connectLog = (globals: any) => {
  globals.set('log', (...args: any[]) =>
    console.log(
      'Python:',
      ...args.map((arg) =>
        arg && typeof arg['toJs'] === 'function' ? arg.toJs() : arg
      )
    )
  )
}

const connectTrigger =
  (vm: PyodideInterface, globals: any): Trigger =>
  (descriptor) => {
    vm.runPython(`__trigger__(json.loads('${JSON.stringify(descriptor)}'))`, {
      globals,
    })
  }

const connectCallTick = (vm: PyodideInterface, globals: any) => {
  return (tick: Tick) => {
    vm.runPython(`__tick__(json.loads('${JSON.stringify(tick)}'))`, {
      globals,
    })
  }
}

export const runPY = async ({
  fs,
  register,
  listen,
  setCallTick,
  setTrigger,
}: {
  fs: LightningFS
  register: Register
  listen: Listen
  setTrigger: (trigger: Trigger) => void
  setCallTick: (callTick: (tick: Tick) => void) => void
}) => {
  const vm = await loadPyodide()

  // @ts-ignore
  const index = await getGameIndex('python')
  const file = await fs.promises.readFile('/code/index.py')

  let code

  if (typeof file !== 'string') {
    code = new TextDecoder().decode(file)
  } else {
    code = file
  }

  try {
    let namespace = vm.globals.get('dict')()

    connectLog(namespace)
    connectListen(namespace, listen)

    console.log(
      vm.runPython(index, {
        globals: namespace,
      })
    )

    setTrigger(connectTrigger(vm, namespace))
    setCallTick(connectCallTick(vm, namespace))

    vm.runPython(code, {
      globals: namespace,
    })
  } catch (e) {
    console.log(e)
  }
}
