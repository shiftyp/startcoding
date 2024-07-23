import {
  KIND,
  TreeNode,
  Animations,
  AnimationImages,
  AnimationCostumes,
  AnimationsAnimations,
  AnimationDescriptor,
  animationInfo,
  CircleDescriptor,
} from "@startcoding/types";
import { MAKE_NODE, DESCRIPTOR, REMOVE_TICK, LAST_UPDATE, NODE_PRIVATE, NODE, MAKE_COLLIDER } from "../symbols";
import { addTick } from "../loop";
import { AbstractInteractiveElement } from "./abstract_interactive_element";
import SAT from "sat";
import { validate } from "../utils";
import FastestValidator, {
  ValidationError,
  ValidationSchema,
  ValidationRuleObject,
} from "fastest-validator";

const v = new FastestValidator({
  messages: {
    animation: "'{field}' must be one of {expected} not '{actual}'",
  },
});

const checkAnimationInfo = function (
  this: any,
  value: string,
  schema: ValidationSchema,
  path: string,
  parent: any,
  context: {
    meta: {
      // @ts-expect-error
      target: AnimationElement;
    };
  }
): ValidationError[] | void {
  let currentInfo = animationInfo;

  for (const field of ["image", "costume", "animation"] as const) {
    const currentValue =
      field === schema.field ? value : context.meta.target[field];

    if (currentValue === undefined) {
      return;
    } else {
      // @ts-ignore
      if (!currentInfo[currentValue]) {
        if (field === schema.field) {
          return [
            {
              type: "animation",
              field: schema.field,
              expected: "'" + Object.keys(currentInfo).join("', '") + "';",
              actual: value,
            },
          ];
        } else {
          return;
        }
      } else {
        // @ts-ignore
        currentInfo = currentInfo[currentValue];
        if (field === schema.field) {
          return;
        }
      }
    }
  }
};
@validate(
  {
    size: { type: "number", min: 0, optional: true },
    frame: { type: "number", min: 0, optional: true },
    frameRate: { type: "number", min: 1 / 60, optional: true },
    animation: {
      type: "custom",
      field: "animation",
      check: checkAnimationInfo,
    },
    costume: { type: "custom", field: "costume", check: checkAnimationInfo },
    image: { type: "custom", field: "image", check: checkAnimationInfo },
  },
  v
)
export class AnimationElement<Image extends AnimationImages, Costume extends keyof Animations[Image], Animation extends keyof Animations[Image][Costume]> extends AbstractInteractiveElement<"animation"> {
  [REMOVE_TICK]: () => void = () => { };
  [LAST_UPDATE] = 0;
  constructor(
    descriptor: Partial<
      Omit<
        AnimationDescriptor<
          Image,
          Costume,
          Animation
        >,
        "kind"
      >
    >
  ) {
    super("animation", {
      size: 100,
      frame: 0,
      frameRate: 1 / 30,
      ...descriptor,
    });
  };

  [MAKE_COLLIDER]() {
    let cached: SAT.Polygon | null = null

    return () => {
      if (this[NODE_PRIVATE]?.invalid || !cached) {
        // @ts-ignore
        const info = animationInfo[this.image][this.costume][this.animation];
        const sizeRatio = this.size / 100;
        const radians = (this[DESCRIPTOR].angle / 360) * 2 * Math.PI;
        const polygon = new SAT.Polygon(
          new SAT.Vector(this[DESCRIPTOR].x, this[DESCRIPTOR].y),
          [
            new SAT.Vector(
              (-info.frameWidth * sizeRatio) / 2,
              (-info.frameHeight * sizeRatio) / 2
            ),
            new SAT.Vector(info.frameWidth * sizeRatio, 0),
            new SAT.Vector(0, info.frameHeight * sizeRatio),
            new SAT.Vector(-info.frameWidth * sizeRatio, 0),
          ]
        )
        polygon.rotate(radians);

        cached = polygon
      }
      
      return cached
    }
  };

  [MAKE_NODE]() {
    let node: TreeNode

    if (!this[NODE_PRIVATE]) {
      node = {} as TreeNode

      Object.defineProperties(node, {
        collider: {
          get: this[MAKE_COLLIDER]()
        }
      })
    } else {
      node = this[NODE_PRIVATE]
    }
    // @ts-ignore
    const info = animationInfo[this.image][this.costume][this.animation];
    const sizeRatio = this.size / 100;
    const radians = (this[DESCRIPTOR].angle / 360) * 2 * Math.PI;
    let constrainedAngle = Math.abs(radians % Math.PI);
    let nodeWidth: number;
    let nodeHeight: number;

    if (Math.abs(constrainedAngle) < Math.PI / 2) {
      nodeWidth =
        info.frameWidth * sizeRatio * Math.cos(constrainedAngle) +
        info.frameHeight * sizeRatio * Math.sin(constrainedAngle);
      nodeHeight =
        info.frameWidth * sizeRatio * Math.sin(constrainedAngle) +
        info.frameHeight * sizeRatio * Math.cos(constrainedAngle);
    } else {
      const adjustedAngle = constrainedAngle - Math.PI / 2;
      nodeWidth =
        info.frameHeight * sizeRatio * Math.cos(adjustedAngle) +
        info.frameWidth * sizeRatio * Math.sin(adjustedAngle);
      nodeHeight =
        info.frameHeight * sizeRatio * Math.sin(adjustedAngle) +
        info.frameWidth * sizeRatio * Math.cos(adjustedAngle);
    }

    node.minX = this[DESCRIPTOR].x - nodeWidth / 2;
    node.maxX = this[DESCRIPTOR].x + nodeHeight / 2;
    node.minY = this[DESCRIPTOR].y - nodeWidth / 2;
    node.maxY = this[DESCRIPTOR].y + nodeHeight / 2;

    this[NODE_PRIVATE] = node;
  }

  get size() {
    return this[DESCRIPTOR].size;
  }

  @validate({ type: "number", min: 0 })
  set size(value) {
    this[DESCRIPTOR].size = value;
  }

  get frame() {
    return this[DESCRIPTOR].frame;
  }

  @validate({ type: "number", min: 0 })
  set frame(value) {
    this[DESCRIPTOR].frame = value;
  }

  get image() {
    return this[DESCRIPTOR].image;
  }

  @validate({ type: "custom", field: "image", check: checkAnimationInfo }, v)
  set image(value) {
    this[DESCRIPTOR].frame = 0;
    this[DESCRIPTOR].image = value;
  }

  get costume() {
    return this[DESCRIPTOR].costume;
  }

  @validate({ type: "custom", field: "costume", check: checkAnimationInfo }, v)
  set costume(value) {
    this[DESCRIPTOR].frame = 0;
    this[DESCRIPTOR].costume = value;
  }

  get animation() {
    return this[DESCRIPTOR].animation;
  }

  @validate(
    { type: "custom", field: "animation", check: checkAnimationInfo },
    v
  )
  set animation(value) {
    this[DESCRIPTOR].frame = 0;
    this[DESCRIPTOR].animation = value;
  }

  get frameRate() {
    return this[DESCRIPTOR].frameRate;
  }

  @validate({ type: "number", min: 1 / 60 })
  set frameRate(value) {
    this[DESCRIPTOR].frameRate = value;
  }

  get width() {
    return (
      // @ts-ignore
      (animationInfo[this.image][this.costume][this.animation].frameWidth *
        this.size) /
      100
    );
  }

  get height() {
    return (
      // @ts-ignore
      (animationInfo[this.image][this.costume][this.animation].frameHeight *
        this.size) /
      100
    );
  }

  delete() {
    super.delete();

    this[REMOVE_TICK]();
  }
  play(once: boolean = false) {
    this[LAST_UPDATE] = 0;
    this[REMOVE_TICK]();
    this[REMOVE_TICK] = addTick((tick) => {
      const now = performance.now();
      // @ts-ignore
      const info = animationInfo[this.image][this.costume][this.animation];

      if (once === true && this[DESCRIPTOR].frame === info.frames - 1) {
        this[REMOVE_TICK]();
      }
      if (now - this[LAST_UPDATE] >= this[DESCRIPTOR].frameRate * 1000) {
        this[LAST_UPDATE] = now;
        this[DESCRIPTOR].frame = (this[DESCRIPTOR].frame + 1) % info.frames;
      }
    }, 1);
  }

  stop() {
    this[REMOVE_TICK]();
    this[REMOVE_TICK] = () => { };
  }
  
  jsonFn = function Animation() {}
}

declare global {
  interface WorkerGlobalScope {
    Animation: typeof AnimationElement;
  }
}

self.Animation = AnimationElement
