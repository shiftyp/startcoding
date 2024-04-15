import {
  ElementDescriptor,
  ElementDescriptorOfKind,
  EventDescriptor,
  GlobalEventProperties,
  ImageDescriptor,
  TreeNode,
  Tick,
  LocalEventProperties,
  CircleDescriptor,
  LineDescriptor,
  TextDescriptor,
  ID,
  KIND,
  ChangeSet
} from "@startcoding/types";

import { ZodError, z } from 'zod'

import StackTrace from 'stacktrace-js'

import SAT from "sat";
import RBush from "rbush";

declare const width: number;
declare const height: number;
declare const minX: number;
declare const minY: number;
declare const mouseX: number;
declare const mouseY: number;
declare const mousedown: boolean;

const zd = (zod: z.Schema) => (value: any, { kind }: DecoratorContext) => {
  if ((kind === 'method' || kind === 'setter') && zod instanceof z.ZodFunction) {
    return zod.implement(value)
  }
}

const recursiveMessages = (obj: {
  // @ts-expect-error
  _errors: string[],
  [key: Exclude<string, '_errors'>] : {
    _errors: string[]
  }
}, prefix: string | null = null): string[] => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key === '_errors') {
      return [...acc, ...obj._errors.map(error => prefix !== null ? `Issue with ${prefix}: ${error}` : error)]
    } else {
      // @ts-expect-error
      return [...acc, ...recursiveMessages(obj[key], prefix !== null ? `${prefix}.${key}` : key)]
    }
  },[] as string[])
}

const DESCRIPTOR = Symbol("descriptor");
const NODE = Symbol("node");
const NODE_PRIVATE = Symbol("nodePrivate");
const MAKE_NODE = Symbol("makeNode");
const RESET_NODE = Symbol("resetNode");
const SHOULD_RENDER = Symbol("shouldRender");
const REMOVE_TICK = Symbol("removeTick");
const CHILDREN = Symbol("children");
const PARENT = Symbol("parent");
const RENDER = Symbol("render");

let scriptURL = ''

const textCanvas = new OffscreenCanvas(0, 0);
const textContext = textCanvas.getContext("2d")!;
const globalMethods: Record<string, any> = {};

let spriteTree = new RBush<{
  id: number;
  collider: SAT.Polygon | SAT.Circle;
}>();

const backdropDescriptor = {
  [KIND]: "backdrop",
  url: "",
  style: "cover",
};

const difference = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  if (Set.prototype.hasOwnProperty('difference')) {
    // @ts-ignore
    return setA.difference(setB)
  } else {
    const ret = new Set<T>()

    setA.forEach(item => {
      if (!setB.has(item)) {
        ret.add(item)
      }
    })

    return ret
  }
}

const update = async (tick: Tick) => {
  const serialized = Array.from(layers.entries())
    .sort(([aIndex], [bIndex]) => aIndex - bIndex)
    .map(([index, layer]) => [index, Array.from(layer).map(({ [KIND]: kind, ...rest }) => ({ kind, descriptor: rest }))]);

  if (backdropDescriptor) {
    // @ts-expect-error
    (serialized as ChangeSet).unshift([-1e10, [{ kind: 'backdrop', descriptor: backdropDescriptor }]])
  }

  const buffer = new TextEncoder().encode(JSON.stringify(serialized)).buffer;

  postMessage(["update", buffer, tick], {
    transfer: [buffer]
  });
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

    try {
      await execute(url)
    } catch (e: any) {
      postMessage(['loadError', e.toString()])
      return
    }

    postMessage(['loaded'])
  }
};

// @ts-ignore
Array.prototype.remove = function (item) {
  this.splice(this.indexOf(item), 1);
};

let registeredElements: Map<number, AbstractInteractiveElement>
let layers: Map<number, Set<ElementDescriptor>> = new Map([
  [0, new Set<ElementDescriptor>()],
]);
let tickCallbacks: Map<number, Set<(tick: Tick) => void>> = new Map();
let globalListeners: Map<
  EventDescriptor["kind"],
  Set<() => void>
> = new Map();
let elementListeners: Map<number, Map<EventDescriptor["kind"], Set<() => void>>> = new Map()

let nextId = 0

const registerElement = (element: AbstractInteractiveElement) => {
  registeredElements.set(element[ID], element)
  addToLayer(element[DESCRIPTOR])
}

const unregisterElement = (element: AbstractInteractiveElement) => {
  registeredElements.delete(element[ID])
  removeFromLayer(element[DESCRIPTOR])
  elementListeners.delete(element[ID]);
  if (lastHoverIds.has(element[ID])) lastHoverIds.delete(element[ID])
}

let renderingGroup: GroupElement<any>[] = []

const setRenderingGroup = (group: GroupElement<any>) => {
  renderingGroup.unshift(group)
  return () => {
    renderingGroup.splice(renderingGroup.indexOf(group), 1)
  }
}

const getRenderingGroup = () => {
  return renderingGroup[0]
}

const getId = () => {
  return nextId++
}

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

const addTick = (callback: (tick: Tick) => void, priority: number) => {
  if (!tickCallbacks.has(priority)) {
    tickCallbacks.set(priority, new Set())
  }

  const callbacks = tickCallbacks.get(priority)!
  callbacks.add(callback)

  return () => {
    callbacks.delete(callback)
  }
};

const execute = async (url: string) => {
  for (const key in Object.keys(globalMethods)) {
    // @ts-expect-error
    self[key] = globalMethods[key]
  }

  registeredElements = new Map();
  layers = new Map([
    [0, new Set<ElementDescriptor>()],
  ]);
  tickCallbacks = new Map();
  globalListeners = new Map();
  elementListeners = new Map();

  nextId = 0;

  addTick((tick) => {
    const nodes = spriteTree.search({
      minX: mouseX,
      maxX: mouseX,
      minY: mouseY,
      maxY: mouseY,
    });

    const collisionPoint = new SAT.Vector(mouseX, mouseY);

    lastHoverIds = currentHoverIds;
    currentHoverIds = nodes
      .sort((a, b) => {
        return b.id - a.id;
      })
      .filter((node) => {
        if (node.collider instanceof SAT.Polygon) {
          return SAT.pointInPolygon(collisionPoint, node.collider);
        } else if (node.collider instanceof SAT.Circle) {
          return SAT.pointInCircle(collisionPoint, node.collider)
        }
      })
      .map((node) => node.id)
      .reduce((acc, id) => {
        if (registeredElements.has(id)) {
          let element = registeredElements.get(id)!
          while (element[PARENT] !== null) {
            acc.add(element[PARENT])
            element = registeredElements.get(element[PARENT])!
          }
          acc.add(id)
        }
        return acc
      }, new Set<number>())

    const outElementIds = difference(lastHoverIds, currentHoverIds);

    const overElementIds = difference(currentHoverIds, lastHoverIds);

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
  }, 0);

  scriptURL = url
  await import(url)
}

const callTick = async (tick: Tick) => {
  for (const key in tick.globals) {
    // @ts-ignore
    self[key] = tick.globals[key];
  }

  textCanvas.height = tick.globals.height;
  textCanvas.width = tick.globals.width;

  const tickCallbackArray = Array.from(tickCallbacks.entries()).sort(([priorityA], [priorityB]) => {
    return priorityA - priorityB
  })

  tickCallbackArray.forEach(async ([_, callbacks]) => {
    try {
      callbacks.forEach(callback => callback(tick));
    } catch(e: any) {
      if (e instanceof Error) {
        let messages = [e.message]

        if (e instanceof ZodError) {
          const formatted = e.format()
          // @ts-expect-error
          messages = recursiveMessages(formatted)
        }

        const stack = await StackTrace.fromError(e)

        const firstTrace = stack.find(trace => {
          return trace.fileName === scriptURL
        })!

        postMessage(['tickError', {
          line: firstTrace.lineNumber,
          column: firstTrace.columnNumber,
          messages
        }])
      }
    }
  });

  update(tick);
};

setInterval(() => {
  spriteTree = new RBush(50);
  if (registeredElements && registeredElements.size) {
    const nodes = Array.from(registeredElements.values()).map(ele => ele[NODE]);
    spriteTree.load(nodes.filter(node => node !== null) as TreeNode[]);
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
};

export const Every = z.function()
  .args(
    z.number().min(0),
    z.union([z.literal('seconds'), z.literal('milliseconds')]),
    z.function()
  )

// @ts-ignore
const every = Every.implement((
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
  }, 1);
});

const ElementDescriptorSchema = z.object({
  x: z.optional(z.number()),
  y: z.optional(z.number()),
  angle: z.optional(z.number()),
  layer: z.optional(z.number().min(0).max(100)),
  opacity: z.optional(z.number().min(0).max(100)),
  colorEffect: z.optional(z.number())
})

abstract class AbstractElement { }

abstract class AbstractInteractiveElement<Kind extends Exclude<ElementDescriptor[typeof KIND], 'backdrop'> = Exclude<ElementDescriptor[typeof KIND], 'backdrop'>> extends AbstractElement {
  [ID] = getId();
  [PARENT]: number | null = null;

  [NODE_PRIVATE]: TreeNode | null = null

  deleted = false;
  [DESCRIPTOR]: ElementDescriptorOfKind<Kind>

  abstract [MAKE_NODE](): TreeNode | null

  constructor(kind: Kind, descriptor: Partial<Omit<ElementDescriptorOfKind<Kind>, typeof KIND>>) {
    super()
    ElementDescriptorSchema.parse(descriptor)
    // @ts-ignore
    this[DESCRIPTOR] = {
      x: 0,
      y: 0,
      angle: 0,
      layer: 0,
      hidden: false,
      opacity: 100,
      deleted: false,
      colorEffect: 0,
      ...descriptor,
      [KIND]: kind
    }

    if (renderingGroup.length > 0) {
      const renderingGroup = getRenderingGroup()
      renderingGroup[CHILDREN].push(this[ID])
      this[PARENT] = renderingGroup[ID]
    }

    registerElement(this)
  };

  [RESET_NODE]() {
    this[NODE_PRIVATE] = null
  };

  get [NODE]() {
    if (this[NODE_PRIVATE] === null) {
      const node = this[MAKE_NODE]()
      if (node) {
        node.id = this[ID]
        this[NODE_PRIVATE] = node
      }
    }

    return this[NODE_PRIVATE]
  };

  get layer() {
    return this[DESCRIPTOR].layer
  }

  @zd(z.function().args(z.number().min(0).max(100)))
  set layer(value) {
    if (!this.deleted) removeFromLayer(this[DESCRIPTOR]);
    this[DESCRIPTOR].layer = value;
    if (!this.deleted) addToLayer(this[DESCRIPTOR]);
  }

  get x() {
    return this[DESCRIPTOR].x
  };

  @zd(z.function().args(z.number()))
  set x(value: number) {
    this[DESCRIPTOR].x = value
    this[RESET_NODE]()
  };

  get y() {
    return this[DESCRIPTOR].y
  };

  @zd(z.function().args(z.number()))
  set y(value) {
    this[DESCRIPTOR].y = value
    this[RESET_NODE]()
  };

  get angle() {
    return this[DESCRIPTOR].angle
  };

  @zd(z.function().args(z.number()))
  set angle(value) {
    this[DESCRIPTOR].angle = value
    this[RESET_NODE]()
  };

  get hidden() {
    return this[DESCRIPTOR].hidden
  };

  set hidden(value) {
    this[DESCRIPTOR].hidden = value
  };

  get opacity() {
    return this[DESCRIPTOR].opacity
  };

  @zd(z.function().args(z.number().min(0).max(100)))
  set opacity(value) {
    this[DESCRIPTOR].opacity = Math.round(Math.max(
      0,
      Math.min(100, value)
    ) * 10) / 10;
  };

  get colorEffect() {
    return this[DESCRIPTOR].colorEffect
  };

  set colorEffect(value) {
    this[DESCRIPTOR].colorEffect = value % 360
  };

  delete() {
    unregisterElement(this)
    this.deleted = true;
  };

  hide() {
    this.hidden = true;
  };

  show() {
    this.hidden = false;
  };

  @zd(z.function().args(z.function()))
  onMouseDown(callback: () => void) {
    listenElement(
      {
        kind: "mousedown",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @zd(z.function().args(z.function()))
  onMouseUp(callback: () => void) {
    listenElement(
      {
        kind: "mouseup",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @zd(z.function().args(z.function()))
  onMouseOver(callback: () => void) {
    listenElement(
      {
        kind: "mouseover",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @zd(z.function().args(z.function()))
  onMouseOut(callback: () => void) {
    listenElement(
      {
        kind: "mouseout",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @zd(z.function().args(z.function()))
  onMouseMove(callback: () => void) {
    listenElement(
      {
        kind: "mousemove",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @zd(z.function().args(z.instanceof(AbstractElement, {
    message: 'Expected a Sprite'
  })))
  touching(element: AbstractInteractiveElement) {
    if (this[NODE] === null || element[NODE] === null) return false
    const otherCollider = element[NODE].collider;
    const selfCollider = this[NODE].collider;

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
  };
  touchingElements(): AbstractInteractiveElement[] {
    if (this[NODE] === null) return [];
    const nodes = spriteTree.search(this[NODE]);
    return nodes
      .map(({ id }) => registeredElements.get(id))
      .filter((element) => element && !element.deleted && element.touching(this)) as AbstractInteractiveElement[];
  };
  collideWith(element: AbstractInteractiveElement) { };
  distanceTo(other: AbstractInteractiveElement) {
    return Math.sqrt(
      (other.x - this.x) * (other.x - this.x) +
      (other.y - this.y) * (other.y - this.y)
    );
  };
  get mousedown() {
    return currentHoverIds.has(this[ID]);
  };
  move(steps: number) {
    const rads = ((this.angle || 0) / 360) * 2 * Math.PI;
    const ratio = steps / Math.sin(Math.PI / 2);
    const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
    const yDelta = ratio * Math.sin(rads);

    this.x += xDelta;
    this.y += yDelta;
  };
}

class ImageElement extends AbstractInteractiveElement<'image'> {
  constructor(descriptor: Partial<Omit<ImageDescriptor, typeof KIND>>) {
    super('image', {
      width: 0,
      height: 0,
      url: "",
      ...descriptor
    })
  };

  [MAKE_NODE]() {
    let node: TreeNode = {} as TreeNode;

    const radians = (this[DESCRIPTOR].angle / 360) * 2 * Math.PI;
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

    node.minX = this[DESCRIPTOR].x - nodeWidth / 2;
    node.maxX = this[DESCRIPTOR].x + nodeHeight / 2;
    node.minY = this[DESCRIPTOR].y - nodeWidth / 2;
    node.maxY = this[DESCRIPTOR].y + nodeHeight / 2;

    node.collider = new SAT.Polygon(
      new SAT.Vector(this[DESCRIPTOR].x, this[DESCRIPTOR].y),
      [
        new SAT.Vector(-this[DESCRIPTOR].width / 2, -this[DESCRIPTOR].height / 2),
        new SAT.Vector(this[DESCRIPTOR].width, 0),
        new SAT.Vector(0, this[DESCRIPTOR].height),
        new SAT.Vector(-this[DESCRIPTOR].width, 0),
      ]
    );

    node.collider.rotate(radians);

    return node;
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @zd(z.function().args(z.number()))
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get height() {
    return this[DESCRIPTOR].height
  }

  @zd(z.function().args(z.number()))
  set height(value) {
    this[DESCRIPTOR].height = value
  }

  get url() {
    return this[DESCRIPTOR].url
  }

  @zd(z.function().args(z.string()))
  set url(value) {
    this[DESCRIPTOR].url = value
  }
}

class CircleElement extends AbstractInteractiveElement<'circle'> {
  constructor(descriptor: Partial<Omit<CircleDescriptor, typeof KIND>>) {
    super('circle', {
      radius: 0,
      color: "rgb(0,0,0)",
      ...descriptor,
    })
  }

  [MAKE_NODE]() {
    const { radius, x, y } = this[DESCRIPTOR];
    let node: TreeNode = {} as TreeNode;

    node.minX = this[DESCRIPTOR].x - radius;
    node.maxX = this[DESCRIPTOR].x + radius;
    node.minY = this[DESCRIPTOR].y - radius;
    node.maxY = this[DESCRIPTOR].y + radius;

    node.collider = new SAT.Circle(new SAT.Vector(x, y), radius);

    return node;
  };

  get radius() {
    return this[DESCRIPTOR].radius
  }

  @zd(z.function().args(z.number()))
  set radius(value) {
    this[DESCRIPTOR].radius = value
  }

  get color() {
    return this[DESCRIPTOR].color
  }

  @zd(z.function().args(z.string()))
  set color(value) {
    this[DESCRIPTOR].color = value
  }
};

class LineElement extends AbstractInteractiveElement<"line"> {
  constructor(descriptor: Partial<Omit<LineDescriptor, typeof KIND>>) {
    super('line', {
      x1: 0,
      y1: 0,
      color: "rgb(0,0,0)",
      width: 5,
      ...descriptor
    })
  }

  [MAKE_NODE]() {
    const { width, x, y, x1, y1 } = this[DESCRIPTOR];
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

  get color() {
    return this[DESCRIPTOR].color
  }

  @zd(z.function().args(z.string()))
  set color(value) {
    this[DESCRIPTOR].color = value
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @zd(z.function().args(z.number()))
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get x1() {
    return this[DESCRIPTOR].x1
  }

  @zd(z.function().args(z.number()))
  set x1(value) {
    this[DESCRIPTOR].x1 = value
  }

  get y1() {
    return this[DESCRIPTOR].y1
  }

  @zd(z.function().args(z.number()))
  set y1(value) {
    this[DESCRIPTOR].y1 = value
  }
};

class TextElement extends AbstractInteractiveElement<"text"> {
  [REMOVE_TICK] = addTick(() => {
    if (this.textFn) {
      this[DESCRIPTOR].text = this.textFn()
    }
  }, 3)
  textFn: (() => string) | null = null
  constructor(descriptor: Partial<Omit<TextDescriptor, typeof KIND>> | {
    text?: () => string
  }) {
    super('text', {
      size: 10,
      fontFamily: "sans-serif",
      color: "rgb(0,0,0)",
      textAlign: "center",
      ...descriptor,
      text: typeof descriptor.text === 'function' ? descriptor.text() : ''
    })

    this.textFn = typeof descriptor.text === 'function' ? descriptor.text : null
  }

  [MAKE_NODE]() {
    const { x, y, text, size, fontFamily, textAlign } = this[DESCRIPTOR];
    let node: TreeNode = {} as TreeNode;

    textContext.font = size + "px " + fontFamily;
    textContext.textAlign = textAlign;

    const { width } = textContext?.measureText(text);

    node.collider = new SAT.Polygon(new SAT.Vector(x, y), [
      new SAT.Vector(width / 2, -size / 2),
      new SAT.Vector(width / 2, size / 2),
      new SAT.Vector(-width / 2, size / 2),
      new SAT.Vector(-width / 2, -size / 2),
    ]);

    return node;
  };

  @zd(z.function().args(z.union([z.function().returns(z.string()), z.string()])))
  set text(value: (() => string) | string) {
    if (typeof value === 'function') {
      this.textFn = value
      this[DESCRIPTOR].text = this.textFn()
    } else {
      this.textFn = null
      this[DESCRIPTOR].text = value
    }
  }

  get text() {
    return this.textFn || this[DESCRIPTOR].text
  }

  get size() {
    return this[DESCRIPTOR].size
  }

  @zd(z.function().args(z.number()))
  set size(value) {
    this[DESCRIPTOR].size = value
  }

  get color() {
    return this[DESCRIPTOR].color
  }

  @zd(z.function().args(z.string()))

  set color(value) {
    this[DESCRIPTOR].color = value
  }

  get fontFamily() {
    return this[DESCRIPTOR].fontFamily
  }

  @zd(z.function().args(z.string()))
  set fontFamily(value) {
    this[DESCRIPTOR].fontFamily = value
  }

  get textAlign() {
    return this[DESCRIPTOR].textAlign
  }

  @zd(z.function().args(z.string()))
  set textAlign(value) {
    this[DESCRIPTOR].textAlign = value
  }
};

class GroupElement<Properties> extends AbstractInteractiveElement<'group'> {
  [REMOVE_TICK]: () => void;
  [SHOULD_RENDER] = true;
  [RENDER] = (properties: Properties) => { };

  [ID] = getId();

  [CHILDREN]: number[] = [];

  // @ts-ignore
  static create<Properties>(render: typeof GroupElement.prototype[typeof RENDER]) {
    return function (descriptor: Omit<Properties, typeof KIND>) {
      return new GroupElement<Properties>({
        ...descriptor,
      }, render);
    }
  }

  constructor(descriptor: Omit<Properties, typeof KIND>, render: (properties: Properties) => void) {
    // @ts-expect-error
    super({
      ...descriptor,
      [KIND]: 'group',
    })

    this[RENDER] = render

    this[REMOVE_TICK] = addTick(() => {
      if (this[SHOULD_RENDER]) {
        const unset = setRenderingGroup(this)
        this[RENDER](this[DESCRIPTOR])
        this[SHOULD_RENDER] = false
        unset()
      }
    }, 2)

    const propertyKeys = Object.keys(descriptor) as (keyof Properties)[]

    Object.defineProperties(this, propertyKeys.reduce((acc, key) => {
      if (!this.hasOwnProperty(key)) {
        acc[key] = {
          get: () => {
            return this[DESCRIPTOR][key]
          },
          set: (value) => {
            this[DESCRIPTOR][key] = value
            this[SHOULD_RENDER] = true
          }
        }
      }

      return acc;
    }, {} as Record<keyof Properties, PropertyDescriptor>)
    )

    Object.freeze(this)

    if (!renderingGroup === null) {
      // @ts-expect-error
      renderingGroup._children.push(this[ID])
    }
  }

  [MAKE_NODE]() {
    return null;
  }

  delete(): void {
    for (const id of this[CHILDREN]) {
      registeredElements.get(id)?.delete()
    }
    super.delete()
    this[REMOVE_TICK]()
  }
  touching(element: AbstractInteractiveElement) {
    if (element[NODE] === null) return false
    return this[CHILDREN].some((id) => {
      registeredElements.get(id)?.touching(element)
    })
  };
  touchingElements(): AbstractInteractiveElement[] {
    if (this[NODE] === null) return [];
    return this[CHILDREN]
      .map((id) => registeredElements.get(id))
      .filter((element) => element && !element.deleted)
      .reduce((acc, element) => [...acc, ...element!.touchingElements()], [] as AbstractInteractiveElement[])
  };
  collideWith(element: AbstractInteractiveElement) { };
  distanceTo(other: AbstractInteractiveElement) {
    return Math.sqrt(
      (other.x - this.x) * (other.x - this.x) +
      (other.y - this.y) * (other.y - this.y)
    );
  };
}

declare global {
  interface WorkerGlobalScope {
    every: typeof every
    Image: typeof ImageElement
    Circle: typeof CircleElement
    Line: typeof LineElement
    Text: typeof TextElement
    Group: typeof GroupElement
  }
}

self.every = every
self.Image = ImageElement
self.Circle = CircleElement
self.Line = LineElement
self.Text = TextElement
self.Group = GroupElement