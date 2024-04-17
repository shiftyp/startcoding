declare global {
  interface WorkerGlobalScope {
    width: number;
    height: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    mouseX: number;
    mouseY: number;
    pMouseX: number;
    pMouseY: number;
    mouseXSpeed: number;
    mouseYSpeed: number;
    mousedown: boolean;
    keysDown: string[];
  }
}

export {}