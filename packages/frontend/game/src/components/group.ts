import { ID, KIND } from "@startcoding/types";
import { addTick } from "../loop";
import { getId, getRegisteredElements, registerElement, unregisterElement } from "../register";
import { REMOVE_TICK, SHOULD_RENDER, RENDER, CHILDREN, DESCRIPTOR, NODE } from "../symbols";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import { AbstractElement } from "./abstract_element";

let renderingGroup: GroupElement<any>[] = []

export const setRenderingGroup = (group: GroupElement<any>) => {
  renderingGroup.unshift(group)
  return () => {
    renderingGroup.splice(renderingGroup.indexOf(group), 1)
  }
}

export const getRenderingGroup = () => {
  return renderingGroup[0]
}

export class GroupElement<Properties> extends AbstractElement {
  [DESCRIPTOR]: Properties
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
    super()
    // @ts-expect-error
    this[DESCRIPTOR] = {
      ...descriptor,
      [KIND]: 'group',
    }

    this[RENDER] = render

    this[REMOVE_TICK] = addTick(() => {
      if (this[SHOULD_RENDER]) {
        const unset = setRenderingGroup(this)
        for (const id of this[CHILDREN]) {
          getRegisteredElements().get(id)?.delete()
        }
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

    // Object.freeze(this)

    if (!getRenderingGroup() === null) {
      getRenderingGroup()[CHILDREN].push(this[ID])
    }
  }

  get [NODE]() {
    return null;
  }

  delete(): void {
    for (const id of this[CHILDREN]) {
      getRegisteredElements().get(id)?.delete()
    }

    this[REMOVE_TICK]()
    
    unregisterElement(this)
    this.deleted = true;
  }
  touching(element: AbstractInteractiveElement) {
    if (element[NODE] === null) return false
    return this[CHILDREN].some((id) => {
      getRegisteredElements().get(id)?.touching(element)
    })
  };
  touchingElements(): AbstractInteractiveElement[] {
    if (this[NODE] === null) return [];
    return this[CHILDREN]
      .map((id) => getRegisteredElements().get(id))
      .filter((element) => element && !element.deleted)
      .reduce((acc, element) => [...acc, ...(element instanceof AbstractInteractiveElement ? element.touchingElements() : [])], [] as AbstractInteractiveElement[])
  };
  collideWith(element: AbstractInteractiveElement) { };
  distanceTo(other: AbstractElement) {
    return Math.min(
      ...this[CHILDREN]
        .map(
          id => getRegisteredElements().get(id)
        )
        .filter(
          element => !!element
        )
        .map(
          element => element!.distanceTo(other)
      )
    )
  };
}

declare global {
  interface WorkerGlobalScope {
    Group: typeof GroupElement
  }
}

self.Group = GroupElement