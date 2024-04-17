import { CircleDescriptor, KIND, TreeNode } from "@startcoding/types";
import { DESCRIPTOR, MAKE_NODE } from "../symbols";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import { z } from "zod";
import { zd } from "../utils";
import SAT from 'sat'

export class CircleElement extends AbstractInteractiveElement<'circle'> {
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

declare global {
  interface WorkerGlobalScope {
    Circle: typeof CircleElement
  }
}

self.Circle = CircleElement
