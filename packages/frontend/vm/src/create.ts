import { BackdropDescriptor, ElementDescriptor, Language, Tick, Trigger } from '@startcoding/types'
import {createNativeVM} from './js-native'

export const createVM = ({
  language,
  update,
  updateBackdrop
}: {
  language: Language,
  update: (elements: ArrayBuffer, tick: Tick) => void,
  updateBackdrop: (backdrop: BackdropDescriptor) => void
}) => {
  switch (language) {
    case 'python':
      //runPY({ fs, register, listen, setCallTick, setTrigger })
      break
    case 'javascript':
      return createNativeVM({ update, updateBackdrop })
      break;
  }

  throw 'Unsupported Language'
}
