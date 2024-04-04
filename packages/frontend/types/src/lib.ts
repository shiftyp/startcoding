/////////////////////////////
/// VM APIs
/////////////////////////////

declare global {
  const mouseX: number;
  const mouseY: number;
  const pMouseX: number;
  const pMouseY: number;
  const mouseXSpeed: number;
  const mouseYSpeed: number;
  const minX: number;
  const minY: number;
  const maxX: number;
  const maxY: number;
  const width: number;
  const height: number;
  const mousedown: boolean;
  const keysDown: string[];

  const randomX: () => number;

  const randomY: () => number;

  // @ts-ignore
  declare class Image {
    constructor(description: {
      url?: string;
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      angle?: number;
      layer?: number;
      hidden?: boolean;
      opacity?: number;
      deleted?: boolean;
      colorEffect?: number;
    });
    url: string;
    width: number;
    height: number;
    x: number;
    y: number;
    angle: number;
    layer: number;
    hidden: boolean;
    opacity: number;
    deleted: boolean;
    colorEffect: number;
    move: (steps: number) => void;
    hide: () => void;
    show: () => void;
    delete: () => void;
    touching: (element: Image) => boolean;
    touchingElements(): Image[];
    distanceTo: (element: Image) => number;
    collideWith: (element: Image) => void;
    mousedown: boolean;
  }
}

export {};
