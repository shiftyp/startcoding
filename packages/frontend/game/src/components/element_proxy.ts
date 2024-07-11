import { getRegisteredElements, unregisterElement } from "../register";
import { CHILDREN } from "../symbols";
import { ElementConstructor } from "./abstract_element";
import { AbstractInteractiveElement, InteractiveElement, InteractiveElementConstructor } from "./abstract_interactive_element";
import { getRenderingGroup } from "./group";

type ElementProxy<Element extends ElementConstructor> = InstanceType<typeof Proxy<Element>>


export const createElementProxy = <Element extends ElementConstructor>(element: Element): ElementProxy<Element> => {

  const handler: ProxyHandler<Element> = {
    construct: (target, args): Element => {
      const renderingGroup = getRenderingGroup()

      if (renderingGroup) {
        const child = renderingGroup[CHILDREN].unshift()

        if (child) {
          const childElement = getRegisteredElements().get(child)!
          // @ts-ignore
          target.apply(childElement, args)
          
          // @ts-expect-error
          return childElement as Element
        } else {
          // @ts-expect-error
          return new target(...args)
        }
      }

      //@ts-expect-error
      return new target(...args)

    }
  }

  return new Proxy(element, handler)
}