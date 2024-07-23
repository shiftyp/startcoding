import { GroupDescriptor, ID, KIND } from "@startcoding/types";
import { addTick } from "../loop";
import { getId, getRegisteredElements, unregisterElement } from "../register";
import { REMOVE_TICK, RENDER, CHILDREN, DESCRIPTOR, NODE, PARENT } from "../symbols";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import { AbstractElement } from "./abstract_element";
import { getRenderingGroup, setRenderingGroup } from "./util_functions";
import { validate } from "../utils";

// @ts-expect-error
export class GroupElement<Properties extends Record<string, any> & GroupDescriptor> extends AbstractElement<Properties & { [KIND]: "group"}> implements AbstractInteractiveElement<"group"> {
  [KIND] = 'group';
  // @ts-expect-error
  [DESCRIPTOR]: Properties = this as unknown as Properties & { [KIND]: "group" }
  [REMOVE_TICK]: () => void;
  [RENDER] = (properties: Properties) => { };

  private [CHILDREN]: Map<string, AbstractElement> = new Map();

  angle = 90
  x = 0
  y = 0
  layer = 0
  hidden = false
  opacity = 100
  colorEffect = 0


  constructor(descriptor: Omit<Properties, "kind">, render: (properties: Properties) => void) {
    super(descriptor)
    for (const key in descriptor) {
      this[DESCRIPTOR][key as keyof Properties] = descriptor[key as keyof typeof descriptor]
    }

    this[RENDER] = render

    this[REMOVE_TICK] = addTick(() => {
        const unset = setRenderingGroup(this)
        this[CHILDREN].forEach(child => {
          child.delete()
        })
        this[RENDER](this[DESCRIPTOR])
        unset()
    }, 2)

    const renderingGroup = getRenderingGroup()

    if (renderingGroup) {
      renderingGroup[CHILDREN].push(this[ID])
      this[PARENT] = renderingGroup[ID]
    }
  }

  get [NODE]() {
    return null;
  }

  removeChild(name: string) {
    this[CHILDREN].delete(name)
  }

  addChild(child: AbstractElement) {
    if (!child.name || this[CHILDREN].has(child.name)) {
      throw new Error('Child names must be unique')
    }

    this[CHILDREN].set(child.name, child)
  }

  getChild(name: string) {
    return this[CHILDREN].get(name)
  }

  delete(): void {
    for (const [name, child] of this[CHILDREN]) {
     child.delete()
    }

    this[REMOVE_TICK]()
    // @ts-ignore
    unregisterElement(this)
    this.deleted = true;
  }
  touching(element: AbstractInteractiveElement) {
    if (element[NODE] === null) return false
    for (const child of this[CHILDREN].values()) {
      if (child.touching(element)) {
        return true
      }
    }
    return false
  };
  touchingElements(): AbstractInteractiveElement[] {
    if (this[NODE] === null) return [];
    return Array.from(this[CHILDREN].values())
      .filter((element) => element && !element.deleted)
      .reduce((acc, element) => [...acc, ...(element instanceof AbstractInteractiveElement ? element.touchingElements() : [])], [] as AbstractInteractiveElement[])
  };
  collideWith(element: AbstractInteractiveElement) { };
  distanceTo(other: AbstractElement) {
    return Math.min(
      ...Array.from(this[CHILDREN].values())
        .filter(
          element => !!element
        )
        .map(
          element => element!.distanceTo(other)
      )
    )
  };

  jsonFn: () => string = () => {
    return `[\n${Array.from(this[CHILDREN].values()).map(child => child.toJSON()).join(',\n')}\n]`
  };

  @validate({ type: "number" })
  move(steps: number) {
    const rads = ((this.angle || 0) / 360) * 2 * Math.PI;
    const ratio = steps / Math.sin(Math.PI / 2);
    const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
    const yDelta = ratio * Math.sin(rads);

    this.x += xDelta;
    this.y += yDelta;
  };
}

export const create = <T extends Record<string, any> & GroupDescriptor>(fn: (group: T) => void, initial: T): GroupElement<T> => {
  return new (
    // @ts-expect-error
    Group as typeof GroupElement
  )(initial, fn)
}

declare global {
  interface WorkerGlobalScope {
    Group: typeof GroupElement
    create: typeof create
  }
}

self.Group = GroupElement
self.create = create