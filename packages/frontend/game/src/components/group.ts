import { ElementDescriptor, ID, KIND } from "@startcoding/types";
import { addTick } from "../loop";
import { getId, getRegisteredElements, registerElement, unregisterElement } from "../register";
import { REMOVE_TICK, SHOULD_RENDER, RENDER, CHILDREN, DESCRIPTOR, NODE, PARENT } from "../symbols";
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

export abstract class GroupElement<Properties> extends AbstractElement<Properties> {
  [DESCRIPTOR]: Properties
  [REMOVE_TICK]: () => void;
  [SHOULD_RENDER] = true;
  [RENDER] = (properties: Properties) => { };

  [ID] = getId();

  [CHILDREN]: number[] = [];

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

    const renderingGroup = getRenderingGroup()

    if (renderingGroup !== null) {
      renderingGroup[CHILDREN].push(this[ID])
      this[PARENT] = renderingGroup[ID]
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
    // @ts-ignore
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