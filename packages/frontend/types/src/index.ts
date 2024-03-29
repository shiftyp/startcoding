import { Application, Sprite } from 'pixi.js'

export type Language = 'javascript' | 'python'

export type Globals = {
  mouseX: number
  mouseY: number
  pMouseX: number
  pMouseY: number
  mouseXSpeed: number
  mouseYSpeed: number
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  mousedown: number
  keysDown: string[]
}

export type Tick = {
  timing: {
    absTime: number
    deltaTime: number
    deltaCompute?: number
    deltaRender?: number
  }
  globals: Globals
}

export type RemoveDescriptor = {
  kind: 'remove'
}

export type BackdropDescriptor = {
  kind: 'backdrop'
  url: string
  style: 'cover' | 'fill'
}

export type PositionProperties = {
  x: number
  y: number
  angle: number
}

export type ImageDescriptor = {
  kind: 'image'
  url: string
  width: number
  height: number
} & PositionProperties

export type TextDescriptor = {
  kind: 'text'
  text: string
  color: string
  fontFamily: string
  textAlign: 'start' | 'end' | 'left' | 'center' | 'right'
} & PositionProperties

export type RectangleDescriptor = {
  kind: 'rectangle'
  width: number
  height: number
  color: string
} & PositionProperties

export type PolygonDescriptor = {
  kind: 'polygon'
  sides: number
  color: string
} & PositionProperties

export type CircleDescriptor = {
  kind: 'circle'
  radius: number
  color: string
} & PositionProperties

export type OvalDescriptor = {
  kind: 'oval'
  width: number
  height: number
  color: string
} & PositionProperties

export type ElementDescriptor =
  | ImageDescriptor
  | TextDescriptor
  | RectangleDescriptor
  | PolygonDescriptor
  | CircleDescriptor
  | OvalDescriptor

export type ElementOfKind<Kind extends ElementDescriptor['kind']> =
  ElementDescriptor & {
    kind: Kind
  }

export type TreeNodeInfo = {
  id: number
  collider: SAT.Polygon | SAT.Circle
}

export type TreeNodeBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export type TreeNode = TreeNodeInfo & TreeNodeBounds

export type ElementEvents = {
  onMouseDown: (callback: () => void) => void
  onMouseUp: (callback: () => void) => void
  onMouseOver: (callback: () => void) => void
  onMouseOut: (callback: () => void) => void
}

export type ElementEventCallbacks = {
  [K in keyof ElementEvents]: Parameters<ElementEvents[K]>[0]
}

export type ElementSetters<Kind extends ElementDescriptor['kind']> = {
  [K in keyof Omit<ElementOfKind<Kind>, 'kind'>]?: (
    value: ElementOfKind<Kind>[K]
  ) => void
}

export type ElementGetters<Kind extends ElementDescriptor['kind']> = {
  [K in keyof Omit<ElementOfKind<Kind>, 'kind'>]?: () => ElementOfKind<Kind>[K]
}

export type ElementMethods = {
  move: (steps: number) => void
  delete: () => void
}

export type Register = <Kind extends ElementDescriptor['kind']>(
  descriptor: ElementOfKind<Kind>
) => {
  update: (descriptor: ElementDescriptor & { kind: Kind }) => void
  dispose: () => void
  id: number
}

export type GlobalEventProperties = {
  kind: string
  context: 'global'
}

export type LocalEventProperties = {
  kind: string
  context: 'local'
  id: number
}

export type GlobalOrLocalEventProperties =
  | GlobalEventProperties
  | LocalEventProperties

export type MouseDownDescriptor = {
  kind: 'mousedown'
  x: number
  y: number
}

export type MouseUpDescriptor = {
  kind: 'mouseup'
  x: number
  y: number
}

export type MouseOverDescriptor = {
  kind: 'mouseover'
  x: number
  y: number
}

export type MouseOutDescriptor = {
  kind: 'mouseout'
  x: number
  y: number
}

export type MouseMoveDescriptor = {
  kind: 'mousemove'
  x: number
  y: number
}

export type EventDescriptor =
  | MouseDownDescriptor
  | MouseUpDescriptor
  | MouseOverDescriptor
  | MouseOutDescriptor
  | MouseMoveDescriptor

export type Listen = (descriptor: EventDescriptor) => {
  remove: () => void
}

export type Trigger = (descriptor: EventDescriptor) => void

export type StageContext = {
  container: HTMLElement
  backgroundLayer: HTMLElement
  interactionLayer: HTMLElement
  spriteContext: CanvasRenderingContext2D
  width: number
  height: number
  fromStageX: (x: number) => number
  fromStageY: (y: number) => number
  fromClientX: (x: number) => number
  fromClientY: (y: number) => number
}

export type WorkerStageContext = {
  spriteContext: OffscreenCanvasRenderingContext2D
  width: number
  height: number
  fromStageX: (x: number) => number
  fromStageY: (y: number) => number
  fromClientX: (x: number) => number
  fromClientY: (y: number) => number
}

export type Handle = {
  destroy: () => void
  tick?: (tick: Tick, stageContext: StageContext) => void
  element: Sprite
}

export type Component = {
  update: (
    changes: Partial<ElementDescriptor>,
    stageContext: StageContext
  ) => Promise<Handle>
  destroy: () => void
}
