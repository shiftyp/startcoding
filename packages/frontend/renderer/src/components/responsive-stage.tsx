import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Stage, useApp, useTick } from '@pixi/react'

export const StageContext = React.createContext({
  width: 0,
  height: 0
})

export const ResponsiveStage = ({ children }: React.PropsWithChildren) => {

  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  })

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const callback = () => {
      try {
        if (containerRef.current) {
          const { offsetHeight, offsetWidth } = containerRef.current
          if (dimensions.width !== offsetWidth || dimensions.height !== offsetHeight) {

            setDimensions({
              width: offsetWidth,
              height: offsetHeight
            })

          }
        }
      } catch (e) {
        // do nothing
      }
      frame = window.requestAnimationFrame(callback)
    }

    let frame = window.requestAnimationFrame(callback)

    return () => window.cancelAnimationFrame(frame)
  })
  return (
    <div
      style={{
        position: 'relative',
        width: "100%",
        height: '100%'
      }}
      ref={containerRef}
    >
      <Stage {...dimensions} >
        <StageContext.Provider
          value={dimensions}
        >
          {children}
        </StageContext.Provider>
      </Stage>
    </div>
  )
}