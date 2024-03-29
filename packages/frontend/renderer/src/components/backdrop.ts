import { BackdropDescriptor, StageContext, Tick } from '@startcoding/types'
import { Assets, Sprite } from 'pixi.js'

export const BackdropSprite = () => {
  let sprite: Sprite

  return {
    update: async (changes: Partial<BackdropDescriptor>) => {
      if (changes.url != undefined) {
        const texture = await Assets.load(changes.url)
        sprite = new Sprite(texture)
      }

      return {
        tick: (_: Tick, stageContext: StageContext) => {
          sprite.height = stageContext.height
          sprite.width = stageContext.width
        },
        destroy: () => {
          sprite.destroy()
        },
        element: sprite,
      }
    },
  }
}
