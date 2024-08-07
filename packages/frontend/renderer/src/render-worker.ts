import { CircleSprite } from "./canvas_components/circle";
import { ImageSprite } from "./canvas_components/image";
import {
  BackdropDescriptor,
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
import protobuf from 'protobufjs'
// @ts-ignore
import protoUrl from '@startcoding/types/changeset.proto?url'
import { loadImageURL } from "./image_cache";

const protoPromise = protobuf.load(protoUrl)


var uicons = new FontFace('uicons', `url(${url})`);

uicons.load().then(function (font) {
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
  const domLayerMap: Record<number, Array<TextDescriptor | BackdropDescriptor>> = {}
  const domLayers: Array<[index: number, descriptors: Array<TextDescriptor | BackdropDescriptor>]> = []

  for (const { index, layer } of changes.layers) {
    if (layer) {
      for (const change of layer) {
        if (change.kind === 'backdrop') {
          const url = loadImageURL(change.url, 100, '', stageContext.colorMode)

          if (url) {
            if (!domLayerMap.hasOwnProperty(0)) {
              domLayerMap[0] = []
              domLayers.push([0, domLayerMap[0]])
            }

            domLayerMap[0].push({
              url,
              style: change.style,
              kind: 'backdrop',
              repeat: change.repeat,
            })
          }
        } else if (!change.hidden) {
          switch (change.kind) {
            case "image":
              ImageSprite(change, stageContext);
              break;
            case "circle":
              CircleSprite(change, stageContext);
              break;
            case "line":
              LineSprite(change, stageContext);
              break;
            case 'animation':
              AnimationSprite(change, stageContext)
              break;
            case "text":
              TextSprite(change, stageContext);
              if (!domLayerMap.hasOwnProperty(index)) {
                domLayerMap[index] = []
                domLayers.push([index, domLayerMap[index]])
              }
              domLayerMap[index].push(change)
              break;
          }
        }
      }
    }
  }


  let frame: ImageBitmap

  try {
    frame = spriteCanvas.transferToImageBitmap()
  } catch (e: any) {
    postMessage(["renderError", e.toString()])
    return
  }

  layerFrames.push([0, frame])
  frames.push(frame)


  postMessage(["render", layerFrames, tick, domLayers], { transfer: frames });
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
      const root = await protoPromise
      const layersProto = root.lookupType('types.ChangeSet')
      const changesArr = new Uint8Array(changes)
      try {
        lastChangeSet = layersProto.toObject(layersProto.decode(changesArr)) as ChangeSet
        lastTick = tick
        render(lastChangeSet!, lastTick!);
      } catch (e) {
        postMessage(['renderError', e]);
      }
    } else if (action === 'rerender') {
      const [_, colorMode] = message.data
      render(lastChangeSet!, {
        ...lastTick!,
        colorMode
      });
    }
  }
);
