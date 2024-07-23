// @ts-ignore
import { ColorMode } from "daltonize";
export type Language = "javascript" | "python";
import animations from './animations.json'

export const animationInfo = animations

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

export type FillerDescriptor = {
  kind: "filler",
  hidden: true
}

export type BaseProperties = {
  name: string
}

export type BackdropDescriptor = {
  kind: "backdrop";
  url: string;
  style: "cover" | "contain";
  repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
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
  kind: "group";
} & BaseProperties & PositionProperties

export type ImageDescriptor = {
  kind: "image";
  url: string;
  width: number;
  height: number;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type TextDescriptor = {
  kind: "text";
  text: string;
  color: string;
  fontFamily: string;
  textAlign: "start" | "end" | "left" | "center" | "right";
  size: number;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type RectangleDescriptor = {
  kind: "rectangle";
  width: number;
  height: number;
  color: string;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type PolygonDescriptor = {
  kind: "polygon";
  sides: number;
  color: string;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type CircleDescriptor = {
  kind: "circle";
  radius: number;
  color: string;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type OvalDescriptor = {
  kind: "oval";
  width: number;
  height: number;
  color: string;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type LineDescriptor = {
  kind: "line";
  x1: number;
  y1: number;
  width: number;
  color: string;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type Animations = typeof animations
export type AnimationImages = keyof Animations
export type AnimationCostumes = keyof Animations[AnimationImages]
export type AnimationsAnimations = keyof Animations[AnimationImages][AnimationCostumes]

export type AnimationDescriptor<Image extends keyof Animations, Costume extends keyof Animations[Image], Animation extends keyof Animations[Image][Costume]> = {
  kind: 'animation',
  image: Image
  costume: Costume,
  animation: Animation,
  size: number,
  frame: number;
  frameRate: number;
} & BaseProperties & PositionProperties &
  VisibilityProperties;

export type ElementDescriptor =
  | ImageDescriptor
  | TextDescriptor
  | RectangleDescriptor
  | PolygonDescriptor
  | CircleDescriptor
  | OvalDescriptor
  | LineDescriptor
  | GroupDescriptor
  | AnimationDescriptor<AnimationImages, AnimationCostumes, AnimationsAnimations>;

export type ElementDescriptorOfKind<
  Kind extends ElementDescriptor["kind"]
> = ElementDescriptor & {
  kind: Kind;
};

export type TreeNodeInfo = {
  id: number;
  invalid: boolean;
  collider: SAT.Polygon | SAT.Circle;
};

export type TreeNodeBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type TreeNode = TreeNodeInfo & TreeNodeBounds;

export type ChangeSet = { layers: Array<{ index: number, layer?: Array<ElementDescriptor | BackdropDescriptor | FillerDescriptor> }> };

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
