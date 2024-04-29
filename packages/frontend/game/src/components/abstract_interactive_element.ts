import { ElementDescriptor, ElementDescriptorOfKind, ID, KIND, TreeNode } from "@startcoding/types";
import { CHILDREN, DESCRIPTOR, MAKE_NODE, NODE, NODE_PRIVATE, PARENT, RESET_NODE } from "../symbols";
import { addToLayer, getId, getRegisteredElements, isHovering, listenElement, registerElement, removeFromLayer, unregisterElement } from "../register";
import { AbstractElement } from "./abstract_element";
import { getSpriteTree } from "../collisions";
import { validate } from "../utils";
import SAT from 'sat'
import { getRenderingGroup } from "./group";


@validate('string', {
  x: { type: "number", optional: true },
  y: { type: "number", optional: true },
  angle: { type: "number", optional: true},
  layer: { type: "number", min: 0, max: 100, optional: true },
  opacity: { type: "number", min: 0, max: 100, optional: true },
  colorEffect: { type: "number", optional: true },
  hidden: { type: "boolean", optional: true }
})
export abstract class AbstractInteractiveElement<Kind extends Exclude<ElementDescriptor["kind"], 'backdrop'> = Exclude<ElementDescriptor["kind"], 'backdrop'>> extends AbstractElement<ElementDescriptorOfKind<Kind>> {
  [NODE_PRIVATE]: TreeNode | null = null;

  [DESCRIPTOR]: ElementDescriptorOfKind<Kind>;

  abstract [MAKE_NODE](): void

  constructor(kind: Kind, descriptor: Partial<Omit<ElementDescriptorOfKind<Kind>, "kind">>) {
    super()
    // @ts-ignore
    this[DESCRIPTOR] = {
      x: 0,
      y: 0,
      angle: 0,
      layer: 0,
      hidden: false,
      opacity: 100,
      deleted: false,
      colorEffect: 0,
      ...descriptor,
      kind: kind
    }

    const renderingGroup = getRenderingGroup()
    
    if (renderingGroup) {
      
      renderingGroup[CHILDREN].push(this[ID])
      this[PARENT] = renderingGroup[ID]
    }

    registerElement(this)

    this[MAKE_NODE]()
  };

  [RESET_NODE]() {
    if (this[NODE_PRIVATE]) this[NODE_PRIVATE].invalid = true
  };

  get [NODE]() {
    if (this[NODE_PRIVATE] && this[NODE_PRIVATE].invalid) {
      this[MAKE_NODE]()
      this[NODE_PRIVATE]!.invalid = false
    }

    return this[NODE_PRIVATE]
  };

  get layer() {
    return this[DESCRIPTOR].layer
  }

  @validate({ type: "number", min: 0, max: 100 })
  set layer(value) {
    if (!this.deleted) removeFromLayer(this[DESCRIPTOR]);
    this[DESCRIPTOR].layer = value;
    if (!this.deleted) addToLayer(this[DESCRIPTOR]);
  }

  get x() {
    return this[DESCRIPTOR].x
  };

  @validate({ type: "number" })
  set x(value: number) {
    this[DESCRIPTOR].x = value
    this[RESET_NODE]()
  };

  get y() {
    return this[DESCRIPTOR].y
  };

  @validate({ type: "number" })
  set y(value) {
    this[DESCRIPTOR].y = value
    this[RESET_NODE]()
  };

  get angle() {
    return this[DESCRIPTOR].angle
  };

  @validate({ type: "number" })
  set angle(value) {
    this[DESCRIPTOR].angle = value
    this[RESET_NODE]()
  };

  get hidden() {
    return this[DESCRIPTOR].hidden
  };

  @validate({ type: "boolean" })
  set hidden(value) {
    this[DESCRIPTOR].hidden = value
  };

  get opacity() {
    return this[DESCRIPTOR].opacity
  };

  @validate({ type: "number", min: 0, max: 100 })
  set opacity(value) {
    this[DESCRIPTOR].opacity = Math.round(Math.max(
      0,
      Math.min(100, value)
    ) * 10) / 10;
  };

  get colorEffect() {
    return this[DESCRIPTOR].colorEffect
  };

  @validate({ type: "number" })
  set colorEffect(value) {
    this[DESCRIPTOR].colorEffect = value % 360
  };

  delete() {
    unregisterElement(this)
    this.deleted = true;
  };

  hide() {
    this.hidden = true;
  };

  show() {
    this.hidden = false;
  };

  @validate({ type: 'function' })
  onMouseDown(callback: () => void) {
    listenElement(
      {
        kind: "mousedown",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @validate({ type: 'function' })
  onMouseUp(callback: () => void) {
    listenElement(
      {
        kind: "mouseup",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @validate({ type: 'function' })
  onMouseOver(callback: () => void) {
    listenElement(
      {
        kind: "mouseover",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @validate({ type: 'function' })
  onMouseOut(callback: () => void) {
    listenElement(
      {
        kind: "mouseout",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @validate({ type: 'function' })
  onMouseMove(callback: () => void) {
    listenElement(
      {
        kind: "mousemove",
        context: "local",
        id: this[ID],
      },
      () => {
        callback();
      }
    );
  };

  @validate({ type: 'class', instanceOf: AbstractElement })
  touching(element: AbstractElement) {
    if (this[NODE] === null || element[NODE] === null) return false
    const otherNode = element[NODE]
    const selfNode = this[NODE]

    if (selfNode.minX >= otherNode.maxX || otherNode.minX >= selfNode.maxX) return false;
	  if (selfNode.minY >= otherNode.maxY || otherNode.minY >= selfNode.maxY) return false;

    const otherCollider = otherNode.collider;
    const selfCollider = selfNode.collider;

    if (otherCollider instanceof SAT.Polygon) {
      if (selfCollider instanceof SAT.Polygon) {
        return SAT.testPolygonPolygon(otherCollider, selfCollider);
      } else {
        return SAT.testCirclePolygon(selfCollider, otherCollider);
      }
    } else {
      if (selfCollider instanceof SAT.Polygon) {
        return SAT.testCirclePolygon(otherCollider, selfCollider);
      } else {
        return SAT.testCircleCircle(otherCollider, selfCollider);
      }
    }
  };
  touchingElements(): AbstractInteractiveElement[] {
    if (this[NODE] === null) return [];
    const nodes = getSpriteTree().search(this[NODE]);
    return nodes
      .map(({ id }) => getRegisteredElements().get(id))
      .filter((element) => element && !element.deleted && element instanceof AbstractInteractiveElement && element.touching(this)) as AbstractInteractiveElement[];
  };
  @validate({ type: 'class', instanceOf: AbstractElement })
  collideWith(element: AbstractInteractiveElement) { };
  distanceTo(other: AbstractInteractiveElement) {
    return Math.sqrt(
      (other.x - this.x) * (other.x - this.x) +
      (other.y - this.y) * (other.y - this.y)
    );
  };
  get mousedown() {
    return isHovering(this[ID]);
  };
  @validate({ type: "number" })
  move(steps: number) {
    const rads = ((this.angle || 0) / 360) * 2 * Math.PI;
    const ratio = steps / Math.sin(Math.PI / 2);
    const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
    const yDelta = ratio * Math.sin(rads);

    this.x += xDelta;
    this.y += yDelta;
  };
}
