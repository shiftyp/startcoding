import { ElementDescriptor, ElementDescriptorOfKind, ID, KIND, TreeNode } from "@startcoding/types";
import { CHILDREN, DESCRIPTOR, MAKE_NODE, NODE, NODE_PRIVATE, PARENT, RESET_NODE } from "../symbols";
import { z } from "zod";
import { addToLayer, getId, getRegisteredElements, isHovering, listenElement, registerElement, removeFromLayer, unregisterElement } from "../register";
import { AbstractElement } from "./abstract_element";
import { getSpriteTree } from "../collisions";
import { zd } from "../utils";
import { getRenderingGroup } from "./group";
import SAT from 'sat'

const ElementDescriptorSchema = z.object({
  x: z.optional(z.number()),
  y: z.optional(z.number()),
  angle: z.optional(z.number()),
  layer: z.optional(z.number().min(0).max(100)),
  opacity: z.optional(z.number().min(0).max(100)),
  colorEffect: z.optional(z.number())
})

export abstract class AbstractInteractiveElement<Kind extends Exclude<ElementDescriptor[typeof KIND], 'backdrop'> = Exclude<ElementDescriptor[typeof KIND], 'backdrop'>> extends AbstractElement {
  [NODE_PRIVATE]: TreeNode | null = null;

  [DESCRIPTOR]: ElementDescriptorOfKind<Kind>;

  abstract [MAKE_NODE](): TreeNode | null

  constructor(kind: Kind, descriptor: Partial<Omit<ElementDescriptorOfKind<Kind>, typeof KIND>>) {
    super()
    ElementDescriptorSchema.parse(descriptor)
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
      [KIND]: kind
    }

    const renderingGroup = getRenderingGroup()
    
    if (renderingGroup) {
      
      renderingGroup[CHILDREN].push(this[ID])
      this[PARENT] = renderingGroup[ID]
    }

    registerElement(this)
  };

  [RESET_NODE]() {
    this[NODE_PRIVATE] = null
  };

  get [NODE]() {
    if (this[NODE_PRIVATE] === null) {
      const node = this[MAKE_NODE]()
      if (node) {
        node.id = this[ID]
        this[NODE_PRIVATE] = node
      }
    }

    return this[NODE_PRIVATE]
  };

  get layer() {
    return this[DESCRIPTOR].layer
  }

  @zd(z.function().args(z.number().min(0).max(100)))
  set layer(value) {
    if (!this.deleted) removeFromLayer(this[DESCRIPTOR]);
    this[DESCRIPTOR].layer = value;
    if (!this.deleted) addToLayer(this[DESCRIPTOR]);
  }

  get x() {
    return this[DESCRIPTOR].x
  };

  @zd(z.function().args(z.number()))
  set x(value: number) {
    this[DESCRIPTOR].x = value
    this[RESET_NODE]()
  };

  get y() {
    return this[DESCRIPTOR].y
  };

  @zd(z.function().args(z.number()))
  set y(value) {
    this[DESCRIPTOR].y = value
    this[RESET_NODE]()
  };

  get angle() {
    return this[DESCRIPTOR].angle
  };

  @zd(z.function().args(z.number()))
  set angle(value) {
    this[DESCRIPTOR].angle = value
    this[RESET_NODE]()
  };

  get hidden() {
    return this[DESCRIPTOR].hidden
  };

  set hidden(value) {
    this[DESCRIPTOR].hidden = value
  };

  get opacity() {
    return this[DESCRIPTOR].opacity
  };

  @zd(z.function().args(z.number().min(0).max(100)))
  set opacity(value) {
    this[DESCRIPTOR].opacity = Math.round(Math.max(
      0,
      Math.min(100, value)
    ) * 10) / 10;
  };

  get colorEffect() {
    return this[DESCRIPTOR].colorEffect
  };

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

  @zd(z.function().args(z.function()))
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

  @zd(z.function().args(z.function()))
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

  @zd(z.function().args(z.function()))
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

  @zd(z.function().args(z.function()))
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

  @zd(z.function().args(z.function()))
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

  @zd(z.function().args(z.instanceof(AbstractElement, {
    message: 'Expected a Sprite'
  })))
  touching(element: AbstractElement) {
    if (this[NODE] === null || element[NODE] === null) return false
    const otherCollider = element[NODE].collider;
    const selfCollider = this[NODE].collider;

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
  move(steps: number) {
    const rads = ((this.angle || 0) / 360) * 2 * Math.PI;
    const ratio = steps / Math.sin(Math.PI / 2);
    const xDelta = ratio * Math.sin(Math.PI / 2 - rads);
    const yDelta = ratio * Math.sin(rads);

    this.x += xDelta;
    this.y += yDelta;
  };
}
