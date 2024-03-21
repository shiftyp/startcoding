import React, { useEffect, useRef } from 'react'
import { Sprite } from '@pixi/react'
import { Sprite as PixiSprite, Rectangle } from 'pixi.js'

export const Image = ({
  url,
  width,
  height,
  x,
  y,
  onClick
}: {
  url: string,
  width: number,
  height: number,
  x: number,
  y: number,
  onClick: () => void
}) => {
  return (
    <Sprite image={url} width={width} height={height} x={x} y={y} eventMode="dynamic" click={onClick} />
  )
}