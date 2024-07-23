import { ElementDescriptor, ID, TreeNode } from "@startcoding/types";
import { CHILDREN, DESCRIPTOR, NODE, PARENT } from "../symbols";
import { getId, getRegisteredElements, registerElement, unregisterElement } from "../register";
import { getRenderingGroup } from "./util_functions";

export abstract class AbstractElement<T = any> {
  [ID]: number = -1;
  [PARENT]: number | null = null;
  abstract [DESCRIPTOR]: T

  deleted: boolean = false;

  name?: string = ''

  abstract readonly [NODE]: TreeNode | null;
  abstract touching(element: AbstractElement<any>): boolean;
  abstract distanceTo(element: AbstractElement<any>): number
  abstract jsonFn: () => void

  constructor({
    name
  }: {
    name? : string
  }) {
    const renderingGroup = getRenderingGroup()

    if (renderingGroup) {
      const childElement = renderingGroup.getChild(name);

      if (childElement) {
        return childElement
      }
    }

    this[ID] = getId()

    if (renderingGroup && !name) {
      throw new Error('A unique name is required when elements are made in groups')
    }
    
    this.name = name

    if (renderingGroup) {
      renderingGroup.addChild(this)
    }
  }

  delete() {
    if (this[PARENT] !== null) {
      // @ts-expect-error
      getRegisteredElements().get(this[PARENT]).removeChild(this.name)
    }
    unregisterElement(this)
    this.deleted = true;
  };

  toJSON() {
    // @ts-expect-error
    const json = new this.jsonFn()
    for (const key of Object.keys(this[DESCRIPTOR] as Object)) {
      if (key !== 'kind') {
        json[key] = this[DESCRIPTOR][key as keyof T]
      }
    }
    return json
  }
}