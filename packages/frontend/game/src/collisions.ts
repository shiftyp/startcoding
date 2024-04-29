import RBush from "rbush";
import { getRegisteredElements } from "./register";
import { TreeNode } from "@startcoding/types";
import { NODE } from "./symbols";
import SAT from 'sat'
import { getError } from "./loop";

let spriteTree = new RBush<{
  id: number;
  collider: SAT.Polygon | SAT.Circle;
}>();

export const buildSpriteTree = () => {
  if (getError()) return;
  spriteTree = new RBush(50);
  const registeredElements = getRegisteredElements()
  if (registeredElements && registeredElements.size) {
    const nodes = Array.from(registeredElements.values()).map(ele => ele[NODE]);
    spriteTree.load(nodes.filter(node => node !== null) as TreeNode[]);
  }
};

export const getSpriteTree = () => spriteTree