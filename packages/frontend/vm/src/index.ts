import { getQuickJS } from 'quickjs-emscripten'
import http from 'isomorphic-git/http/web'
import git from 'isomorphic-git'
import LightningFS from '@isomorphic-git/lightning-fs'
import { connectCallTick, connectListen, connectLog, connectRegister, connectTrigger } from './connect.js'
import { Listen, Register, Trigger } from '@startcoding/types'

export const run = async ({ fs, register, listen, setCallTick, setTrigger }: { fs: LightningFS, register: Register, listen: Listen, setTrigger: ((trigger: Trigger) => void), setCallTick: (callTick: (delta: number) => void) => void }) => {
  const quickjs = await getQuickJS()
  const vm = quickjs.newContext()

  connectLog(vm)
  connectRegister(vm, register)
  connectListen(vm, listen)
  setTrigger(connectTrigger(vm))
  setCallTick(connectCallTick(vm))

  // @ts-ignore
  const index = (await import('./game/game-index?raw')).default
  const file = await fs.promises.readFile('/code/index.js')

  let result

  if (typeof file !== 'string') {
    const code = new TextDecoder().decode(file)
    result = vm.evalCode(`
      ${index}
      ${code}
    `)
  } else {
    const code = file
    result = vm.evalCode(code)
  }
  if (result.error) {
    console.log(vm.dump(result.error))
  } else {
    console.log(vm.dump(result.value))
  }
}

var rmdir = async (pfs: LightningFS["promises"], dir: string) => {
  var list = await pfs.readdir(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = dir + '/' + list[i];
    var stat = await pfs.stat(filename);

    if (filename == "." || filename == "..") {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      await rmdir(pfs, filename);
    } else {
      // rm fiilename
      await pfs.unlink(filename);
    }
  }
  await pfs.rmdir(dir);
};

export const clone = async () => {
  //@ts-ignore
  const fs = new LightningFS('fs')
  const pfs = fs.promises

  const dir = '/code'

  try {
    await rmdir(pfs, dir)
  } catch (e) {
    console.log(e)
  }

  await pfs.mkdir(dir)

  const { hostname, protocol } = document.location

  await git.clone({
    fs,
    http,
    dir,
    url: `${protocol}//${hostname}/code/barbarbarbar`,
    ref: 'main'
  })

  return fs
}