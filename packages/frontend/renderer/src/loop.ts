import { createVM } from "@startcoding/vm";
// @ts-ignore
import RenderWorker from "./render-worker?worker";
import {
  BackdropDescriptor,
  EventDescriptor,
  Globals,
  Language,
  StageContext,
  Tick,
} from "@startcoding/types";

declare const MediaStreamTrackGenerator: {
  new (options: { kind?: "video" | "audio" }): {
    writable: WritableStream<VideoFrame>;
  } & MediaStreamTrack;
};

let renderWorker = new RenderWorker() as Worker;

const renderFrame = document.getElementById("output") as HTMLIFrameElement;
renderFrame.contentDocument!.head.innerHTML = `
<style>
  body, html {
    padding: 0;
    margin: 0;
    overflow: hidden;
  }
  canvas, video {
    position: absolute;
  }
  div {
    position: absolute;
    height: 100vh;
    width: 100vw;
  }
</style>
`;

export const game = ({
  language,
  container,
}: {
  language: Language;
  container: HTMLElement;
}) => {
  let frame: ImageBitmap | null = null;
  let rendering: boolean = false;
  let computing: boolean = false;
  let lastComputedTick: Tick | null = null;
  let lastRenderedTick: Tick | null = null;

  let tickEvents: EventDescriptor[] = [];

  const stageContext: StageContext = {
    container,
    backgroundLayer: renderFrame.contentDocument!.createElement("div"),
    // @ts-ignore
    spriteContext: null,
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

  renderFrame.contentDocument!.body.appendChild(stageContext.backgroundLayer);

  renderWorker.onmessage = async (
    message: MessageEvent<
      [action: "renderSprites", data: ImageBitmap, tick: Tick]
    >
  ) => {
    const [action] = message.data;
    if (action === "renderSprites") {
      const [_, data, tick] = message.data;
      frame = data;
      tick.timing.deltaRender =
        performance.now() - tick.timing.absTime - tick.timing.deltaCompute!;
      rendering = false;
      lastRenderedTick = tick;
    }
  };

  let lastTime = performance.now();

  const globals: Globals = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    pMouseX: 0,
    pMouseY: 0,
    mousedown: false,
    mouseXSpeed: 0,
    mouseYSpeed: 0,
    keysDown: [],
  };

  const onmouseleave = () => {
    globals.mousedown = false
  }

  const onmousemove = (event: MouseEvent) => {
    globals.pMouseX = globals.mouseX;
    globals.pMouseY = globals.mouseY;

    globals.mouseX = stageContext.fromClientX(event.clientX);
    globals.mouseY = stageContext.fromClientY(event.clientY);

    tickEvents.push({
      kind: 'mousemove',
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    })
  };

  const onmousedown = (event: MouseEvent) => {
    globals.mousedown = true
    tickEvents.push({
      kind: "mousedown",
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    })
  }

  const onmouseup = (event: MouseEvent) => {
    globals.mousedown = false
    tickEvents.push({
      kind: "mouseup",
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    });
  };

  let renderLoop: (time: number) => void;
  let renderElement: HTMLVideoElement | HTMLCanvasElement;

  if (typeof MediaStreamTrackGenerator !== "undefined") {
    const spriteVideo = (renderElement =
      renderFrame.contentDocument!.createElement("video"));
    const spriteVideoSource = new MediaStreamTrackGenerator({
      kind: "video",
    });
    const spriteMediaStream = new MediaStream();
    spriteMediaStream.addTrack(spriteVideoSource);

    renderFrame.contentDocument!.body.appendChild(spriteVideo);

    spriteVideo.srcObject = spriteMediaStream;
    renderLoop = async (now: number) => {
      const { width, height } = stageContext;

      if (frame && frame.height && frame.width) {
        const spriteVideoWriter = spriteVideoSource.writable.getWriter();
        const newVideoFrame = new VideoFrame(frame, {
          timestamp: performance.now() * 1000,
          duration: (1000 * 1000) / 60,
          alpha: "keep",
          displayWidth: width,
          displayHeight: height,
        });
        await spriteVideoWriter.write(newVideoFrame);
        newVideoFrame.close();
        await spriteVideoWriter.ready;
        spriteVideoWriter.releaseLock();
      }

      renderFrame.contentWindow!.requestAnimationFrame(renderLoop);
    };
  } else {
    const spriteCanvas = (renderElement =
      renderFrame.contentDocument!.createElement("canvas"));
    const spriteContext = spriteCanvas.getContext("bitmaprenderer")!;

    renderFrame.contentDocument!.body.appendChild(spriteCanvas);

    renderLoop = async (now: number) => {
      if (frame && frame.height && frame.width) {
        const copy = await createImageBitmap(frame);
        spriteContext.transferFromImageBitmap(copy);
      }

      renderFrame.contentWindow!.requestAnimationFrame(renderLoop);
    };
  }

  const gameLoop = () => {
    const box = renderFrame.getBoundingClientRect();

    if (
      stageContext.width !== box.width ||
      stageContext.height !== box.height
    ) {
      stageContext.width = box.width;
      stageContext.height = box.height;
      renderElement.height = stageContext.height;
      renderElement.width = stageContext.width;
    }

    const now = performance.now();
    const deltaTime = now - lastTime;

    const { width, height, fromClientX, fromClientY } = stageContext;

    lastTime = now;

    globals.width = width;
    globals.height = height;

    globals.minX = fromClientX(0);
    globals.maxX = fromClientX(width);
    globals.minY = fromClientY(height);
    globals.maxY = fromClientY(0);

    const tick = {
      timing: { absTime: now, deltaTime },
      globals: globals,
      events: tickEvents,
    };

    if (computing === false) {
      callTick(tick);
      tickEvents = [];
      computing = true;
    }

    setTimeout(gameLoop, 1000 / 60);
  };

  const update = (changes: ArrayBuffer, tick: Tick) => {
    tick.timing.deltaCompute = performance.now() - tick.timing.absTime;
    if (!rendering) {
      renderWorker.postMessage(["update", changes, tick], {
        transfer: [changes],
      });
      rendering = true;
    }
    lastComputedTick = tick;
    computing = false;
  };

  const updateBackdrop = (backdrop: BackdropDescriptor) => {
    stageContext.backgroundLayer.style.backgroundImage = `url(${backdrop.url})`;
    stageContext.backgroundLayer.style.backgroundSize = "cover";
    stageContext.backgroundLayer.style.backgroundRepeat = "no-repeat";
  };

  const { callTick, reload } = createVM({ language, update, updateBackdrop });

  renderFrame.contentDocument!.addEventListener("mousemove", onmousemove);
  renderFrame.contentDocument!.addEventListener("mousedown", onmousedown);
  renderFrame.contentDocument!.addEventListener("mouseup", onmouseup);
  renderFrame.contentDocument!.addEventListener("mouseleave", onmouseleave);

  setTimeout(gameLoop, 1000 / 60);
  renderFrame.contentWindow!.requestAnimationFrame(renderLoop);
  if (renderElement.tagName === "VIDEO")
    (renderElement as HTMLVideoElement).play();

  renderFrame.style.visibility = 'visible'

  return { reload }
};
