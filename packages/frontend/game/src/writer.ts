import { Writer } from 'protobufjs'

const opCache: any[] = []
const stateCache: any[] = []

let stateCacheIndex = 0
let opCacheIndex = 0

type Op = {
  fn: (val: any, buf: Uint8Array, pos: number) => void,
  len: number,
  val: any,
  next: Op | undefined
}

const noop = () => { }
const reuseOp = (fn: (val: any, buf: Uint8Array, pos: number) => void, len: number, val: any): Op => {
  let target

  if (opCacheIndex < opCache.length) {
    target = opCache[opCacheIndex++]
  } else {
    target = {}
    opCache.push(target)
    opCacheIndex++
  }

  target.fn = fn
  target.len = len
  target.val = val
  target.next = undefined

  return target
}

const reuseState = (writer: Writer) => {
  let target

  if (stateCacheIndex < stateCache.length) {
    target = stateCache[stateCacheIndex++]
  } else {
    target = {}
    stateCache.push(target)
    stateCacheIndex++
  }

  target.head = writer.head
  target.tail = writer.tail
  target.len = writer.len
  target.next = writer.states

  return target
}

function writeVarint32(val: any, buf: Uint8Array, pos: number) {
  while (val > 127) {
    buf[pos++] = val & 127 | 128;
    val >>>= 7;
  }
  buf[pos] = val;
}

export class MinGCWriter extends Writer {

  static alloc(size: number) {
    return new Uint8Array(size)
  }

  stateInUse: any[] = []

  constructor() {
    super()
  }

  _push(...args: Parameters<typeof reuseOp>) {
    const op = reuseOp(...args)
    // @ts-expect-error
    this.tail = this.tail.next = op
    this.len += args[1];
    return this;
  }

  uint32(value: number) {
    this._push(writeVarint32,
      (value = value >>> 0)
        < 128 ? 1
        : value < 16384 ? 2
          : value < 2097152 ? 3
            : value < 268435456 ? 4
              : 5,
      value)
    return this
  }

  fork() {
    const state = reuseState(this)
    const op = reuseOp(noop, 0, 0)
    this.states = state
    this.head = this.tail = op
    this.len = 0;
    return this;
  }
  reset() {
    if (this.states) {
      // @ts-expect-error
      this.head = this.states.head;
      // @ts-expect-error
      this.tail = this.states.tail;
      // @ts-expect-error
      this.len = this.states.len;
      // @ts-expect-error
      this.states = this.states.next;
    } else {
      const op = reuseOp(noop, 0, 0)
      this.head = this.tail = op;
      this.len = 0;
    }
    return this;
  };
  ldelim() {
    const head = this.head;
    const tail = this.tail;
    const len = this.len;
    this.reset().uint32(len);
    if (len) {
      // @ts-expect-error
      this.tail.next = head.next; // skip noop
      this.tail = tail;
      this.len += len;
    }
    return this;
  };

  finish() {
    // @ts-ignore
    let head = this.head.next; // skip noop
    const buf = MinGCWriter.alloc(this.len);
    let pos = 0;
    while (head) {
      head.fn(head.val, buf, pos);
      pos += head.len;
      head = head.next;
    }
    stateCacheIndex = 0
    opCacheIndex = 0
    // this.head = this.tail = null;
    return buf;
  };
}