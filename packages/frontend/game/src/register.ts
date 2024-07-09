import { ElementDescriptor, EventDescriptor, GlobalEventProperties, ID, LocalEventProperties, KIND, BackdropDescriptor, FillerDescriptor } from "@startcoding/types";
import { AbstractElement } from "./components/abstract_element";
import { addTick, resetTickCallbacks } from "./loop";
import { getSpriteTree } from "./collisions";
import { PARENT, DESCRIPTOR } from "./symbols";
import { difference } from "./utils";
import SAT from 'sat'
import { backdropDescriptor } from "./components/backdrop";


let lastHoverIds = new Set<number>();
let currentHoverIds = new Set<number>();

export const isHovering = (id: number) => currentHoverIds.has(id)

let globalListeners: Map<
  EventDescriptor["kind"],
  Set<() => void>
> = new Map();
let elementListeners: Map<number, Map<EventDescriptor["kind"], Set<() => void>>> = new Map()

export const trigger = (descriptor: EventDescriptor) => {
  if (
    descriptor.kind === "mousedown" ||
    descriptor.kind === "mouseup" ||
    descriptor.kind === "mousemove"
  ) {
    currentHoverIds.forEach((id) => {
      const listeners = elementListeners.get(id)?.get(descriptor.kind)
      if (listeners) {
        listeners.forEach((callback) => {
          if (callback) {
            callback();
          }
        });
      }
    });
  }
};

addTick((tick) => {
  const nodes = getSpriteTree().search({
    minX: tick.globals.mouseX,
    maxX: tick.globals.mouseX,
    minY: tick.globals.mouseY,
    maxY: tick.globals.mouseY,
  });

  const collisionPoint = new SAT.Vector(tick.globals.mouseX, tick.globals.mouseY);

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
        while (element) {
          acc.add(element[ID])
          element = registeredElements.get(element[PARENT]!)!
        }
      }
      return acc
    }, new Set<number>())

  const outElementIds = difference(lastHoverIds, currentHoverIds);

  const overElementIds = difference(currentHoverIds, lastHoverIds);

  outElementIds.forEach((id) => {
    const listeners = elementListeners.get(id)?.get("mouseout");
    if (listeners) {
      listeners.forEach((callback) => {
        if (callback) {
          callback();
        }
      });
    }
  });
  overElementIds.forEach((id) => {
    const listeners = elementListeners.get(id)?.get("mouseover");
    if (listeners) {
      listeners.forEach((callback) => {
        if (callback) {
          callback()
        };
      });
    }
  });

  tick.events.forEach(trigger);
}, 0);



let registeredElements: Map<number, AbstractElement>

let layers: Map<number, Set<ElementDescriptor | BackdropDescriptor | FillerDescriptor>> = new Map([
  [-1, new Set([backdropDescriptor])],
  [0, new Set()]
]);

let nextId = 0

export const registerElement = (element: AbstractElement) => {
  registeredElements.set(element[ID], element)
  addToLayer(element[DESCRIPTOR])
}

export const unregisterElement = (element: AbstractElement
) => {
  registeredElements.delete(element[ID])
  removeFromLayer(element[DESCRIPTOR])
  elementListeners.delete(element[ID]);
  if (lastHoverIds.has(element[ID])) lastHoverIds.delete(element[ID])
}

export const getRegisteredElements = () => {
  return registeredElements
}

export const getId = () => {
  return nextId++
}

export const removeFromLayer = (descriptor: ElementDescriptor) => {
  layers.get(descriptor.layer)?.delete(descriptor);

  if (layers.get(descriptor.layer)?.size === 0) {
    layers.delete(descriptor.layer);
  }
};

export const addToLayer = (descriptor: ElementDescriptor) => {

  if (!layers.has(descriptor.layer)) {
    layers.set(
      descriptor.layer,
      new Set([descriptor])
    );
  } else {
    layers.get(descriptor.layer)!.add(descriptor);
  }
};

export const getLayers = () => {
  return layers
}

export const listenGlobal = (
  descriptor: GlobalEventProperties,
  callback: () => void
) => {
  if (!globalListeners.has(descriptor.kind as EventDescriptor["kind"])) {
    globalListeners.set(descriptor.kind as EventDescriptor["kind"], new Set())
  }
  globalListeners.get(descriptor.kind as EventDescriptor["kind"])!.add(callback);
};

export const listenElement = (
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

export const reset = () => {
  registeredElements = new Map()

  layers = new Map([
    [-1, new Set([backdropDescriptor])],
    [0, new Set()]
  ]);
  globalListeners = new Map();
  elementListeners = new Map();

  nextId = 0;
  resetTickCallbacks()
}