import { LineDescriptor, KIND, TreeNode } from "@startcoding/types";
import { z } from "zod";
import { DESCRIPTOR, MAKE_NODE } from "../symbols";
import { zd } from "../utils";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import SAT from 'sat'

export class LineElement extends AbstractInteractiveElement<"line"> {
  constructor(descriptor: Partial<Omit<LineDescriptor, typeof KIND>>) {
    super('line', {
      x1: 0,
      y1: 0,
      color: "rgb(0,0,0)",
      width: 5,
      ...descriptor
    })
  }

  [MAKE_NODE]() {
    const { width, x, y, x1, y1 } = this[DESCRIPTOR];
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

  get color() {
    return this[DESCRIPTOR].color
  }

  @zd(z.function().args(z.string()))
  set color(value) {
    this[DESCRIPTOR].color = value
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @zd(z.function().args(z.number()))
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get x1() {
    return this[DESCRIPTOR].x1
  }

  @zd(z.function().args(z.number()))
  set x1(value) {
    this[DESCRIPTOR].x1 = value
  }

  get y1() {
    return this[DESCRIPTOR].y1
  }

  @zd(z.function().args(z.number()))
  set y1(value) {
    this[DESCRIPTOR].y1 = value
  }
};


declare global {
  interface WorkerGlobalScope {
    Line: typeof LineElement
  }
}

self.Line = LineElement
