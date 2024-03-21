import React from 'react'
import {useApp, useTick} from '@pixi/react'

export const GameLoop = ({ callTick }: { callTick: (delta: number) => void}) => {
  useTick((delta) => callTick(delta))

  return null
}