import { TextDescriptor } from '@startcoding/types'
import React from 'react'

export const DomLayer = ({ descriptors}: { descriptors: Array<TextDescriptor>}) => {
  return (
    <>
      {descriptors.map((descriptor, index) => {
        return descriptor.hidden ? null : <div tabIndex={index}>{descriptor.text}</div>
      })}
    </>
  )
}