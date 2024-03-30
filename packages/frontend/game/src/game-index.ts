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
  INTERNAL,
  CircleDescriptor,
  LineDescriptor,
} from "@startcoding/types";

import SAT from "sat";
import RBush from "rbush";

declare const width: number;
declare const height: number;
declare const minX: number;
declare const minY: number;
declare const mouseX: number;
declare const mouseY: number;
declare const mousedown: boolean;

declare const execute: () => void;
(() => {
  let spriteTree = new RBush<{
    id: number;
    collider: SAT.Polygon | SAT.Circle;
  }>();

  const backdropDescriptor = {
    kind: "backdrop",
    url: "",
    style: "cover",
  };

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
    message: MessageEvent<["trigger", EventDescriptor] | ["callTick", Tick]>
  ) => {
    const [action] = message.data;
    if (action === "trigger") {
      const [_, descriptor] = message.data;
      trigger(descriptor);
    } else if (action === "callTick") {
      const [_, tick] = message.data;
      callTick(tick);
    }
  };

  // @ts-ignore
  Array.prototype.remove = function (item) {
    this.splice(this.indexOf(item), 1);
  };

  const registeredElements: Record<number, InteractiveElement<any>> = {};
  const layers: Map<number, Set<ElementDescriptor>> = new Map([
    [0, new Set<ElementDescriptor>()],
  ]);
  const registeredDescriptors: Record<number, ElementDescriptor> = {};
  const registeredNodes: Set<{
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    id: number;
    collider: SAT.Polygon | SAT.Circle;
  }> = new Set();
  const tickCallbacks: Array<(tick: Tick) => void> = [];
  const globalListeners: Partial<
    Record<EventDescriptor["kind"], Array<(() => void) | null>>
  > = {};
  const elementListeners: Array<
    Partial<Record<EventDescriptor["kind"], Array<(() => void) | null>>>
  > = [];

  let id = 0;

  const register = (descriptor) => {
    const localId = id++;
    registeredDescriptors[localId] = descriptor;

    return {
      dispose: () => {
        delete registeredDescriptors[localId];
      },
      id: localId,
    };
  };

  const removeFromLayer = (descriptor: ElementDescriptor) => {
    layers.get(descriptor.layer)?.delete(descriptor);

    if (layers.get(descriptor.layer)?.size === 0) {
      layers.delete(descriptor.layer);
    }
  };

  const addToLayer = (descriptor: ElementDescriptor) => {
    if (!layers.has(descriptor.layer)) {
      layers.set(descriptor.layer, new Set<ElementDescriptor>([descriptor]));
    } else {
      layers.get(descriptor.layer)!.add(descriptor);
    }
  };

  const listenGlobal = (
    descriptor: GlobalEventProperties,
    callback: () => void
  ) => {
    globalListeners[descriptor.kind] = globalListeners[descriptor.kind] || [];
    globalListeners[descriptor.kind]!.push(callback);
  };

  const listenElement = (
    descriptor: LocalEventProperties,
    callback: () => void
  ) => {
    elementListeners[descriptor.id] = elementListeners[descriptor.id] || {};
    elementListeners[descriptor.id]![descriptor.kind] =
      elementListeners[descriptor.id]![descriptor.kind] || [];
    elementListeners[descriptor.id]![descriptor.kind]!.push(callback);
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
        const listeners = elementListeners[id]?.[descriptor.kind];
        if (listeners) {
          listeners.forEach((callback) => {
            callback && callback();
          });
        }
      });
    }
  };

  const addTick = (callback: (tick: Tick) => void) => {
    tickCallbacks.push(callback);
  };

  let frameNumber = 0;

  const callTick = (tick: Tick) => {
    frameNumber++;
    for (const key in tick.globals) {
      globalThis[key] = tick.globals[key];
    }

    tickCallbacks.forEach((callback) => {
      callback(tick);
    });

    update(tick);
  };

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
      const listeners = elementListeners[id]?.["mouseout"];
      if (listeners) {
        listeners.forEach((callback) => {
          callback && callback();
        });
      }
    });
    overElementIds.forEach((id) => {
      const listeners = elementListeners[id]?.["mouseover"];
      if (listeners) {
        listeners.forEach((callback) => {
          callback && callback();
        });
      }
    });

    tick.events.forEach(trigger);
  });

  setInterval(() => {
    const nodes = Array.from(registeredNodes.values());
    spriteTree = new RBush(50);
    spriteTree.load(nodes);
  }, 10);

  globalThis.randomX = () => {
    return Math.random() * width + minX;
  };

  globalThis.randomY = () => {
    return Math.random() * height + minY;
  };

  globalThis.setBackdropURL = (url: string) => {
    backdropDescriptor.url = url;
    updateBackdrop();
  };

  globalThis.every = (
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
    };

    const descriptor = {
      kind,
      ...defaults,
      ...props,
    } as ElementDescriptorOfKind<Kind>;

    const { dispose, id } = register(descriptor);

    const internal = {
      node: {
        ...config.makeNode(descriptor),
        id,
      },
      descriptor,
    };

    const proxy = new Proxy(
      {
        [INTERNAL]: internal,
        delete: () => {
          delete registeredElements[id];
          registeredNodes.delete(proxy[INTERNAL].node);
          removeFromLayer(proxy[INTERNAL].descriptor);
          delete elementListeners[id];
          dispose();
        },
        hide: () => {
          proxy.hidden = true;
        },
        show: () => {
          proxy.hidden = false;
        },
        onMouseDown: (callback) => {
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
        onMouseUp: (callback) => {
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
        onMouseOver: (callback) => {
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
        onMouseOut: (callback) => {
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
        onMouseMove: (callback) => {
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
        touching: (element) => {
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
            .map(({ id }) => registeredElements[id])
            .filter((element) => element)
            .filter((element) => element.touching(proxy));
        },
        distanceTo: (other) => {
          return Math.sqrt(
            (other.x - proxy.x) * (other.x - proxy.x) +
              (other.y - proxy.y) * (other.y - proxy.y)
          );
        },
        collideWith: (obj2) => {
          // const obj1 = proxy
          // let vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};
          // let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
          // return {
          //   xPart: vCollisionNorm.x,
          //   yPart: vCollisionNorm.y,
          //   angle: Math.atan2(vCollisionNorm.x, vCollisionNorm.y)
          // };
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
          if (
            key !== "kind" &&
            target[INTERNAL].descriptor.hasOwnProperty(key)
          ) {
            return target[INTERNAL].descriptor[key];
          } else {
            return target[key];
          }
        },
        set: (target, key, value) => {
          if (key === "layer") {
            removeFromLayer(target[INTERNAL].descriptor);
            target[INTERNAL].descriptor.layer = value;
            addToLayer(target[INTERNAL].descriptor);
          } else if (target[INTERNAL].descriptor.hasOwnProperty(key)) {
            target[INTERNAL].descriptor[key] = value;

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
              registeredNodes.delete(target[INTERNAL].node);
              const node = config.makeNode(
                target[INTERNAL].descriptor
              ) as TreeNode;
              node.id = id;
              target[INTERNAL].node = node;
              registeredNodes.add(node);
            }
          } else {
            target[key] = value;
          }

          return true;
        },
      }
    ) as unknown as InteractiveElement<Kind>;

    for (const key of Object.keys(descriptor)) {
      if (key !== "kind") proxy[key] = props[key];
    }

    registeredElements[id] = proxy;

    return proxy;
  };

  //@ts-ignore
  globalThis.Image = function (props: Omit<ImageDescriptor, "kind">) {
    const defaults: Omit<ImageDescriptor, "kind" | keyof ElementDescriptor> = {
      width: 0,
      height: 0,
      url: "",
    };

    const makeNode = (descriptor) => {
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

  globalThis.Circle = function (props: Omit<CircleDescriptor, "kind">) {
    const defaults: Omit<CircleDescriptor, "kind" | keyof ElementDescriptor> = {
      radius: 0,
      color: "rgb(0,0,0)",
    };

    const makeNode = (descriptor) => {
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

  globalThis.Line = function (props: Omit<LineDescriptor, "kind">) {
    const defaults: Omit<LineDescriptor, "kind" | keyof ElementDescriptor> = {
      x1: 0,
      y1: 0,
      color: "rgb(0,0,0)",
      width: 1,
    };

    const makeNode = (descriptor) => {
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

  setTimeout(() => execute());
})();
