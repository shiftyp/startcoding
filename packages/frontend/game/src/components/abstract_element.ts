import { ElementDescriptor, ID, TreeNode } from "@startcoding/types";
import { DESCRIPTOR, NODE, PARENT } from "../symbols";
import { getId } from "../register";

export abstract class AbstractElement<T = any> {
  [ID] = getId();
  [PARENT]: number | null = null;
  abstract [DESCRIPTOR]: T
  
  deleted: boolean = false;
  
  abstract readonly [NODE]: TreeNode | null;
  abstract touching(element: AbstractElement<any>): boolean;
  abstract delete() : void
  abstract distanceTo(element: AbstractElement<any>): number
  abstract jsonFn: () => void
  
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

// @ts-expect-error
export class Element extends AbstractElement {

}

export type ElementConstructor = typeof Element