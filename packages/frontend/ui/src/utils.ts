import http from 'isomorphic-git/http/web'
import git from 'isomorphic-git'
import LightningFS from '@isomorphic-git/lightning-fs'

export const testFile = async (fs: LightningFS, extension: 'js' | 'py') => {
  try {
    await fs.promises.readFile(`/code/index.${extension}`)
    return true
  } catch (e) {
    return false
  }
}

var rmdir = async (pfs: LightningFS['promises'], dir: string) => {
  var list = await pfs.readdir(dir)
  for (var i = 0; i < list.length; i++) {
    var filename = dir + '/' + list[i]
    var stat = await pfs.stat(filename)

    if (filename == '.' || filename == '..') {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      await rmdir(pfs, filename)
    } else {
      // rm fiilename
      await pfs.unlink(filename)
    }
  }
  await pfs.rmdir(dir)
}

export const clone = async (repo: string) => {
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

  const { hostname, protocol, port } = document.location

  await git.clone({
    fs,
    http,
    dir,
    url: `${protocol}//${hostname}${port ? `:${port}` : ''}/code/${repo}`,
    ref: 'main',
  })

  return fs
}
