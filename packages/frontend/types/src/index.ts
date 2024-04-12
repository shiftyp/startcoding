// @ts-ignore
import { ColorMode } from "daltonize";
export type Language = "javascript" | "python";

export const ID = Symbol("id");
export const KIND = Symbol("kind");

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
  colorMode: ColorMode;
};

export const INTERNAL = Symbol("internal");

export type BackdropDescriptor = {
  [KIND]: "backdrop";
  url: string;
  style: "cover" | "fill";
};

export type PositionProperties = {
  x: number;
  y: number;
  angle: number;
  hidden: boolean;
  layer: number;
};

export type VisibilityProperties = {
  hidden: boolean;
  opacity: number;
  deleted: boolean;
  colorEffect: number;
};

export type GroupDescriptor = Record<PropertyKey, any> & {
  [KIND]: "group";
};

export type ImageDescriptor = {
  [KIND]: "image";
  url: string;
  width: number;
  height: number;
} & PositionProperties &
  VisibilityProperties;

export type TextDescriptor = {
  [KIND]: "text";
  text: string;
  color: string;
  fontFamily: string;
  textAlign: "start" | "end" | "left" | "center" | "right";
  size: number;
} & PositionProperties &
  VisibilityProperties;

export type RectangleDescriptor = {
  [KIND]: "rectangle";
  width: number;
  height: number;
  color: string;
} & PositionProperties &
  VisibilityProperties;

export type PolygonDescriptor = {
  [KIND]: "polygon";
  sides: number;
  color: string;
} & PositionProperties &
  VisibilityProperties;

export type CircleDescriptor = {
  [KIND]: "circle";
  radius: number;
  color: string;
} & PositionProperties &
  VisibilityProperties;

export type OvalDescriptor = {
  [KIND]: "oval";
  width: number;
  height: number;
  color: string;
} & PositionProperties &
  VisibilityProperties;

export type LineDescriptor = {
  [KIND]: "line";
  x1: number;
  y1: number;
  width: number;
  color: string;
} & PositionProperties &
  VisibilityProperties;

export type ElementDescriptor =
  | ImageDescriptor
  | TextDescriptor
  | RectangleDescriptor
  | PolygonDescriptor
  | CircleDescriptor
  | OvalDescriptor
  | LineDescriptor
  | GroupDescriptor;

export type ElementDescriptorOfKind<
  Kind extends ElementDescriptor[typeof KIND]
> = ElementDescriptor & {
  [KIND]: Kind;
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

export type Change =
  | { kind: "image"; descriptor: ImageDescriptor }
  | { kind: "circle"; descriptor: CircleDescriptor }
  | { kind: "line"; descriptor: LineDescriptor }
  | { kind: "text"; descriptor: TextDescriptor }
  | { kind: "rectangle"; descriptor: RectangleDescriptor }
  | { kind: "polygon"; descriptor: PolygonDescriptor }
  | { kind: "oval"; descriptor: OvalDescriptor }
  | { kind: "group"; descriptor: GroupDescriptor }
  | { kind: "backdrop"; descriptor: BackdropDescriptor };

export type ChangeSet = Array<[number, Array<Change>]>;

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

export type Listen = (
  descriptor: EventDescriptor
) => {
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
  colorMode: ColorMode | null;
  fromStageX: (x: number) => number;
  fromStageY: (y: number) => number;
  fromClientX: (x: number) => number;
  fromClientY: (y: number) => number;
};
