import { BackdropDescriptor, ElementDescriptor, Language, Tick, Trigger } from '@startcoding/types'
import {runJS} from './js-native'

export const run = ({
  code,
  language,
  update,
  updateBackdrop
}: {
  code: string,
  language: Language,
  update: (elements: ArrayBuffer, tick: Tick) => void,
  updateBackdrop: (backdrop: BackdropDescriptor) => void
}) => {
  switch (language) {
    case 'python':
      //runPY({ fs, register, listen, setCallTick, setTrigger })
      break
    case 'javascript':
      return runJS({ code, update, updateBackdrop })
      break
  }

  throw 'Unsupported Language'
}
