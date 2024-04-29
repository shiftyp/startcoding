import { BackdropDescriptor, ElementDescriptor, Language, Tick, Trigger } from '@startcoding/types'
import {createNativeVM} from './js-native'
import { Message } from 'console-feed/lib/definitions/Component'

export const createVM = ({
  language,
  update,
  onLog
}: {
  language: Language,
  update: (elements: ArrayBuffer, tick: Tick) => void,
  onLog: (log: Message) => void
}) => {
  switch (language) {
    case 'python':
      //runPY({ fs, register, listen, setCallTick, setTrigger })
      break
    case 'javascript':
      return createNativeVM({ update, onLog })
      break;
  }

  throw 'Unsupported Language'
}
