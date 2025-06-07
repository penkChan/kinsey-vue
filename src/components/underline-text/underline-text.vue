<template>
  <div :class="['underline-text', 'mr-auto', 'mt-auto']">
    <slot> </slot>
    <svg
      viewBox="0 0 1024 6"
      xmlns="http://www.w3.org/2000/svg"
      class="underline-text__underline no-vw"
      :style="{
        'min-height': localUnderlineMinHeight,
      }"
    >
      <rect ref="underlineRect" x="0" y="0" width="0" height="6" rx="3" ry="3" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { addUnit } from '@/utils/formatter'
import './underline-text.scss'
import { computed, withDefaults, ref } from 'vue'

import { useGlobalVariables } from '@/stores/global-variables'
import { gsap } from 'gsap'

const globalVariables = useGlobalVariables()

const props = withDefaults(
  defineProps<{
    underlineMinHeight?: string
  }>(),
  {
    underlineMinHeight: '2px',
  },
)

const localUnderlineMinHeight = computed(() => addUnit(props.underlineMinHeight))
const underlineRect = ref<SVGRectElement>()

function start() {
  if (underlineRect.value === undefined) {
    throw new Error('underlineRect.value is undefined')
  }
  return gsap
    .timeline()
    .fromTo(
      underlineRect.value,
      {
        autoAlpha: 0,
      },
      {
        duration: 0.3,
        autoAlpha: 1,
        y: 0,
        ease: 'power3.out',
      },
      '0',
    )
    .to(underlineRect.value, {
      attr: {
        width: 1024,
      },
      duration: 20,
      ease: 'power3.out',
    })
    .to(underlineRect.value, {
      attr: {
        x: 1024,
        width: 0,
      },
      duration: 2.4 / globalVariables.animations.timeScale.preloader,
      ease: 'expo.inOut',
    })
}

function finish() {
  if (underlineRect.value === undefined) {
    throw new Error('underlineRect.value is undefined')
  }
  return gsap
    .timeline()
    .to(underlineRect.value, {
      attr: {
        width: 1024,
      },
      duration: 2.4 / globalVariables.animations.timeScale.preloader,
      ease: 'expo.inOut',
    })
    .to(underlineRect.value, {
      attr: {
        x: 1024,
        width: 0,
      },
      duration: 1.2 / globalVariables.animations.timeScale.preloader,
      ease: 'expo.inOut',
    })
}

defineExpose({
  start,
  finish,
})
</script>

<style lang="scss" scoped>
.underline-text {
  position: relative;
  font-family: var(--font-primary);
  font-weight: 100;
  line-height: 1.2;
  letter-spacing: -10px;
  white-space: nowrap;
  &__underline {
    width: 100%;
    height: 6px;
    position: absolute;
    left: 0;
    bottom: 0;
    svg {
      fill: none;
      stroke: none;
    }
    rect {
      stroke: none;
      fill: currentColor;
      shape-rendering: geometricPrecision;
    }
  }
}
</style>
