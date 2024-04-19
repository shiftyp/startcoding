import { CircleSprite } from "./canvas_components/circle";
import { ImageSprite } from "./canvas_components/image";
import {
  Change,
  ChangeSet,
  KIND,
  TextDescriptor,
  Tick,
  WorkerStageContext,
} from "@startcoding/types";
import { LineSprite } from "./canvas_components/line";
import { TextSprite } from "./canvas_components/text";
import { BackdropSprite } from "./canvas_components/backdrop";
import { ColorMode } from 'daltonize'
import { AnimationSprite } from "./canvas_components/animation";
// @ts-ignore
import url from '@flaticon/flaticon-uicons/css/uicons-regular-rounded-DWTIAQ4L.woff2?url'

var uicons = new FontFace('uicons', `url(${url})`);

uicons.load().then(function(font){
  // @ts-expect-error
  fonts.add(font);
});

let spriteCanvas = new OffscreenCanvas(0, 0);
let stageContext: WorkerStageContext = {
  spriteContext: spriteCanvas.getContext("2d")!,
  width: 0,
  height: 0,
  colorMode: null,
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

let frameCounter = 1

const render = async (changes: ChangeSet, tick: Tick) => {
  if (stageContext.width !== tick.globals.width) {
    stageContext.width = spriteCanvas.width = tick.globals.width;
  }
  if (stageContext.height !== tick.globals.height) {
    stageContext.height = spriteCanvas.height = tick.globals.height;
  }
  
  stageContext.colorMode = tick.colorMode

  const layerFrames: Array<[index: number, frame: ImageBitmap]> = []
  const frames: Array<ImageBitmap> = []
  const domLayerMap: Record<number, Array<TextDescriptor>> = {}
  const domLayers: Array<[index: number, descriptors: Array<TextDescriptor>]> = []

  for (const layer of changes) {
    const [index, descriptors] = layer;
    for (const change of descriptors) {
      if (change.kind === 'backdrop') {
        BackdropSprite(change.descriptor, stageContext)
      } else if (!change.descriptor.hidden) {
        switch (change.kind) {
          case "image":
            ImageSprite(change.descriptor, stageContext);
            break;
          case "circle":
            CircleSprite(change.descriptor, stageContext);
            break;
          case "line":
            LineSprite(change.descriptor, stageContext);
            break;
          case 'animation':
            AnimationSprite(change.descriptor, stageContext)
            break;
          case "text":
            TextSprite(change.descriptor, stageContext);
            if (!domLayerMap.hasOwnProperty(index)) {
              domLayerMap[index] = []
              domLayers.push([index, domLayerMap[index]])
            }
            domLayerMap[index].push(change.descriptor)
            break;
        }
      }
    }
  }

  
  let frame: ImageBitmap

  try {
    frame = spriteCanvas.transferToImageBitmap()
  } catch(e: any) {
    postMessage(["renderError", e.toString()])
    return
  }

  layerFrames.push([0, frame])
  frames.push(frame)


  postMessage(["renderSprites", layerFrames, tick], { transfer: frames });

  if (domLayers.length) {
    postMessage(['renderDOMSprites', domLayers])
  }
};

let colorMode: ColorMode | null = null 
let lastChangeSet: ChangeSet | null = null
let lastTick: Tick | null = null

addEventListener(
  "message",
  async (
    message: MessageEvent<[action: "update", changes: ArrayBuffer, tick: Tick] | [action: 'setColorCorrection', mode: ColorMode | null] | [action: 'rerender', colorMode: ColorMode]>
  ) => {
    const [action] = message.data;

    if (action === "update") {
      const [_, changes, tick] = message.data;
      const string = new TextDecoder().decode(changes);
      lastChangeSet = JSON.parse(string);
      lastTick = tick
      render(lastChangeSet!, lastTick!);
    } else if (action === 'rerender') {
      const [_, colorMode] = message.data
      render(lastChangeSet!, {
        ...lastTick!,
        colorMode
      });
    }
  }
);
