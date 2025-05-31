<template>
  <div
    class="preloader preloader_header-menu-hidden mask-reveal"
    data-arts-theme-text="light"
    data-arts-preloader-logo="secondary"
  >
    <div class="mask-reveal__layer mask-reveal__layer-1">
      <div class="mask-reveal__layer mask-reveal__layer-2">
        <div class="preloader__wrapper">
          <div
            ref="counter"
            :class="[
              'preloader__counter',
              {
                preloader__counter_started: preloaderCounterStarted,
              },
              'mr-auto',
              'mt-auto',
              'backgrond-underline',
            ]"
          >
            {{ countValueAddZerosFormatted }}
          </div>
          <div ref="content" class="preloader__content ml-auto mt-auto">
            <div class="h6">Loading</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRxjsComponent } from '@/composables/useRxjsComponent'
import { useGlobalEventsStore } from '@/stores/global-events'
import { useGlobalVariables } from '@/stores/global-variables'
import { addZeros } from '@/utils/formatter'
import { gsap } from 'gsap'
import * as mathjs from 'mathjs'
import {
  switchMap,
  first,
  Observable,
  takeUntil,
  merge,
  tap,
  catchError,
  of,
  Subject,
  combineLatest,
} from 'rxjs'
import { computed, reactive, ref } from 'vue'

const tl = gsap.timeline()
let backgroundSizeHeight: string | undefined = undefined
const count = reactive({
  width: 'auto',
  val: 0,
})

const preloaderCounterStarted = ref(true)

/**
 * 将count.val转为保留整数并添加% 如果count.val是一位数, 则在前面补一个0
 * @example 0 => 00%
 * @example 1 => 01%
 * @example 12 => 12%
 * @example 100 => 100%
 */
const countValueAddZerosFormatted = computed(() => `${addZeros(mathjs.round(count.val, 0), 2)}%`)

const rxjsComponent = useRxjsComponent()
const globalEventStore = useGlobalEventsStore()
const globalVariables = useGlobalVariables()
const content = ref<HTMLDivElement>()
const counter = ref<HTMLDivElement>()

const finishedSubject$ = new Subject<undefined>()

rxjsComponent.mountedSubject$
  .pipe(
    first(),
    tap(() => globalEventStore.artsPreloaderStartSubject$.next(undefined)),
    switchMap(() =>
      merge(
        new Observable((subscriber) => {
          if (content.value === undefined) {
            subscriber.error(new Error('content.value is undefined'))
            return
          }
          const tween = gsap.fromTo(
            content.value,
            {
              autoAlpha: 0,
            },
            {
              y: 0,
              duration: 0.3,
              autoAlpha: 1,
              ease: 'power3.out',
              onComplete: () => {
                subscriber.complete()
              },
            },
          )
          return () => tween.kill()
        }),
        new Observable((subscriber) => {
          if (counter.value === undefined) {
            subscriber.error(new Error('counter.value is undefined'))
            return
          }
          backgroundSizeHeight = window.getComputedStyle(counter.value).backgroundSize.split(' ')[1]
          const tween = tl
            .fromTo(
              counter.value,
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
            .to(count, {
              val: 100,
              duration: 20,
              ease: 'power3.out',
              onComplete: () => {
                subscriber.complete()
              },
            })
          return () => tween.kill()
        }),
      ),
    ),
    catchError((error) => {
      console.error(error)
      return of(undefined)
    }),
    takeUntil(rxjsComponent.beforeUnmountSubject$),
  )
  .subscribe({
    error: (error) => console.log(error),
    complete: () => {},
  })

combineLatest({
  mounted: rxjsComponent.mountedSubject$.pipe(first()),
  finished: finishedSubject$.pipe(first()),
})
  .pipe(
    switchMap(
      () =>
        new Observable((observer) => {
          const timeScale = globalVariables.animations.timeScale.preloader
          if (counter.value === undefined) {
            observer.next(new Error('counter 不能为空'))
            return
          }
          tl.clear()
            .add([
              gsap.to(count, {
                y: 0,
                autoAlpha: 1,
                ease: 'power3.out',
                duration: 0.3,
                overwrite: true,
              }),
            ])
            .add([
              gsap.to(counter.value, {
                onStart: () => {
                  preloaderCounterStarted.value = false
                },
                backgroundSize: `100% ${backgroundSizeHeight}`,
                duration: 2.4 / timeScale,
                ease: 'expo.inOut',
              }),
              gsap.to(count, {
                val: 100,
                duration: 2.4 / timeScale,
                ease: 'expo.inOut',
              }),
            ])
            .set(counter.value, {
              backgroundPosition: '100% 100%',
            })
            .to(counter.value, {
              backgroundSize: `0% ${backgroundSizeHeight}`,
              duration: 1.2,
              ease: 'expo.inOut',
            })
        }),
    ),
    takeUntil(rxjsComponent.beforeUnmountSubject$),
  )
  .subscribe()

function finished() {
  finishedSubject$.next(undefined)
}

defineExpose({
  finished,
})
</script>

<style lang="scss" scoped>
@use '@/styles/mixins.scss' as mixins;

.preloader {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 400;
  overflow: hidden;
  color: var(--color-gray-2);
  .mask-reveal__layer-1 {
    background-color: var(--color-dark-1);
  }
  &__wrapper {
    display: flex;
    flex-wrap: wrap;
    position: fixed;
    top: var(--gutter-vertical);
    left: var(--gutter-horizontal);
    right: var(--gutter-horizontal);
    bottom: calc(var(--fix-bar-vh) + var(--gutter-vertical));
  }
  &__counter {
    font-family: var(--font-primary);
    font-weight: 100;
    line-height: 1;
    @include mixins.fluid-type(96, 212);
    letter-spacing: -10px; // opacity: 0
    white-space: nowrap;
  }
  .backgrond-underline {
    width: 340px;
    &.preloader__counter {
      &_started {
        animation-name: loading;
        animation-duration: 20s;
        transition: background-size 1.2s ease;
      }
      &_paused {
        animation-play-state: paused;
      }
      &_ended {
        animation-duration: 1s;
      }
    }

    @keyframes loading {
      0% {
        background-size: 0% 2px;
      }
      100% {
        background-size: 100% 2px;
      }
    }
  }
}
</style>
