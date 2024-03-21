import { Sprite } from "pixi.js";
import { PixiComponent } from "@pixi/react";

export const Target = PixiComponent<{
  width: number,
  height: number,
  x: number,
  y: number,
  onClick?: () => void
}, Sprite>('EventTarget', {
  create: (props) => {
    const containerProps = [
      'width',
      'height',
      'x',
      'y'
    ] as const
    const instance = new Sprite()
    containerProps.forEach(prop => {
      instance[prop] = props[prop]
    });
    instance.on('click', props.onClick || (() => { }))
    return instance
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    const containerProps = [
      'width',
      'height',
      'x',
      'y'
    ] as const
    containerProps.forEach(prop => {
      instance[prop] = newProps[prop]
    });
    instance.off('click')
    instance.on('click', () => {
      console.log('clicked')
      newProps.onClick || (() => { })()
    })
  },
  config: {
    // destroy instance on unmount?
    // default true
    destroy: true,

    /// destroy its children on unmount?
    // default true
    destroyChildren: true,
  }
});