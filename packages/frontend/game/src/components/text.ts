import { addTick } from '../loop';
import { TextDescriptor, KIND, TreeNode } from '@startcoding/types';
import { REMOVE_TICK, DESCRIPTOR, MAKE_NODE } from '../symbols';
import { validate } from '../utils';
import { AbstractInteractiveElement } from './abstract_interactive_element';
import SAT from 'sat'

const textCanvas = new OffscreenCanvas(0, 0);
const textContext = textCanvas.getContext("2d")!;

addTick((tick) => {
  textCanvas.height = tick.globals.height;
  textCanvas.width = tick.globals.width;
}, 0)

@validate({
  size: { type: 'number', min: 0, optional: true },
  fontFamily: { type: "string", min: 1, optional: true },
  color: { type: 'string', min: 1, optional: true },
  textAlign: { type: 'string', pattern: /left|right|center/, optional: true },
  text: [
    { type: 'function', optional: true },
    { type: 'string', optional: true}
  ]
})
export class TextElement extends AbstractInteractiveElement<"text"> {
  [REMOVE_TICK] = addTick(() => {
    if (this.textFn) {
      this[DESCRIPTOR].text = this.textFn()
    }
  }, 3)
  textFn: (() => string) | null = null
  constructor(descriptor: Partial<Omit<TextDescriptor, typeof KIND>> | {
    text?: () => string
  }) {
    super('text', {
      size: 10,
      fontFamily: "sans-serif",
      color: "rgb(0,0,0)",
      textAlign: "center",
      ...descriptor,
      text: typeof descriptor.text === 'function' ? descriptor.text() : ''
    })

    this.textFn = typeof descriptor.text === 'function' ? descriptor.text : null
  }

  [MAKE_NODE]() {
    const { x, y, text, size, fontFamily, textAlign } = this[DESCRIPTOR];
    let node: TreeNode = {} as TreeNode;

    textContext.font = size + "px " + fontFamily;
    textContext.textAlign = textAlign;

    const { width } = textContext?.measureText(text);

    node.collider = new SAT.Polygon(new SAT.Vector(x, y), [
      new SAT.Vector(width / 2, -size / 2),
      new SAT.Vector(width / 2, size / 2),
      new SAT.Vector(-width / 2, size / 2),
      new SAT.Vector(-width / 2, -size / 2),
    ]);

    return node;
  };

  @validate([
    { type: 'function' },
    { type: 'string' }
  ])
  set text(value: (() => string) | string) {
    if (typeof value === 'function') {
      this.textFn = value
      this[DESCRIPTOR].text = this.textFn()
    } else {
      this.textFn = null
      this[DESCRIPTOR].text = value
    }
  }

  get text() {
    return this.textFn || this[DESCRIPTOR].text
  }

  get size() {
    return this[DESCRIPTOR].size
  }

  @validate({ type: 'number', min: 0})
  set size(value) {
    this[DESCRIPTOR].size = value
  }

  get color() {
    return this[DESCRIPTOR].color
  }

  @validate({ type: 'string', min: 1 })
  set color(value) {
    this[DESCRIPTOR].color = value
  }

  get fontFamily() {
    return this[DESCRIPTOR].fontFamily
  }

  @validate({ type: 'string', min: 1 })
  set fontFamily(value) {
    this[DESCRIPTOR].fontFamily = value
  }

  get textAlign() {
    return this[DESCRIPTOR].textAlign
  }

  @validate({ type: 'string', pattern: /left|right|center/ })
  set textAlign(value) {
    this[DESCRIPTOR].textAlign = value
  }
};

declare global {
  interface WorkerGlobalScope {
    Text: typeof TextElement
  }
}

self.Text = TextElement
