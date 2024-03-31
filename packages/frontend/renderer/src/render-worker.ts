import { CircleSprite } from "./components/circle";
import { ImageSprite } from "./components/image";
import {
  ChangeSet,
  ElementDescriptor,
  Tick,
  WorkerStageContext,
} from "@startcoding/types";
import { LineSprite } from "./components/line";
import { TextSprite } from "./components/text";

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

const render = (changes: ChangeSet, tick: Tick) => {
  if (stageContext.width !== tick.globals.width) {
    stageContext.width = spriteCanvas.width = tick.globals.width;
  }
  if (stageContext.height !== tick.globals.height) {
    stageContext.height = spriteCanvas.height = tick.globals.height;
  }

  for (const layer of changes) {
    const [index, descriptors] = layer;
    for (const descriptor of descriptors) {
      if (!descriptor.hidden) {
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
            break;
        }
      }
    }
  }

  const frame = spriteCanvas.transferToImageBitmap();

  postMessage(["renderSprites", frame, tick], { transfer: [frame] });
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
