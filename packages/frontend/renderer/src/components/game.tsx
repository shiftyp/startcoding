import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { Backdrop } from './backdrop';
import { Image } from './image';
import { ResponsiveStage } from './responsive-stage';
import { ElementDescriptor, EventDescriptor, GlobalEventProperties, LocalEventProperties } from '@startcoding/types';
import { GameLoop } from './game-loop';
import { Container } from '@pixi/react';

export const Game = ({ setOnChange, callTick, trigger }: {
  setOnChange: (newOnChange: (changes: {
    globalEvents: Array<Exclude<EventDescriptor, LocalEventProperties> | null>,
    elements: Array<ElementDescriptor | null>,
    localEvents: Array<Exclude<EventDescriptor, GlobalEventProperties> | null>[]
  }) => void) => void,
  trigger: (descriptor: EventDescriptor) => void,
  callTick: (delta: number) => void
}) => {
  const [{
    elements,
    //globalEvents,
    localEvents
  }, change] = useState<{
    globalEvents: Array<Exclude<EventDescriptor, LocalEventProperties> | null>,
    elements: Array<ElementDescriptor | null>,
    localEvents: Array<Exclude<EventDescriptor, GlobalEventProperties> | null>[]
  }>({
    globalEvents: [],
    elements: [],
    localEvents: []
  })

  useEffect(() => {
    setOnChange(change as unknown as Parameters<typeof setOnChange>[0])
  })

  return (
    <ResponsiveStage>
      <GameLoop callTick={callTick} />
      <Container interactiveChildren={true}>
        {elements.map((descriptor, index) => {
          if (descriptor?.kind === 'backdrop') {
            return <Backdrop url={descriptor.url} />
          } else if (descriptor?.kind === 'image') {
            return <Image
              url={descriptor.url}
              width={descriptor.width}
              height={descriptor.height}
              x={descriptor.x}
              y={descriptor.y}
              onClick={() => {
                console.log('click')
                trigger({
                  kind: 'click',
                  context: 'local',
                  id: index,
                })
              }}
            />
          }
        })}
      </Container>
    </ResponsiveStage>
  )
}