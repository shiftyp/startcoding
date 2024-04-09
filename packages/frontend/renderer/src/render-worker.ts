import { CircleSprite } from "./canvas_components/circle";
import { ImageSprite } from "./canvas_components/image";
import {
  ChangeSet,
  TextDescriptor,
  Tick,
  WorkerStageContext,
} from "@startcoding/types";
import { LineSprite } from "./canvas_components/line";
import { TextSprite } from "./canvas_components/text";
import { BackdropSprite } from "./canvas_components/backdrop";

let spriteCanvas = new OffscreenCanvas(0, 0);
let stageContext: WorkerStageContext = {
  spriteContext: spriteCanvas.getContext("2d", {})!,
  width: 0,
  height: 0,
  fromStageX: (x: number) => {
    return x + (stageContext.width || 0) / 2;
  },
  fromStageY: (y: number) => {
    return -y + (stageContext.height || 0) / 2;
  },
  fromClientX: (x: number) => {
    return x - (stageContext.width || 0) / 2;
  },
  fromClientY: (y: number) => {
    return -y + (stageContext.height || 0) / 2;
  },
};

let frameIndex = 0

const render = (changes: ChangeSet, tick: Tick) => {
  if (stageContext.width !== tick.globals.width) {
    stageContext.width = spriteCanvas.width = tick.globals.width;
  }
  if (stageContext.height !== tick.globals.height) {
    stageContext.height = spriteCanvas.height = tick.globals.height;
  }

  const layerFrames: Array<[index: number, frame: ImageBitmap]> = []
  const frames: Array<ImageBitmap> = []
  const domLayerMap: Record<number, Array<TextDescriptor>> = {}
  const domLayers: Array<[index: number, descriptors: Array<TextDescriptor>]> = []

  for (const layer of changes) {
    const [index, descriptors] = layer;
    for (const descriptor of descriptors) {
      if (descriptor.kind === 'backdrop') {
        BackdropSprite(descriptor, stageContext)
      } else if (!descriptor.hidden) {
        switch (descriptor.kind) {
          case "image":
            ImageSprite(descriptor, stageContext);
            break;
          case "circle":
            CircleSprite(descriptor, stageContext);
            break;
          case "line":
            LineSprite(descriptor, stageContext);
            break;
          case "text":
            TextSprite(descriptor, stageContext);
            if (!domLayerMap.hasOwnProperty(index)) {
              domLayerMap[index] = []
              domLayers.push([index, domLayerMap[index]])
            }
            domLayerMap[index].push(descriptor)
            break;
        }
      }
    }
    //const frame = spriteCanvas.transferToImageBitmap()
    //layerFrames.push([index, frame])
    //frames.push(frame)
  }
  const frame = spriteCanvas.transferToImageBitmap()
  layerFrames.push([0, frame])
  frames.push(frame)


  postMessage(["renderSprites", layerFrames, tick], { transfer: frames });

  if (domLayers.length) {
    postMessage(['renderDOMSprites', domLayers])
  }
};

addEventListener(
  "message",
  async (
    message: MessageEvent<[action: "update", changes: ArrayBuffer, tick: Tick]>
  ) => {
    const [action] = message.data;

    if (action === "update") {
      const [_, changes, tick] = message.data;
      const string = new TextDecoder().decode(changes);

      render(JSON.parse(string) as ChangeSet, tick);
    }
  }
);
