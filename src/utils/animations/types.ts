export type HideMaskTargets = [maskLayerOuter: HTMLElement, maskLayerInner: HTMLElement]

export interface HideMaskConfig {
  x?: string
  y?: string
  duration?: number
  scale?: number
  ease?: string
  direction?: 'up' | 'right' | 'left' | 'down'
}
