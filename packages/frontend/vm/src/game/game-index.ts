import { ElementDescriptor, EventDescriptor, GlobalEventProperties, ImageDescriptor, Listen, LocalEventProperties, Register } from "@startcoding/types";

declare const __register__: Register
declare const __listen__: Listen
declare const log: (...args: any[]) => void

const ticks: Array<(delta: number) => void> = []
const globalListeners: Partial<Record<EventDescriptor["kind"], Array<(() => void) | null>>> = {}
const elementListeners: Array<Partial<Record<EventDescriptor['kind'], Array<(() => void) | null>>>> = []

const listenGlobal = (descriptor: EventDescriptor & GlobalEventProperties, callback) => {
  globalListeners[descriptor.kind] = globalListeners[descriptor.kind] || []
  globalListeners[descriptor.kind]!.push(callback)

  __listen__(descriptor)
}

const listenElement = (descriptor: EventDescriptor & LocalEventProperties, callback) => {
  elementListeners[descriptor.id] = elementListeners[descriptor.id] || {}
  elementListeners[descriptor.id]![descriptor.kind] = elementListeners[descriptor.id]![descriptor.kind] || []
  elementListeners[descriptor.id]![descriptor.kind]!.push(callback)

  __listen__(descriptor)
}

globalThis.__trigger__ = (descriptor: EventDescriptor) => {
  log(descriptor)
  if (descriptor.context === 'global') {
    globalListeners[descriptor.kind]?.forEach(callback => callback?.())
  } else {
    elementListeners[descriptor.id]?.[descriptor.kind]?.forEach(callback => callback?.())
  }
}

const addTick = (callback: (delta: number) => void) => ticks.push(callback)

globalThis.__tick__ = (delta: number) => {
  ticks.forEach(tick => {
    tick(delta)
  })
}

const { update: updateBackdrop } = __register__('backdrop')

globalThis.setBackdropUrl = (url: string) => {
 updateBackdrop({
    kind: "backdrop",
    url,
    style: 'cover'
  })
}

globalThis.every = (duration: number, unit: 'seconds' | 'milliseconds', callback: () => void) => {
  let last = 0

  addTick(delta => {
    last += delta

    let scale = 1

    switch (unit) {
      case 'seconds':
        scale = 1000
        break;
      case 'milliseconds':
        scale = 1
        break;
    }

    if (last / scale >= duration) {
      callback()
      last = 0
    }
  })
}

globalThis.Image = function (props: Partial<Omit<ImageDescriptor, 'kind'>>) {
  const { update, id } = __register__('image');

  const image = {
    ...props,
    onClick: (callback: () => void) => {
      listenElement({
        kind: 'click',
        context: 'local',
        id
      }, callback)
    }
  }

  update({
    kind: 'image',
    ...image
  } as ImageDescriptor)

  return new Proxy(image, {
    set: (target, property, value) => {
      target[property] = value

      update({
        kind: 'image',
        ...target
      } as ImageDescriptor)
      return true
    }
  })
}