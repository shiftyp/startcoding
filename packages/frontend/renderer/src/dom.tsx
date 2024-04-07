import { TextDescriptor, Trigger } from '@startcoding/types'
import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import { DomLayer } from './dom_components/dom_layer'

export const createDOMRenderer = ({
  worker,
  trigger,
  render
}: {
  worker: Worker,
  trigger: Trigger,
  render: (layers: Set<[number, HTMLDivElement]>) => void
}) => {
  const elements: Map<Root, HTMLDivElement> = new Map()

  worker.addEventListener('message', (
    message: MessageEvent<
      [
        action: 'renderDOMSprites',
        value: Array<[index: number, sprites: Array<TextDescriptor>]>
      ]
    >
  ) => {
    const [action] = message.data 

    if (action === 'renderDOMSprites') {
      const [_, layers] = message.data
      const divs = Array.from(elements.values())
      const roots = Array.from(elements.keys())

      if (elements.size < layers.length) {
        for (let i = 0; i < layers.length - elements.size; i++) {
          const element = document.createElement('div')
          elements.set(createRoot(element), element)
        }
      } else if (elements.size > layers.length) {
        for (let i = 1; i < divs.length - layers.length + 1; i++) {
          const element = divs[divs.length - i]
          element.style.visibility = 'hidden'
        }
      }

      let nextRoot = 0
      const renderLayers = new Set<[number, HTMLDivElement]>()

      for (const [index, descriptors] of layers.sort(([aIndex], [bIndex]) => aIndex - bIndex)) {
        divs[nextRoot].style.visibility = 'visible'
        roots[nextRoot].render(<DomLayer descriptors={descriptors} />)
        renderLayers.add([index, divs[nextRoot]])
        nextRoot++
      }

      render(renderLayers)
    }
  })
}