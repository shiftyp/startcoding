import React, { useContext, useRef, useState } from 'react'
import { Sprite, useTick, useApp } from '@pixi/react';
import { StageContext } from './responsive-stage';

export const Backdrop = ({ url }: { url: string }) => {

  const stageDimensions = useContext(StageContext)

  return (
    <Sprite image={url} {...stageDimensions} />
  )
}