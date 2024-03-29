import { clone, testFile } from './utils'
import { Buffer } from 'buffer'
import { renderGame } from '@startcoding/renderer'
import '@startcoding/game'
import { Language } from '@startcoding/types'
// @ts-ignore
import serviceWorker from './service-worker?worker'
import { getGameIndex } from '@startcoding/game'

// @ts-ignore
window.Buffer = Buffer

const main = async () => {
  const { pathname } = window.location
  const repoId = pathname.substring(pathname.lastIndexOf('/') + 1)
  const fs = await clone(repoId)

  let file: Uint8Array
  let language: Language

  if (await testFile(fs, 'js')) {
    language = 'javascript'
    file = (await fs.promises.readFile('/code/index.js')) as Uint8Array
  } else if (await testFile(fs, 'py')) {
    language = 'python'
    file = (await fs.promises.readFile('/code/index.py')) as Uint8Array
  } else {
    throw 'No valid index in repo'
  }

  const code = new TextDecoder().decode(file)
  const index = await getGameIndex('javascript')
  const compiled = `${index}\r\n\nconst execute = () => {\r\n\r\n//User Code\r\n\r\n${code}\r\n}\r\n`

  document
    .getElementById('play')!
    .addEventListener('click', () =>
      renderGame({
        code: compiled,
        language,
        container: document.getElementById('root')!,
      })
    )
}

main()
