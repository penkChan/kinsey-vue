<template>
  <div :class="['underline-text', 'mr-auto', 'mt-auto']">
    <slot> </slot>
    <svg
      viewBox="0 0 1023 9"
      xmlns="http://www.w3.org/2000/svg"
      class="underline-text__underline no-vw"
      :style="{
        'min-height': localUnderlineMinHeight,
      }"
    >
      <rect ref="underlineRect" x="0" width="0" height="9" rx="5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { addUnit } from '@/utils/formatter'
import './underline-text.scss'
import { computed, withDefaults, ref } from 'vue'
import {
  merge,
  Observable,
  Subject,
  exhaustMap,
  takeUntil,
  first,
  BehaviorSubject,
  tap,
  filter,
} from 'rxjs'
import { useRxjsComponent } from '@/composables/useRxjsComponent'
import { useGlobalVariables } from '@/stores/global-variables'
import { gsap } from 'gsap'

const rxjsComponent = useRxjsComponent()
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

const startSubject$ = new BehaviorSubject<boolean>(false)
const finishSubject$ = new Subject<undefined>()

function start() {
  return rxjsComponent.mountedSubject$.pipe(
    first(),
    tap(() => startSubject$.next(true)),
    exhaustMap(
      () =>
        new Observable((observer) => {
          if (underlineRect.value === undefined) {
            observer.error(new Error('underlineRect.value is undefined'))
            return
          }
          const tween = gsap
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
              onComplete: () => {
                observer.next(undefined)
                observer.complete()
              },
            })
          return () => tween.kill()
        }),
    ),
    takeUntil(
      merge(rxjsComponent.beforeUnmountSubject$, finishSubject$).pipe(
        tap(() => startSubject$.next(false)),
      ),
    ),
  )
}

function finish() {
  finishSubject$.next(undefined)
  return startSubject$.pipe(
    first(),
    filter((start) => start),
    exhaustMap(
      () =>
        new Observable((observer) => {
          if (underlineRect.value === undefined) {
            observer.error(new Error('underlineRect.value is undefined'))
            return
          }
          const tween = gsap
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
              onComplete: () => {
                observer.next(undefined)
                observer.complete()
              },
            })
          return () => tween.kill()
        }),
    ),
    takeUntil(merge(rxjsComponent.beforeUnmountSubject$)),
  )
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
    height: 5px;
    position: absolute;
    left: 0;
    bottom: 0;
    rect {
      stroke: none;
      fill: currentColor;
    }
  }
}
</style>
