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
import { ColorMode } from "daltonize";
import { Message } from 'console-feed/lib/definitions/Component'
// @ts-ignore
import PalleteWorker from './palette_worker?worker'
// @ts-ignore
import flaticonFontUrl from '@flaticon/flaticon-uicons/css/regular/rounded.css?url'

let renderWorker = new RenderWorker() as Worker;
let palleteWorker = new PalleteWorker() as Worker;

export const game = async ({
  language,
  container,
}: {
  language: Language;
  container: HTMLElement;
}) => {
  const renderFrame = document.getElementById("output") as HTMLIFrameElement;
  renderFrame.contentDocument!.head.innerHTML = `
  <link href="${flaticonFontUrl}" rel="stylesheet" />
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

    .pointer-layer {
      left: 0
    }

    .pointer {
      display: block;
      position: absolute;
      transform: translate(-50%, -50%);
      color: white;
      text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      font-size: 30px;
      visibility: hidden;
    }
  </style>
  `;

  let frames: Array<[index: number, frame: ImageBitmap]> | null = null;
  let layerElements: Map<number, HTMLElement>
  let rendering: boolean = false;
  let computing: boolean = false;
  let lastComputedTick: Tick | null = null;
  let lastRenderedTick: Tick | null = null;
  let tickEvents: EventDescriptor[] = [];
  let pointerRemap: Record<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CLICK', KeyboardEvent["key"]> = {} as Record<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CLICK', KeyboardEvent["key"]>;
  let pointerRemapSensitivity = 10
  let pointerLayer = renderFrame.contentDocument!.createElement("div")
  pointerLayer.style.zIndex = (1000).toString()
  pointerLayer.className = 'pointer-layer'
  let pointerElement = renderFrame.contentDocument!.createElement("i")
  pointerElement.className = "fi fi-rr-interactive pointer"
  pointerLayer.appendChild(pointerElement)
  let showPointerLayer = false

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

  renderWorker.onmessage = async (
    message: MessageEvent<
      [action: "renderSprites", data: Array<[index: number, frame: ImageBitmap]>, tick: Tick] |
      [action: "renderError", error: string]
    >
  ) => {
    const [action] = message.data;
    if (action === "renderSprites") {
      const [_, data, tick] = message.data;

      tick.timing.deltaRender =
        performance.now() - tick.timing.absTime - tick.timing.deltaCompute!;
      rendering = false;
      lastRenderedTick = tick;
      frames = data
    } else if (action === 'renderError') {
      console.debug(message.data[1])
      rendering = false
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

  renderFrame.contentDocument!.body.appendChild(pointerLayer)

  setInterval(() => {
    if (pointerRemap) {
      for (const key of globals.keysDown) {
        for (const action of ['UP', 'DOWN', 'LEFT', 'RIGHT', 'CLICK']) {
          if (pointerRemap[action] && pointerRemap[action] === key) {
            const clientX = Math.min(stageContext.width, Math.max(0, stageContext.fromStageX(globals.mouseX)))
            const clientY = Math.min(stageContext.height, Math.max(0, stageContext.fromStageY(globals.mouseY)))
            switch (action) {
              case "UP":
                onmousemove(new MouseEvent("mousemove", { clientX: clientX, clientY: Math.max(0, clientY - pointerRemapSensitivity) }))
                break;
              case "DOWN":
                onmousemove(new MouseEvent("mousemove", { clientX: clientX, clientY: Math.min(stageContext.height, clientY + pointerRemapSensitivity) }))
                break;
              case "LEFT":
                onmousemove(new MouseEvent("mousemove", { clientX: Math.max(0, clientX - pointerRemapSensitivity), clientY: clientY }))
                break;
              case "RIGHT":
                onmousemove(new MouseEvent("mousemove", { clientX: Math.min(stageContext.width, clientX + pointerRemapSensitivity), clientY: clientY }))
                break;
            }
          }
        }
      }
    }
  }, 1000 / 60)

  const onkeydown = (event: KeyboardEvent) => {
    if (!globals.keysDown.includes(event.key)) {
      globals.keysDown.push(event.key);
    }
    if (pointerRemap) {
      for (const action of ['CLICK']) {
        if (pointerRemap[action] && pointerRemap[action] === event.key) {
          const clientX = stageContext.fromStageX(globals.mouseX)
          const clientY = stageContext.fromStageY(globals.mouseY)
          switch (action) {
            case "CLICK":
              onmousedown(new MouseEvent("mousedown", { clientX: clientX, clientY: clientY }))
          }
        }
      }
    }
  }

  const onkeyup = (event: KeyboardEvent) => {
    if (globals.keysDown.includes(event.key)) {
      globals.keysDown.splice(globals.keysDown.indexOf(event.key), 1);
    }
    if (pointerRemap) {
      for (const action of ['CLICK']) {
        if (pointerRemap[action] && pointerRemap[action] === event.key) {
          const clientX = stageContext.fromStageX(globals.mouseX)
          const clientY = stageContext.fromStageY(globals.mouseY)
          switch (action) {
            case "CLICK":
              onmouseup(new MouseEvent("mouseup", { clientX: clientX, clientY: clientY }))
          }
        }
      }
    }
  }

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

  const createRenderElement = () => {
    const spriteCanvas =
      renderFrame.contentDocument!.createElement("canvas");
    const spriteContext = spriteCanvas.getContext('bitmaprenderer')!;

    spriteCanvas.style.filter = 'url(#colorFilter)'

    renderFrame.contentDocument!.body.appendChild(spriteCanvas);

    return [spriteCanvas, spriteContext] as const
  }

  let renderLoop: (time: number) => void;
  let renderElements: Array<readonly [HTMLCanvasElement, ImageBitmapRenderingContext]> = [createRenderElement()]

  renderLoop = async (now: number) => {
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
          spriteContext.transferFromImageBitmap(frame);
        }
      }
    }

    if (showPointerLayer) {
      pointerElement.style.visibility = 'visible'
      pointerElement.style.left = `${stageContext.fromStageX(globals.mouseX)}px`
      pointerElement.style.top = `${stageContext.fromStageY(globals.mouseY)}px`
    }

    debouncedUpdatePalette()
    renderFrame.contentWindow!.requestAnimationFrame(renderLoop);
  };

  const resizeLoop = () => {
    const box = container.getBoundingClientRect();

    if (
      stageContext.width !== box.width ||
      stageContext.height !== box.height
    ) {
      stageContext.width = box.width;
      stageContext.height = box.height;

      renderElements.forEach(([element]) => {
        element.height = box.height
        element.width = box.width
      })
    }
  }

  let gameSpeed = 1

  setInterval(resizeLoop, 500)

  resizeLoop()

  const gameLoop = () => {
    const now = performance.now();
    if (gameSpeed > 0 && now - lastTime >= (1000 / 60) / gameSpeed) {
      const deltaTime = (now - lastTime) * gameSpeed;

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
        colorMode: colorMode
      };

      if (computing === false) {
        callTick(tick);
        tickEvents = [];
        computing = true;
      }
    }
  };

  const update = (changes: ArrayBuffer, tick: Tick) => {
    tick.timing.deltaCompute = performance.now() - tick.timing.absTime;
    if (!rendering) {
      renderWorker.postMessage(["update", changes, tick], {
        transfer: [changes]
      });
      rendering = true;
    }
    lastComputedTick = tick;
    computing = false;
  };

  let logMessage = (log: Message) => {
    // Placeholder
  }

  const onLog = (log: Message) => {
    logMessage(log)
  }

  const { callTick, reload, trigger, setOnError } = await createVM({ language, update, onLog });

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
  renderFrame.contentDocument!.addEventListener("keydown", onkeydown);
  renderFrame.contentDocument!.addEventListener("keyup", onkeyup);

  renderFrame.contentWindow!.requestAnimationFrame(renderLoop);

  renderFrame.style.visibility = "visible";

  let colorMode: ColorMode | null = null
  let onUpdatePalette = (url: string) => {
    URL.revokeObjectURL(url)
  }

  let shouldGeneratePaletteImmediately = false
  let shouldGeneratePalette = true

  const debouncedUpdatePalette = (() => {
    let lastUpdate: number | null = null
    return () => {
      const now = performance.now()
      if (shouldGeneratePalette && (lastUpdate === null || now - lastUpdate > 2000 || shouldGeneratePaletteImmediately)) {
        shouldGeneratePaletteImmediately = false
        lastUpdate = now
        requestIdleCallback(async () => {
          const bitmaps = await Promise.all(renderElements.map(([element]) => createImageBitmap(element)))
          palleteWorker.postMessage(['generatePalette', lastRenderedTick, bitmaps], {
            transfer: bitmaps
          })
        })
      }
    }
  })()

  palleteWorker.addEventListener('message', (message: MessageEvent<[action: 'updatePalette', url: string]>) => {
    const [action] = message.data

    if (action === 'updatePalette') {
      const [_, url] = message.data
      onUpdatePalette(url)
    }
  })

  let loopInterval: ReturnType<typeof setInterval> | null = null

  return {
    reload: async (code: string) => {
      if (loopInterval) clearInterval(loopInterval)
      gameLoop()
      await reload(code);
      computing = false;
      loopInterval = setInterval(gameLoop, 1);
      shouldGeneratePaletteImmediately = true
    },
    setOnError,
    setColorCorrection: (correction: ColorMode | null) => {
      colorMode = correction
      shouldGeneratePaletteImmediately = true

      if (gameSpeed === 0) {
        renderWorker.postMessage(['rerender', colorMode])
      }
    },
    setGeneratePalette: (generatePalette: boolean) => {
      shouldGeneratePalette = generatePalette
      shouldGeneratePaletteImmediately = shouldGeneratePalette
    },
    onUpdatePalette: (callback: (url: string) => void) => {
      onUpdatePalette = callback
    },
    setGameSpeed: (speed: number) => {
      gameSpeed = Math.log10(speed * .9 + 10) - 1
    },
    setPointerRemap: (remap: typeof pointerRemap, sensitivity: number) => {
      pointerRemap = remap
      pointerRemapSensitivity = sensitivity
      showPointerLayer = !!Object.keys(remap).length
    },
    setLogMessage: (logger: typeof logMessage) => {
      logMessage = logger
    }
  };
};
