import { ID, TreeNode } from "@startcoding/types";
import { DESCRIPTOR, NODE, PARENT } from "../symbols";
import { getId } from "../register";

export abstract class AbstractElement {
  [ID] = getId();
  [PARENT]: number | null = null;
  [DESCRIPTOR]: any
  
  deleted: boolean = false;
  
  abstract readonly [NODE]: TreeNode | null;
  abstract touching(element: AbstractElement): boolean;
  abstract delete() : void
  abstract distanceTo(element: AbstractElement): number
}