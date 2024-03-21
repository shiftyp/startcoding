import React from 'react'
import { Register, Trigger, Listen, EventDescriptor, GlobalEventProperties, LocalEventProperties, ElementDescriptor } from '@startcoding/types'
import { createRoot } from 'react-dom/client'
import { Game } from './components/game'
import '@pixi/events'

export const setup = () => {
  const registeredElements: Array<ElementDescriptor | null> = []
  const registeredGlobalListeners: Array<Exclude<EventDescriptor, LocalEventProperties> | null> = []
  const registeredElementListeners: Array<Exclude<EventDescriptor, GlobalEventProperties> | null>[] = []

  let trigger: Trigger = () => {
    throw new ReferenceError('trigger before initialized')
  }

  let onChange: (changes: {
    elements: typeof registeredElements,
    globalEvents: typeof registeredGlobalListeners,
    localEvents: typeof registeredElementListeners,
  }) => void = () => {

  }

  let innerCallTick: (delta: number) => void = () => {
    
  }

  const callTick: (delta: number) => void = (delta: number) => {
    innerCallTick(delta)
  }

  const setOnChange = (newOnChange: typeof onChange) => {
    onChange = newOnChange
  }

  const setCallTick = (newCallTick: typeof callTick) => {
    innerCallTick = newCallTick
  }

  const register: Register = (kind) => {
    const id = registeredElements.length
    return {
      update: (descriptor) => {
        registeredElements[id] = descriptor
        onChange({
          elements: registeredElements,
          localEvents: registeredElementListeners,
          globalEvents: registeredGlobalListeners
        })
      },
      dispose: () => {
        registeredElements[id] = null
        onChange({
          elements: registeredElements,
          localEvents: registeredElementListeners,
          globalEvents: registeredGlobalListeners
        });
      },
      id
    }
  }

  const listen: Listen = (descriptor) => {
    if (descriptor.context == 'global') {
      const id = registeredGlobalListeners.length
      registeredGlobalListeners[id] = descriptor
      return {
        remove: () => {
          registeredGlobalListeners[id] = null
        }
      };

    } else if (descriptor.context === 'local') {
      registeredElementListeners[descriptor.id] = registeredElementListeners[descriptor.id] || []
      const id = registeredElementListeners[descriptor.id].length
      return {
        remove: () => {
          registeredElementListeners[descriptor.id][id] = null
        }
      }
    } else {
      throw new TypeError('invalid descriptor')
    }
  }

  const setTrigger = (newTrigger: Trigger) => {
    trigger = newTrigger
  }

  const renderGame = (element: HTMLElement) => {
    const root = createRoot(element)

    root.render(
    
        <Game
          setOnChange={setOnChange}
          callTick={callTick}
          trigger={trigger}
        />
    )
  }

  return {
    register,
    listen,
    setTrigger,
    setCallTick,
    renderGame
  }
}