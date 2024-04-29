import { LineDescriptor, KIND, TreeNode } from "@startcoding/types";
import { DESCRIPTOR, MAKE_NODE, NODE_PRIVATE } from "../symbols";
import { validate } from "../utils";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import SAT from 'sat'

@validate({
  x1: { type: 'number', optional: true },
  y1: { type: 'number', optional: true },
  color: { type: 'string', min: 1, optional: true },
  width: { type: 'number', min: 0, optional: true }
})
export class LineElement extends AbstractInteractiveElement<"line"> {
  constructor(descriptor: Partial<Omit<LineDescriptor, "kind">>) {
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
    let node: TreeNode = this[NODE_PRIVATE] ? this[NODE_PRIVATE] : {} as TreeNode;

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

    this[NODE_PRIVATE] = node;
  };

  get color() {
    return this[DESCRIPTOR].color
  }

  @validate({ type: 'string' })
  set color(value) {
    this[DESCRIPTOR].color = value
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @validate({ type: 'number', min: 0 })
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get x1() {
    return this[DESCRIPTOR].x1
  }

  @validate({ type: 'number' })
  set x1(value) {
    this[DESCRIPTOR].x1 = value
  }

  get y1() {
    return this[DESCRIPTOR].y1
  }

  @validate({ type: 'number' })
  set y1(value) {
    this[DESCRIPTOR].y1 = value
  }

  jsonFn = function Line() {}
};


declare global {
  interface WorkerGlobalScope {
    Line: typeof LineElement
  }
}

self.Line = LineElement
