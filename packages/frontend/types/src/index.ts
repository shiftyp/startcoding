export type Language = "javascript" | "python";

export type Globals = {
  mouseX: number;
  mouseY: number;
  pMouseX: number;
  pMouseY: number;
  mouseXSpeed: number;
  mouseYSpeed: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  mousedown: boolean;
  keysDown: string[];
};

export type Tick = {
  timing: {
    absTime: number;
    deltaTime: number;
    deltaCompute?: number;
    deltaRender?: number;
  };
  globals: Globals;
  events: EventDescriptor[];
};

export const INTERNAL = Symbol("internal");

export type BackdropDescriptor = {
  kind: "backdrop";
  url: string;
  style: "cover" | "fill";
};

export type PositionProperties = {
  x: number;
  y: number;
  angle: number;
  hidden: boolean;
  layer: number;
  id: number;
};

export type VisibilityProperties = {
  hidden: boolean;
  opacity: number;
  deleted: boolean;
  colorEffect: number;
};

export type ImageDescriptor = {
  kind: "image";
  url: string;
  width: number;
  height: number;
} & PositionProperties & VisibilityProperties;

export type TextDescriptor = {
  kind: "text";
  text: string;
  color: string;
  fontFamily: string;
  textAlign: "start" | "end" | "left" | "center" | "right";
  size: number;
} & PositionProperties & VisibilityProperties;

export type RectangleDescriptor = {
  kind: "rectangle";
  width: number;
  height: number;
  color: string;
} & PositionProperties & VisibilityProperties;

export type PolygonDescriptor = {
  kind: "polygon";
  sides: number;
  color: string;
} & PositionProperties & VisibilityProperties;

export type CircleDescriptor = {
  kind: "circle";
  radius: number;
  color: string;
} & PositionProperties & VisibilityProperties;

export type OvalDescriptor = {
  kind: "oval";
  width: number;
  height: number;
  color: string;
} & PositionProperties  & VisibilityProperties;

export type LineDescriptor = {
  kind: "line";
  x1: number;
  y1: number;
  width: number;
  color: string;
} & PositionProperties & VisibilityProperties;

export type ElementDescriptor =
  | ImageDescriptor
  | TextDescriptor
  | RectangleDescriptor
  | PolygonDescriptor
  | CircleDescriptor
  | OvalDescriptor
  | LineDescriptor;

export type ElementDescriptorOfKind<Kind extends ElementDescriptor["kind"]> =
  ElementDescriptor & {
    kind: Kind;
  };

export type TreeNodeInfo = {
  id: number;
  collider: SAT.Polygon | SAT.Circle;
};

export type TreeNodeBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type TreeNode = TreeNodeInfo & TreeNodeBounds;

export type ElementEvents = {
  onMouseDown: (callback: () => void) => void;
  onMouseUp: (callback: () => void) => void;
  onMouseOver: (callback: () => void) => void;
  onMouseOut: (callback: () => void) => void;
  onMouseMove: (callback: () => void) => void;
};

export type ElementEventCallbacks = {
  [K in keyof ElementEvents]: Parameters<ElementEvents[K]>[0];
};

export type ElementSetters<Kind extends ElementDescriptor["kind"]> = {
  [K in keyof Omit<ElementDescriptorOfKind<Kind>, "kind">]?: (
    target: InteractiveElement<Kind>, value: ElementDescriptorOfKind<Kind>[K]
  ) => void;
};

export type ElementGetters<Kind extends ElementDescriptor["kind"]> = {
  [K in keyof Omit<
    ElementDescriptorOfKind<Kind>,
    "kind"
  >]?: (target: InteractiveElement<Kind>) => ElementDescriptorOfKind<Kind>[K];
};

export type ElementMethods = {
  move: (steps: number) => void;
  hide: () => void;
  show: () => void;
  delete: () => void;
  touching: <Kind extends ElementDescriptor["kind"]>(
    element: InteractiveElement<Kind>
  ) => boolean;
  touchingElements(): InteractiveElement<any>[];
  distanceTo: (element: InteractiveElement<any>) => number;
  collideWith: (element: InteractiveElement<any>) => void;
  mousedown: boolean;
};

export type ElementInternal<Kind extends ElementDescriptor["kind"]> = {
  node: TreeNode;
  descriptor: ElementDescriptorOfKind<Kind>;
};

export type InteractiveElement<Kind extends ElementDescriptor["kind"]> = {
  [INTERNAL]: ElementInternal<Kind>;
} & {
  [K in keyof ElementDescriptorOfKind<Kind>]: ElementDescriptorOfKind<Kind>[K];
} & ElementMethods &
  ElementEvents;

export type ChangeSet = Array<[number, Array<ElementDescriptor | BackdropDescriptor>]>;

export type GlobalEventProperties = {
  kind: string;
  context: "global";
};

export type LocalEventProperties = {
  kind: string;
  context: "local";
  id: number;
};

export type GlobalOrLocalEventProperties =
  | GlobalEventProperties
  | LocalEventProperties;

export type MouseDownDescriptor = {
  kind: "mousedown";
  x: number;
  y: number;
};

export type MouseUpDescriptor = {
  kind: "mouseup";
  x: number;
  y: number;
};

export type MouseOverDescriptor = {
  kind: "mouseover";
  x: number;
  y: number;
};

export type MouseOutDescriptor = {
  kind: "mouseout";
  x: number;
  y: number;
};

export type MouseMoveDescriptor = {
  kind: "mousemove";
  x: number;
  y: number;
};

export type EventDescriptor =
  | MouseDownDescriptor
  | MouseUpDescriptor
  | MouseOverDescriptor
  | MouseOutDescriptor
  | MouseMoveDescriptor;

export type Listen = (descriptor: EventDescriptor) => {
  remove: () => void;
};

export type Trigger = (descriptor: EventDescriptor) => void;

export type StageContext = {
  container: HTMLElement;
  backgroundLayer: HTMLElement;
  interactionLayer: HTMLElement;
  spriteContext: CanvasRenderingContext2D;
  width: number;
  height: number;
  fromStageX: (x: number) => number;
  fromStageY: (y: number) => number;
  fromClientX: (x: number) => number;
  fromClientY: (y: number) => number;
};

export type WorkerStageContext = {
  spriteContext: OffscreenCanvasRenderingContext2D;
  width: number;
  height: number;
  fromStageX: (x: number) => number;
  fromStageY: (y: number) => number;
  fromClientX: (x: number) => number;
  fromClientY: (y: number) => number;
};
