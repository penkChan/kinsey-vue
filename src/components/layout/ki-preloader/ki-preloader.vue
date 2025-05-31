<template>
  <div
    class="preloader preloader_header-menu-hidden mask-reveal"
    data-arts-theme-text="light"
    data-arts-preloader-logo="secondary"
  >
    <div class="mask-reveal__layer mask-reveal__layer-1">
      <div class="mask-reveal__layer mask-reveal__layer-2">
        <div class="preloader__wrapper">
          <underline-text ref="underlineText">{{ countValueAddZerosFormatted }}</underline-text>
          <!-- <div
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
          </div> -->

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
import UnderlineText from '@/components/underline-text/underline-text.vue'
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
  throwError,
} from 'rxjs'
import { computed, reactive, ref } from 'vue'

const backgroundSizeHeight: string | undefined = undefined
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
const underlineText = ref<InstanceType<typeof UnderlineText>>()

const finishedSubject$ = new Subject<undefined>()

rxjsComponent.mountedSubject$
  .pipe(
    first(),
    tap(() => globalEventStore.artsPreloaderStartSubject$.next(undefined)),
    switchMap(() => {
      if (underlineText.value === undefined) {
        return throwError(() => new Error('underlineText.value is undefined'))
      }
      return merge(
        new Observable((observer) => {
          if (content.value === undefined) {
            observer.error(new Error('content.value is undefined'))
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
                observer.next(undefined)
                observer.complete()
              },
            },
          )
          return () => tween.kill()
        }),
        new Observable((observer) => {
          const tween = gsap.to(count, {
            val: 100,
            duration: 20,
            ease: 'power3.out',
            onComplete: () => {
              observer.next(undefined)
              observer.complete()
            },
          })
          return () => tween.kill()
        }),
        underlineText.value.start(),
      )
    }),
    catchError((error) => {
      console.error(error)
      return of(undefined)
    }),
    takeUntil(merge(rxjsComponent.beforeUnmountSubject$, finishedSubject$)),
  )
  .subscribe({
    error: (error) => console.error(error),
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
          if (content.value === undefined) {
            observer.error(new Error('content.value is undefined'))
            return
          }
          const tween = gsap.to(content.value, {
            y: 0,
            autoAlpha: 1,
            ease: 'power3.out',
            duration: 0.3,
            overwrite: true,
            onComplete: () => {
              observer.next(undefined)
              observer.complete()
            },
          })
          return () => tween.kill()
        }),
    ),
    switchMap(() => {
      if (underlineText.value === undefined) {
        return throwError(() => new Error('underlineText.value is undefined'))
      }
      return merge(
        new Observable((observer) => {
          const tween = gsap.to(count, {
            val: 100,
            duration: 2.4 / globalVariables.animations.timeScale.preloader,
            ease: 'expo.inOut',
            onComplete: () => {
              observer.complete()
            },
          })
          return () => tween.kill()
        }),
        underlineText.value.finish(),
      )
    }),
    takeUntil(rxjsComponent.beforeUnmountSubject$),
  )
  .subscribe({
    error: (error) => console.error(error),
    complete: () => {},
  })

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
    // @include mixins.fluid-type(96, 212);
    font-family: var(--font-primary);
    font-weight: 100;
    line-height: 1;
    letter-spacing: -10px;
    white-space: nowrap;
  }
  .backgrond-underline {
    width: 100px;
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
  .underline-text {
    font-size: 150px;
    width: 350px;
    align-self: flex-end;
  }
}
</style>
