import type { HideMaskConfig, HideMaskTargets } from '@/utils/animations/types'
import { gsap } from 'gsap'
import * as _ from 'lodash'
export function hideMask(
  [maskLayerOuter, maskLayerInner]: HideMaskTargets,
  config: HideMaskConfig,
) {
  const newConfig = _.merge(
    {
      x: '0%',
      y: '0%',
      duration: 1,
      scale: 1.0,
      ease: 'expo.inOut',
      direction: 'down',
    },
    config,
  )
  const tl = gsap.timeline()
  const animatedPosition = {
    maskLayerOuter: {
      x: '0%',
      y: '0%',
      duration: newConfig.duration,
      ease: newConfig.ease,
    },
    maskLayerInner: {
      x: '0%',
      y: '0%',
      duration: newConfig.duration,
      transformOrigin: 'center center',
      scale: newConfig.scale,
      ease: newConfig.ease,
    },
  }

  switch (newConfig.direction) {
    case 'up':
      animatedPosition.maskLayerOuter.y = '101%'
      animatedPosition.maskLayerInner.y = '-101%'
      break
    case 'right':
      animatedPosition.maskLayerOuter.x = '101%'
      animatedPosition.maskLayerInner.x = '-101%'
      break
    case 'left':
      animatedPosition.maskLayerOuter.x = '-101%'
      animatedPosition.maskLayerInner.x = '101%'
      break
    default:
      animatedPosition.maskLayerOuter.y = '-101%'
      animatedPosition.maskLayerInner.y = '101%'
      break
  }

  tl.add([
    gsap.to(maskLayerOuter, animatedPosition.maskLayerOuter),
    gsap.to(maskLayerInner, animatedPosition.maskLayerInner),
  ])
  return tl
}
