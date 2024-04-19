import { CircleDescriptor, KIND, TreeNode } from "@startcoding/types";
import { DESCRIPTOR, MAKE_NODE } from "../symbols";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import { validate } from "../utils";
import SAT from 'sat'

@validate({
  radius: { type: 'number', min: 0, optional: true },
  color: { type: 'string', min: 1, optional: true }
})
export class CircleElement extends AbstractInteractiveElement<'circle'> {
  constructor(descriptor: Partial<Omit<CircleDescriptor, typeof KIND>>) {
    super('circle', {
      radius: 10,
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

  @validate({ type: 'number', min: 0 })
  set radius(value) {
    this[DESCRIPTOR].radius = value
  }

  get color() {
    return this[DESCRIPTOR].color
  }

  @validate({ type: 'string', min: 1 })
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
