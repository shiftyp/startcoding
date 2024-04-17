import { KIND, TreeNode, Animations, AnimationImages, AnimationCostumes, AnimationsAnimations, AnimationDescriptor} from "@startcoding/types";
import { z } from "zod";
import { MAKE_NODE, DESCRIPTOR, REMOVE_TICK } from "../symbols";
import { zd } from "../utils";
import { addTick } from '../loop'
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import SAT from 'sat'

export class AnimationElement extends AbstractInteractiveElement<'animation'> {
  [REMOVE_TICK]: () => void;

  constructor(descriptor: Partial<Omit<AnimationDescriptor<AnimationImages, AnimationCostumes, AnimationsAnimations>, typeof KIND>>) {
    super('animation', {
      width: 0,
      height: 0,
      frame: 0,
      frameRate: 1 / 60,
      ...descriptor
    })
    let lastUpdate = 0

    this[REMOVE_TICK] = addTick((tick) => {
      const now = performance.now()

      if (now - lastUpdate >= this[DESCRIPTOR].frameRate * 1000) {
        lastUpdate = now
        this[DESCRIPTOR].frame++
      }
    }, 1)
  };

  [MAKE_NODE]() {
    let node: TreeNode = {} as TreeNode;

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

    return node;
  }

  get width() {
    return this[DESCRIPTOR].width
  }

  @zd(z.function().args(z.number()))
  set width(value) {
    this[DESCRIPTOR].width = value
  }

  get height() {
    return this[DESCRIPTOR].height
  }

  @zd(z.function().args(z.number()))
  set height(value) {
    this[DESCRIPTOR].height = value
  }

  get frame() {
    return this[DESCRIPTOR].frame
  }

  @zd(z.function().args(z.number()))
  set frame(value) {
    this[DESCRIPTOR].frame = value
  }

  get animation() {
    return this[DESCRIPTOR].animation
  }

  @zd(z.function().args(z.string()))
  set animation(value) {
    this[DESCRIPTOR].animation = value
  }

  get image() {
    return this[DESCRIPTOR].image
  }

  @zd(z.function().args(z.string()))
  set image(value) {
    this[DESCRIPTOR].image = value
  }

  get costume() {
    return this[DESCRIPTOR].costume
  }

  @zd(z.function().args(z.number()))
  set costume(value) {
    this[DESCRIPTOR].costume = value
  }

  get frameRate() {
    return this[DESCRIPTOR].frameRate
  }

  @zd(z.function().args(z.number()))
  set frameRate(value) {
    this[DESCRIPTOR].frameRate = value
  }

  delete() {
    super.delete()

    this[REMOVE_TICK]()
  }
}

declare global {
  interface WorkerGlobalScope {
    Animation: typeof AnimationElement
  }
}

self.Animation = AnimationElement