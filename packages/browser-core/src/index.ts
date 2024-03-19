import { getQuickJS} from 'quickjs-emscripten'
import http from 'isomorphic-git/http/web'
import git from 'isomorphic-git'
import LightningFS from '@isomorphic-git/lightning-fs'

export const run = async (fs: LightningFS) => {
  const quickjs = await getQuickJS()
  const vm = quickjs.newContext()

  return vm.evalCode((await fs.promises.readFile('/code/barbarbarbar/index.js')).toString())
}

var rmdir = async (pfs: LightningFS["promises"], dir: string) => {
  var list = await pfs.readdir(dir);
  for(var i = 0; i < list.length; i++) {
      var filename = dir +  '/' +list[i];
      var stat = await pfs.stat(filename);

      if(filename == "." || filename == "..") {
          // pass these files
      } else if(stat.isDirectory()) {
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

  const  { hostname, protocol } = document.location

  await git.clone({
    fs,
    http,
    dir,
    url: `${protocol}//${hostname}/code/barbarbarbar`,
    ref: 'main'
  })

  console.log(await pfs.readdir(dir))

  return fs
}