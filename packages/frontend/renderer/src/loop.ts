import { createVM } from "@startcoding/vm";
// @ts-ignore
import RenderWorker from "./render-worker?worker";
// @ts-ignore
import ColorCorrectionWorker from './color-correction-worker?worker'
import {
  BackdropDescriptor,
  EventDescriptor,
  Globals,
  Language,
  StageContext,
  Tick,
} from "@startcoding/types";
import { createDOMRenderer } from './dom'

declare class MediaStreamTrackGenerator extends MediaStreamTrack {
  writable: WritableStream<VideoFrame>
  constructor (options: { kind?: "video" | "audio" })
};

let renderWorker = new RenderWorker() as Worker;
let colorCorrectionWorker = new ColorCorrectionWorker() as Worker

const correctionMatrices = {
  None: [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanopia: [
    [0.567, 0.433, 0, 0, 0],
    [0.558, 0.442, 0, 0, 0],
    [0, 0.242, 0.758, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Protanomaly: [
    [0.817, 0.183, 0, 0, 0],
    [0.333, 0.667, 0, 0, 0],
    [0, 0.125, 0.875, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranopia: [
    [0.625, 0.375, 0, 0, 0],
    [0.7, 0.3, 0, 0, 0],
    [0, 0.3, 0.7, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Deuteranomaly: [
    [0.8, 0.2, 0, 0, 0],
    [0.258, 0.742, 0, 0, 0],
    [0, 0.142, 0.858, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanopia: [
    [0.95, 0.05, 0, 0, 0],
    [0, 0.433, 0.567, 0, 0],
    [0, 0.475, 0.525, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Tritanomaly: [
    [0.967, 0.033, 0, 0, 0],
    [0, 0.733, 0.267, 0, 0],
    [0, 0.183, 0.817, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatopsia: [
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0.299, 0.587, 0.114, 0, 0],
    [0, 0, 0, 1, 0]
  ],
  Achromatomaly: [
    [0.618, 0.32, 0.062, 0, 0],
    [0.163, 0.775, 0.062, 0, 0],
    [0.163, 0.32, 0.516, 0, 0],
    [0, 0, 0, 1, 0]
  ],
};
export const game = async ({
  language,
  container,
}: {
  language: Language;
  container: HTMLElement;
}) => {
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
      left: -100vw;
    }
    svg {
      height: 100vh;
      width: 100vw;
      position: absolute;
      left: 0;
      top: 0;
    }

    svg div {
      position: static;
    }
  </style>
  `;
  const correctionSVG = renderFrame.contentDocument!.createElementNS("http://www.w3.org/2000/svg", 'svg')
  correctionSVG.style.display = "none"
  renderFrame.contentDocument!.body.appendChild(correctionSVG)
  const backgroundSVG = renderFrame.contentDocument!.createElementNS("http://www.w3.org/2000/svg", 'svg')
  renderFrame.contentDocument!.body.appendChild(backgroundSVG)
  const backgroundForeignObject = renderFrame.contentDocument!.createElementNS("http://www.w3.org/2000/svg", 'foreignObject')
  backgroundSVG.appendChild(backgroundForeignObject)
  let frames: Array<[index: number, frame: ImageBitmap]> | null = null;
  let layerElements: Map<number, HTMLElement>
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

  backgroundForeignObject.appendChild(stageContext.backgroundLayer);
  
  let frameCounter = 0

  renderWorker.onmessage = async (
    message: MessageEvent<
      [action: "renderSprites", data: Array<[index: number, frame: ImageBitmap]>, tick: Tick]
    >
  ) => {
    const [action] = message.data;
    if (action === "renderSprites") {
      const [_, data, tick] = message.data;
      
      tick.timing.deltaRender =
        performance.now() - tick.timing.absTime - tick.timing.deltaCompute!;
      rendering = false;
      lastRenderedTick = tick;
      if (colorCorrection !== 'None' && (frameCounter++ % 600 === 0 || shouldUpdateColorCorrection)) {
        shouldUpdateColorCorrection = false
        colorCorrectionWorker.postMessage(['doColorCorrection', colorCorrection, data, tick], {
          transfer: data.map(([_, frame]) => frame)
        })
      } else {
        frames = data;
      }
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
    globals.mousedown = false;
  };

  const onmousemove = (event: MouseEvent) => {
    globals.pMouseX = globals.mouseX;
    globals.pMouseY = globals.mouseY;

    globals.mouseX = stageContext.fromClientX(event.clientX);
    globals.mouseY = stageContext.fromClientY(event.clientY);

    tickEvents.push({
      kind: "mousemove",
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    });
  };

  const onmousedown = (event: MouseEvent) => {
    globals.mousedown = true;
    tickEvents.push({
      kind: "mousedown",
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    });
  };

  const onmouseup = (event: MouseEvent) => {
    globals.mousedown = false;
    tickEvents.push({
      kind: "mouseup",
      x: stageContext.fromClientX(event.clientX),
      y: stageContext.fromClientY(event.clientY),
    });
  };

  let renderLoop: (time: number) => void;

  if (typeof MediaStreamTrackGenerator !== "undefined") {
    const renderElements: Array<readonly [HTMLVideoElement, MediaStreamTrackGenerator]> = []
    const createRenderElement = () => {
      const spriteVideo = 
        renderFrame.contentDocument!.createElement("video");
      const spriteVideoSource = new MediaStreamTrackGenerator({
        kind: "video",
      });
      const spriteMediaStream = new MediaStream();
      spriteMediaStream.addTrack(spriteVideoSource);
  
      renderFrame.contentDocument!.body.appendChild(spriteVideo);
  
      spriteVideo.srcObject = spriteMediaStream;

      spriteVideo.play()

      return [spriteVideo, spriteVideoSource] as const
    }

    for (let i = 0; i < 50; i++) {
      renderElements.push(createRenderElement())
    }
    
    renderLoop = async (now: number) => {
      if (frames && frames.length > renderElements.length) {
        throw "Too many layers"
      }
      layerElements = new Map()
      for (const index in renderElements) {
        const [spriteVideo, spriteVideoSource] = renderElements[index]
        const layerFrame = frames && frames[index]

        if (layerFrame) {
          const [frameIndex, frame] = layerFrame
          if (frame && frame.width && frame.height) {
            layerElements.set(frameIndex, spriteVideo)
            const { width, height } = frame
            spriteVideo.style.visibility = 'visible'
            spriteVideo.height = height
            spriteVideo.width = width
            spriteVideo.setAttribute('data-layer', frameIndex.toString())
            const spriteVideoWriter = spriteVideoSource.writable.getWriter();
            const newVideoFrame = new VideoFrame(frame, {
              timestamp: now * 1000,
              duration: (1000 * 1000) / 60,
              alpha: "keep",
              displayWidth: width,
              displayHeight: height,
            });
            await spriteVideoWriter.write(newVideoFrame);
            newVideoFrame.close();
            await spriteVideoWriter.ready;
            spriteVideoWriter.releaseLock();
          } else {
            spriteVideo.style.visibility = 'hidden'
          }
        } else {
          spriteVideo.style.visibility = 'hidden'
        }
      }

      if (colorCorrection !== 'None') {
        renderFrame.contentDocument!.body.style.filter = 'url(#colorFilter)'
      }

      renderFrame.contentWindow!.requestAnimationFrame(renderLoop);
    };
  } else {
    const renderElements: Array<readonly [HTMLCanvasElement, ImageBitmapRenderingContext]> = []
    const createRenderElement = () => {
    const spriteCanvas = 
      renderFrame.contentDocument!.createElement("canvas");
    const spriteContext = spriteCanvas.getContext("bitmaprenderer")!;

    renderFrame.contentDocument!.body.appendChild(spriteCanvas);

    return [spriteCanvas, spriteContext] as const
    }

    renderLoop = async (now: number) => {
      const {width, height} = stageContext
      if (frames && frames.length > renderElements.length) {
        for (let i = 0; i < frames.length - renderElements.length; i++) {
          renderElements.push(createRenderElement())
        }
      }
      layerElements = new Map()
      for (const index in renderElements) {
        const [spriteCanvas, spriteContext] = renderElements[index]
        const layerFrame = frames && frames[index]
        if (layerFrame) {
          const [frameIndex, frame] = layerFrame
          if (frame && frame.width && frame.height) {
            layerElements.set(frameIndex, spriteCanvas)
            spriteCanvas.style.visibility = 'visible'

            if (colorCorrection !== 'None') {
              spriteCanvas.style.filter = 'url(#colorFilter)'
            }

            spriteCanvas.height = height
            spriteCanvas.width = width
            const copy = await createImageBitmap(frame);
            spriteContext.transferFromImageBitmap(copy);
          } else {
            spriteCanvas.style.visibility = 'hidden'
          } 
        }
        else {
          spriteCanvas.style.visibility = 'hidden'
        }
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
      backgroundForeignObject.setAttribute("height", box.height.toString())
      backgroundForeignObject.setAttribute("width", box.width.toString())
      backgroundSVG.setAttribute("height", box.height.toString())
      backgroundSVG.setAttribute("width", box.width.toString())
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

  const { callTick, reload, trigger } = await createVM({ language, update, updateBackdrop });

  const renderDOMLayers = (domLayers: Set<[index: number, element: HTMLElement]>) => {
    const renderBody = renderFrame.contentDocument!.body
    const layers = Array.from(renderBody.children) as Array<HTMLElement>
    domLayers.forEach(([index, element]) => {
      const renderElement = layerElements.get(index) as Element
      if (layers[layers.indexOf(renderElement as HTMLElement) - 1] !== element) {
        renderBody.insertBefore(element, renderElement)
      }
    })
  }

  createDOMRenderer({ worker: renderWorker, trigger, render: renderDOMLayers })

  renderFrame.contentDocument!.addEventListener("mousemove", onmousemove);
  renderFrame.contentDocument!.addEventListener("mousedown", onmousedown);
  renderFrame.contentDocument!.addEventListener("mouseup", onmouseup);
  renderFrame.contentDocument!.addEventListener("mouseleave", onmouseleave);

  setTimeout(gameLoop, 1000 / 60);
  renderFrame.contentWindow!.requestAnimationFrame(renderLoop);

  renderFrame.style.visibility = "visible";

  let colorCorrection = 'None'
  let currentColorMatrix = correctionMatrices['None']
  let colorCorrectionCallback = (matrix: number[][]) => {
    currentColorMatrix = matrix
    correctionSVG.innerHTML = `
      <defs>
        <filter id="colorFilter">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="${currentColorMatrix
              .map((row) => row.join(" "))
              .join("\n")}"
          />
        </filter>
      </defs>
      `;
  }

  colorCorrectionWorker.addEventListener('message', (message: MessageEvent<["updateColorCorrectionMatrix", matrix: number[][]]>) => {
    const [action] = message.data
    if (action === 'updateColorCorrectionMatrix') {
      const [_, matrix] = message.data
      colorCorrectionCallback(matrix)
    }
  })

  let shouldUpdateColorCorrection = false
  return {
    reload: async (code: string) => {
      computing = false;
      reload(code);
    },
    setColorCorrection: (correction: keyof typeof correctionMatrices) => {
      colorCorrection = correction
      shouldUpdateColorCorrection = true
    }
  };
};
