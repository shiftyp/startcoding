import {
  BackdropDescriptor,
  ElementDescriptor,
  ElementDescriptorOfKind,
  EventDescriptor,
  GlobalEventProperties,
  ImageDescriptor,
  Listen,
  TreeNode,
  TreeNodeInfo,
  Tick,
  Trigger,
  ElementEventCallbacks,
  ElementSetters,
  ElementGetters,
  ElementEvents,
  LocalEventProperties,
  ElementMethods,
  ElementInternal,
  InteractiveElement,
  CircleDescriptor,
  LineDescriptor,
  TextDescriptor,
} from "@startcoding/types";

import { INTERNAL } from "@startcoding/types"

import SAT from "sat";
import RBush from "rbush";

declare const width: number;
declare const height: number;
declare const minX: number;
declare const minY: number;
declare const mouseX: number;
declare const mouseY: number;
declare const mousedown: boolean;

const textCanvas = new OffscreenCanvas(0, 0);
const textContext = textCanvas.getContext("2d")!;
const globalMethods: Record<string, any> = {};

let spriteTree = new RBush<{
  id: number;
  collider: SAT.Polygon | SAT.Circle;
}>();

const backdropDescriptor = {
  kind: "backdrop",
  url: "",
  style: "cover",
};

let shouldExecute = false
let scriptUrl = ''

const update = async (tick: Tick) => {
  const serialized = Array.from(layers.entries())
    .sort(([aIndex], [bIndex]) => aIndex - bIndex)
    .map(([index, layer]) => [index, Array.from(layer)]);

  const buffer = new TextEncoder().encode(JSON.stringify(serialized)).buffer;

  postMessage(["update", buffer, tick], { transfer: [buffer] });
};

const updateBackdrop = () => {
  postMessage(["updateBackdrop", backdropDescriptor]);
};

onmessage = async (
  message: MessageEvent<[action: "trigger", descriptor: EventDescriptor] | [action: "callTick", tick: Tick] | [action: 'start', url: string]>
) => {
  const [action] = message.data;
  if (action === "trigger") {
    const [_, descriptor] = message.data;
    trigger(descriptor);
  } else if (action === "callTick") {
    const [_, tick] = message.data;
    callTick(tick);
  } else if (action === 'start') {
    const [_, url] = message.data
    shouldExecute = true
    scriptUrl = url
  }
};

// @ts-ignore
Array.prototype.remove = function(item) {
  this.splice(this.indexOf(item), 1);
};

let registeredElements: Map<number, InteractiveElement<any>>
let layers: Map<number, Set<ElementDescriptor>> = new Map([
  [0, new Set<ElementDescriptor>()],
]);
let registeredNodes: Set<{
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
  id: number;
  collider: SAT.Polygon | SAT.Circle;
}>
let tickCallbacks: Set<(tick: Tick) => void>;
let globalListeners: Map<
  EventDescriptor["kind"],
  Set<() => void>
>;
let elementListeners: Map<number, Map<EventDescriptor["kind"], Set<() => void>>>

let nextId = 0;

const removeFromLayer = (descriptor: ElementDescriptor) => {
  layers.get(descriptor.layer)?.delete(descriptor);

  if (layers.get(descriptor.layer)?.size === 0) {
    layers.delete(descriptor.layer);
  }
};

const addToLayer = (descriptor: ElementDescriptor) => {
  if (!layers.has(descriptor.layer)) {
    layers.set(
      descriptor.layer,
      new Set<ElementDescriptor>([descriptor])
    );
  } else {
    layers.get(descriptor.layer)!.add(descriptor);
  }
};

const listenGlobal = (
  descriptor: GlobalEventProperties,
  callback: () => void
) => {
  if (!globalListeners.has(descriptor.kind as EventDescriptor["kind"])) {
    globalListeners.set(descriptor.kind as EventDescriptor["kind"], new Set())
  }
  globalListeners.get(descriptor.kind as EventDescriptor["kind"])!.add(callback);
};

const listenElement = (
  descriptor: LocalEventProperties,
  callback: () => void
) => {
  if (!elementListeners.has(descriptor.id)) {
    elementListeners.set(descriptor.id, new Map())
  }
  if (!elementListeners.get(descriptor.id)?.has(descriptor.kind as EventDescriptor["kind"])) {
    elementListeners.get(descriptor.id)!.set(descriptor.kind as EventDescriptor["kind"], new Set())
    elementListeners.get(descriptor.id)!.get(descriptor.kind as EventDescriptor["kind"])!.add(callback);
  }
  
};

let lastHoverIds = new Set<number>();
let currentHoverIds = new Set<number>();

const trigger = (descriptor: EventDescriptor) => {
  if (
    descriptor.kind === "mousedown" ||
    descriptor.kind === "mouseup" ||
    descriptor.kind === "mousemove"
  ) {
    currentHoverIds.forEach((id) => {
      const listeners = elementListeners.get(id)?.get(descriptor.kind)
      if (listeners) {
        listeners.forEach((callback) => {
          callback && callback();
        });
      }
    });
  }
};

const addTick = (callback: (tick: Tick) => void) => {
  tickCallbacks.add(callback);
  return () => {
    tickCallbacks.delete(callback)
  }
};

const execute = async (url: string) => {
  for (const key in Object.keys(globalMethods)) {
    self[key] = globalMethods[key]
  }

  registeredElements = new Map();
  layers = new Map([
      [0, new Set<ElementDescriptor>()],
    ]);
  registeredNodes = new Set()
  tickCallbacks = new Set();
  globalListeners = new Map;
  elementListeners = new Map();

  nextId = 0;

  addTick((tick) => {
    const searchPadding = 25;
    const nodes = spriteTree.search({
      minX: mouseX + searchPadding,
      maxX: mouseX + searchPadding,
      minY: mouseY + searchPadding,
      maxY: mouseY + searchPadding,
    });
  
    const collisionPoint = new SAT.Vector(mouseX, mouseY);
  
    lastHoverIds = currentHoverIds;
    currentHoverIds = new Set(
      nodes
        .sort((a, b) => {
          return b.id - a.id;
        })
        .filter((node) => {
          if (node.collider instanceof SAT.Polygon) {
            return SAT.pointInPolygon(collisionPoint, node.collider);
          }
        })
        .map((node) => node.id)
    );
  
    const outElementIds: Set<number> =
      // @ts-ignore
      lastHoverIds.difference(currentHoverIds);
  
    const overElementIds: Set<number> =
      // @ts-ignore
      currentHoverIds.difference(lastHoverIds);
  
    outElementIds.forEach((id) => {
      const listeners = elementListeners.get(id)?.get("mouseout");
      if (listeners) {
        listeners.forEach((callback) => {
          callback && callback();
        });
      }
    });
    overElementIds.forEach((id) => {
      const listeners = elementListeners.get(id)?.get("mouseover");
      if (listeners) {
        listeners.forEach((callback) => {
          callback && callback();
        });
      }
    });
  
    tick.events.forEach(trigger);
  });
  
  await import(url)
}

const callTick = async (tick: Tick) => {
  for (const key in tick.globals) {
    // @ts-ignore
    self[key] = tick.globals[key];
  }

  if (shouldExecute) {
    shouldExecute = false
    await execute(scriptUrl)
  }

  textCanvas.height = tick.globals.height;
  textCanvas.width = tick.globals.width;

  tickCallbacks.forEach((callback) => {
    callback(tick);
  });

  update(tick);
};

setInterval(() => {
  spriteTree = new RBush(50);
  if (registeredNodes && registeredNodes.size) {
    const nodes = Array.from(registeredNodes.values()); 
    spriteTree.load(nodes);
  }
}, 10);

// @ts-ignore
self.randomX = () => {
  return Math.random() * width + minX;
};

// @ts-ignore
self.randomY = () => {
  return Math.random() * height + minY;
};

// @ts-ignore
self.setBackdropURL = (url: string) => {
  backdropDescriptor.url = url;
  updateBackdrop();
};

// @ts-ignore
self.every = (
  duration: number,
  unit: "seconds" | "milliseconds",
  callback: () => void
) => {
  let last = 0;

  addTick(({ timing: { deltaTime } }) => {
    last += deltaTime;
    let scale = 1;

    switch (unit) {
      case "seconds":
        scale = 1000;
        break;
      case "milliseconds":
        scale = 1;
        break;
    }

    if (last / scale >= duration) {
      callback();
      last = 0;
    }
  });
};

const InteractiveElement = <Kind extends ElementDescriptor["kind"]>(
  kind: Kind,
  props: Omit<
    ElementDescriptorOfKind<Kind>,
    "kind" | keyof ElementDescriptor
  >,
  config: {
    makeNode: (
      descriptor: ElementDescriptorOfKind<Kind>
    ) => Omit<TreeNode, "id">;
    events?: ElementEventCallbacks;
    setters?: ElementSetters<Kind>;
    getters?: ElementGetters<Kind>;
  }
) => {
  const defaults: Omit<ElementDescriptor, "kind"> = {
    x: 0,
    y: 0,
    angle: 0,
    layer: 0,
    hidden: false,
    opacity: 100,
    deleted: false,
    colorEffect: 0
  };

  const descriptor = {
    kind,
    ...defaults,
    ...props,
  } as ElementDescriptorOfKind<Kind>;

  const id = nextId++;

  const internal = {
    node: {
      ...config.makeNode(descriptor),
      id,
    },
    descriptor,
  };

  const checkDeleted = () => {
    const { deleted } = descriptor;
    if (deleted) {
      console.warn("Acting on a deleted sprite");
    }

    return deleted;
  };

  const proxy = (new Proxy(
    {
      [INTERNAL]: internal,
      delete: () => {
        registeredElements.delete(id)
        registeredNodes.delete(proxy[INTERNAL].node);
        removeFromLayer(proxy[INTERNAL].descriptor);
        elementListeners.delete(id);
        if (lastHoverIds.has(id)) lastHoverIds.delete(id)
        proxy.deleted = true;
      },
      hide: () => {
        proxy.hidden = true;
      },
      show: () => {
        proxy.hidden = false;
      },
      onMouseDown: (callback: () => void) => {
        listenElement(
          {
            kind: "mousedown",
            context: "local",
            id,
          },
          () => {
            config.events?.onMouseDown();
            callback();
          }
        );
      },
      onMouseUp: (callback: () => void) => {
        listenElement(
          {
            kind: "mouseup",
            context: "local",
            id,
          },
          () => {
            config.events?.onMouseUp();
            callback();
          }
        );
      },
      onMouseOver: (callback: () => void) => {
        listenElement(
          {
            kind: "mouseover",
            context: "local",
            id,
          },
          () => {
            config.events?.onMouseUp();
            callback();
          }
        );
      },
      onMouseOut: (callback: () => void) => {
        listenElement(
          {
            kind: "mouseout",
            context: "local",
            id,
          },
          () => {
            config.events?.onMouseUp();
            callback();
          }
        );
      },
      onMouseMove: (callback: () => void) => {
        listenElement(
          {
            kind: "mousemove",
            context: "local",
            id,
          },
          () => {
            config.events?.onMouseUp();
            callback();
          }
        );
      },
      touching: (element: InteractiveElement<any>) => {
        const otherCollider = element[INTERNAL].node.collider;
        const selfCollider = proxy[INTERNAL].node.collider;

        if (otherCollider instanceof SAT.Polygon) {
          if (selfCollider instanceof SAT.Polygon) {
            return SAT.testPolygonPolygon(otherCollider, selfCollider);
          } else {
            return SAT.testCirclePolygon(selfCollider, otherCollider);
          }
        } else {
          if (selfCollider instanceof SAT.Polygon) {
            return SAT.testCirclePolygon(otherCollider, selfCollider);
          } else {
            return SAT.testCircleCircle(otherCollider, selfCollider);
          }
        }
      },
      touchingElements: () => {
        const nodes = spriteTree.search(proxy[INTERNAL].node);
        return nodes
          .map(({ id }) => registeredElements.get(id))
          .filter((element) => element && !element.deleted && element.touching(proxy));
      },
      distanceTo: (other: InteractiveElement<any>) => {
        return Math.sqrt(
          (other.x - proxy.x) * (other.x - proxy.x) +
            (other.y - proxy.y) * (other.y - proxy.y)
        );
      },
      collideWith: (other: InteractiveElement<any>) => {
      },
      get mousedown() {
        return currentHoverIds.has(id);
      },
      move: (steps: number) => {
        const rads = ((proxy.angle || 0) / 360) * 2 * Math.PI;
        const ratio = steps / Math.sin(Math.PI / 2);
        const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
        const yDelta = ratio * Math.sin(rads);

        proxy.x += xDelta;
        proxy.y += yDelta;
      },
    },
    {
      get: (target, key) => {
        if (key === 'deleted') {
          return target[INTERNAL].descriptor.deleted
        }
        const deleted = checkDeleted();
        // @ts-ignore
        if (config.getters?.[key]) {
          // @ts-ignore
          return config.getters[key]()
        }
        if (
          key !== "kind" &&
          target[INTERNAL].descriptor.hasOwnProperty(key)
        ) {
          return target[INTERNAL].descriptor[key as keyof ElementDescriptorOfKind<Kind>];
        } else {
          // @ts-ignore
          return target[key as keyof InteractiveElement<Kind>];
        }
      },
      set: (target, key, value) => {
        const deleted = checkDeleted();
        // @ts-ignore
        if (config.setters?.[key]) {
          // @ts-ignore
          config.setters[key](value)
          return true;
        }
        if (key === "layer") {
          if (!deleted) removeFromLayer(target[INTERNAL].descriptor);
          target[INTERNAL].descriptor.layer = value;
          if (!deleted) addToLayer(target[INTERNAL].descriptor);
        } else if (key === "opacity") {
          target[INTERNAL].descriptor.opacity = Math.round(Math.max(
            0,
            Math.min(100, value)
          ) * 10) / 10;
        } else if (key === 'colorEffect') {
          target[INTERNAL].descriptor.colorEffect = value % 360
        } else if (target[INTERNAL].descriptor.hasOwnProperty(key)) {
          target[INTERNAL].descriptor[key as keyof ElementDescriptorOfKind<Kind>] = value;

          if (
            typeof key === "string" &&
            [
              "x",
              "y",
              "width",
              "height",
              "angle",
              "radius",
              "size",
              "x1",
              "y1",
            ].indexOf(key) !== -1
          ) {
            if (!deleted) registeredNodes.delete(target[INTERNAL].node);
            const node = config.makeNode(
              target[INTERNAL].descriptor
            ) as TreeNode;
            node.id = id;
            target[INTERNAL].node = node;
            if (!deleted) registeredNodes.add(node);
          }
        } else {
          // @ts-ignore
          target[key] = value;
        }

        return true;
      },
    }
  ) as unknown) as InteractiveElement<Kind>;

  for (const key of Object.keys(descriptor)) {
    // @ts-ignore
    if (key !== "kind") proxy[key as keyof ElementDescriptorOfKind<Kind>] = descriptor[key as keyof ElementDescriptorOfKind<Kind>];
  }
1
  registeredElements.set(id, proxy);

  return proxy;
};

//@ts-ignore
self.Image = 
  function(props: Omit<ImageDescriptor, "kind">) {
    const defaults: Omit<ImageDescriptor, "kind" | keyof ElementDescriptor> = {
      width: 0,
      height: 0,
      url: "",
    };

    const makeNode = (descriptor: ImageDescriptor) => {
      let node: TreeNode = {} as TreeNode;

      const radians = (descriptor.angle / 360) * 2 * Math.PI;
      let constrainedAngle = Math.abs(radians % Math.PI);
      let nodeWidth: number;
      let nodeHeight: number;

      if (Math.abs(constrainedAngle) < Math.PI / 2) {
        nodeWidth =
          width * Math.cos(constrainedAngle) +
          height * Math.sin(constrainedAngle);
        nodeHeight =
          width * Math.sin(constrainedAngle) +
          height * Math.cos(constrainedAngle);
      } else {
        const adjustedAngle = constrainedAngle - Math.PI / 2;
        nodeWidth =
          height * Math.cos(adjustedAngle) + width * Math.sin(adjustedAngle);
        nodeHeight =
          height * Math.sin(adjustedAngle) + width * Math.cos(adjustedAngle);
      }

      node.minX = descriptor.x - nodeWidth / 2;
      node.maxX = descriptor.x + nodeHeight / 2;
      node.minY = descriptor.y - nodeWidth / 2;
      node.maxY = descriptor.y + nodeHeight / 2;

      node.collider = new SAT.Polygon(
        new SAT.Vector(descriptor.x, descriptor.y),
        [
          new SAT.Vector(-descriptor.width / 2, -descriptor.height / 2),
          new SAT.Vector(descriptor.width, 0),
          new SAT.Vector(0, descriptor.height),
          new SAT.Vector(-descriptor.width, 0),
        ]
      );

      node.collider.rotate(radians);

      return node;
    };

    return InteractiveElement(
      "image",
      {
        ...defaults,
        ...props,
      },
      {
        makeNode,
      }
    );
  };

  // @ts-ignore
self.Circle =
  function(props: Omit<CircleDescriptor, "kind">) {
    const defaults: Omit<CircleDescriptor, "kind" | keyof ElementDescriptor> = {
      radius: 0,
      color: "rgb(0,0,0)",
    };

    const makeNode = (descriptor: CircleDescriptor) => {
      const { radius, x, y } = descriptor;
      let node: TreeNode = {} as TreeNode;

      node.minX = descriptor.x - radius;
      node.maxX = descriptor.x + radius;
      node.minY = descriptor.y - radius;
      node.maxY = descriptor.y + radius;

      node.collider = new SAT.Circle(new SAT.Vector(x, y), radius);

      return node;
    };

    return InteractiveElement(
      "circle",
      {
        ...defaults,
        ...props,
      },
      {
        makeNode,
      }
    );
  };

  // @ts-ignore
self.Line =
    function(props: Omit<LineDescriptor, "kind">) {
      const defaults: Omit<LineDescriptor, "kind" | keyof ElementDescriptor> = {
        x1: 0,
        y1: 0,
        color: "rgb(0,0,0)",
        width: 5,
      };

      const makeNode = (descriptor: LineDescriptor) => {
        const { width, x, y, x1, y1 } = descriptor;
        let node: TreeNode = {} as TreeNode;

        node.minX = Math.min(x, x1);
        node.maxX = Math.max(x, x1);
        node.minY = Math.min(y, y1);
        node.maxY = Math.max(y, y1);

        node.collider = new SAT.Polygon(new SAT.Vector(x, y), [
          new SAT.Vector(width / 2, y),
          new SAT.Vector(x1 - x + width / 2, y1),
          new SAT.Vector(x1 - x - width / 2, y1),
          new SAT.Vector(-width / 2, y),
        ]);

        return node;
      };

      return InteractiveElement(
        "line",
        {
          ...defaults,
          ...props,
        },
        {
          makeNode,
        }
      );
    };

//@ts-ignore
self.Text = 
  function(props: Omit<TextDescriptor, "kind"> & {
    text: string | (() => string)
  }) {
    const defaults: Omit<TextDescriptor, "kind" | keyof ElementDescriptor> = {
      size: 10,
      fontFamily: "sans-serif",
      color: "rgb(0,0,0)",
      text: "",
      textAlign: "center",
    };

    const makeNode = (descriptor: TextDescriptor) => {
      const { x, y, text, size, fontFamily, textAlign } = descriptor;
      let node: TreeNode = {} as TreeNode;

      textContext.font = size + "px " + fontFamily;
      textContext.textAlign = textAlign;

      const { width }= textContext?.measureText(text);

      node.collider = new SAT.Polygon(new SAT.Vector(x, y), [
        new SAT.Vector(width / 2, -size / 2),
        new SAT.Vector(width / 2, size / 2),
        new SAT.Vector(-width / 2, size / 2),
        new SAT.Vector(-width / 2, -size / 2),
      ]);

      return node;
    };

    let textFn: (() => string) | null = null

    const removeTextFnTick = addTick(() => {
      if (textFn) {
        proxy[INTERNAL].descriptor.text = textFn()
      }
    })

    const proxy = InteractiveElement(
      "text",
      {
        ...defaults,
        ...props,
      },
      {
        makeNode,
        setters: {
          text: (value: string | (() => string)) => {
            if (typeof value === 'function') {
              textFn = value
            } else {
              proxy[INTERNAL].descriptor.text = value
              textFn = null
            }
          }
        }
      }
    );

    return proxy
  };
