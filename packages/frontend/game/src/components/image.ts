import { ImageDescriptor, KIND, TreeNode } from "@startcoding/types";
import { MAKE_NODE, DESCRIPTOR, NODE_PRIVATE } from "../symbols";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import SAT from 'sat'
import { validate } from "../utils";

@validate({
  width: { type: "number", min: 0, optional: true },
  height: { type: "number", min: 0, optional: true },
  url: { type: 'string', min: 1, optional: true }
})
export class ImageElement extends AbstractInteractiveElement<'image'> {
  constructor(descriptor: Partial<Omit<ImageDescriptor, "kind">>) {
    super('image', {
      width: 10,
      height: 10,
      url: "",
      ...descriptor
    })
  };

  [MAKE_NODE]() {
    let node: TreeNode = this[NODE_PRIVATE] ? this[NODE_PRIVATE] : {} as TreeNode;

    const radians = (this[DESCRIPTOR].angle / 360) * 2 * Math.PI;
    let constrainedAngle = Math.abs(radians % Math.PI);
    let nodeWidth: number;
    let nodeHeight: number;

    if (Math.abs(constrainedAngle) < Math.PI / 2) {
      nodeWidth =
        this.width * Math.cos(constrainedAngle) +
        this.height * Math.sin(constrainedAngle);
      nodeHeight =
        this.width * Math.sin(constrainedAngle) +
        this.height * Math.cos(constrainedAngle);
    } else {
      const adjustedAngle = constrainedAngle - Math.PI / 2;
      nodeWidth =
        this.height * Math.cos(adjustedAngle) + this.width * Math.sin(adjustedAngle);
      nodeHeight =
        this.height * Math.sin(adjustedAngle) + this.width * Math.cos(adjustedAngle);
    }

    node.minX = this[DESCRIPTOR].x - nodeWidth / 2;
    node.maxX = this[DESCRIPTOR].x + nodeHeight / 2;
    node.minY = this[DESCRIPTOR].y - nodeWidth / 2;
    node.maxY = this[DESCRIPTOR].y + nodeHeight / 2;

    node.collider = new SAT.Polygon(
      new SAT.Vector(this[DESCRIPTOR].x, this[DESCRIPTOR].y),
      [
        new SAT.Vector(-this[DESCRIPTOR].width / 2, -this[DESCRIPTOR].height / 2),
        new SAT.Vector(this[DESCRIPTOR].width, 0),
        new SAT.Vector(0, this[DESCRIPTOR].height),
        new SAT.Vector(-this[DESCRIPTOR].width, 0),
      ]
    );

    node.collider.rotate(radians);

    return this[NODE_PRIVATE] = node;
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @validate({ type: "number", min: 0 })
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get height() {
    return this[DESCRIPTOR].height
  }

  @validate({ type: "number", min: 0 })
  set height(value) {
    this[DESCRIPTOR].height = value
  }

  get url() {
    return this[DESCRIPTOR].url
  }

  @validate({ type: 'string', min: 1 })
  set url(value) {
    this[DESCRIPTOR].url = value
  }

  jsonFn = function Image() {}
}

declare global {
  interface WorkerGlobalScope {
    Image: typeof ImageElement
  }
}

self.Image = ImageElement