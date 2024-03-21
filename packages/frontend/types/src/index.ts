export type BackdropDescriptor = {
  kind: 'backdrop',
  url: string,
  style: 'cover' | 'fill'
}

export type SpriteProperties = {
  width: number,
  height: number,
  x: number,
  y: number,
  angle: number
}

export type ImageDescriptor = {
  kind: 'image',
  url: string,
} & SpriteProperties

export type ElementDescriptor = BackdropDescriptor | ImageDescriptor

export type Register = <Kind extends ElementDescriptor["kind"]>(kind: Kind) => {
  update: (descriptor: ElementDescriptor & { kind: Kind }) => void,
  dispose: () => void,
  id: number
}

export type GlobalEventProperties = {
  kind: string,
  context: 'global'
}

export type LocalEventProperties = {
  kind: string,
  context: 'local',
  id: number
}

export type GlobalOrLocalEventProperties = GlobalEventProperties | LocalEventProperties

export type ClickDescriptor = {
  kind: 'click',
} & GlobalOrLocalEventProperties

export type EventDescriptor = ClickDescriptor

export type Listen = (descriptor: EventDescriptor) => {
  remove: () => void
}

export type Trigger = (descriptor: EventDescriptor) => void