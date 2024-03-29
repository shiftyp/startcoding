import { Language } from '@startcoding/types'

export const getGameIndex = async (language: Language): Promise<string> => {
  if (language === 'javascript') {
    // @ts-ignore
    return (await import('./game-index.js?raw')).default
  }
  else if (language === 'python') {
    // @ts-ignore
    return (await import('./game-index.py?raw')).default
  }

  throw 'Unsupported Language'
}