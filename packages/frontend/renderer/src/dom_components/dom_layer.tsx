import { BackdropDescriptor, TextDescriptor } from '@startcoding/types'
import React from 'react'

export const DomLayer = ({ descriptors}: { descriptors: Array<TextDescriptor | BackdropDescriptor>}) => {
  return (
    <>
      {descriptors.map((descriptor, index) => {
        if (descriptor.kind ===  'backdrop') {
          return <div tabIndex={-1} style={{
            backgroundImage: `url(${descriptor.url})`,
            backgroundSize: descriptor.style,
            backgroundRepeat: descriptor.repeat,
            width: '100%',
            height: '100%',
            left: '100%',
          }}></div>
        }
        return descriptor.hidden ? null : <div tabIndex={index}>{descriptor.text}</div>
      })}
    </>
  )
}