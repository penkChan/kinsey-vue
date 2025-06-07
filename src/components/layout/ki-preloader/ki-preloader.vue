<template>
  <div v-show="visiblePreLoader" class="preloader">
    <div ref="maskLayerOuter" class="mask-reveal__layer mask-reveal__layer-outer">
      <div ref="maskLayerInner" class="mask-reveal__layer mask-reveal__layer-inner">
        <div class="preloader__wrapper">
          <underline-text ref="underlineText">{{ countValueAddZerosFormatted }}</underline-text>

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
  tap,
  catchError,
  of,
  Subject,
  combineLatest,
  throwError,
} from 'rxjs'
import { computed, reactive, ref } from 'vue'
import { hideMask } from '@/utils/animations/mask'

const count = reactive({
  width: 'auto',
  val: 0,
})
const visiblePreLoader = ref(true)
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
const maskLayerOuter = ref<HTMLDivElement>()
const maskLayerInner = ref<HTMLDivElement>()

const finishedSubject$ = new Subject<undefined>()
const preloadTl = gsap.timeline()

rxjsComponent.mountedSubject$
  .pipe(
    first(),
    tap(() => globalEventStore.artsPreloaderStartSubject$.next(undefined)),
    switchMap(() => {
      if (underlineText.value === undefined) {
        return throwError(() => new Error('underlineText.value is undefined'))
      }
      return new Observable((observer) => {
        if (content.value === undefined) {
          observer.error(new Error('content.value is undefined'))
          return
        }
        if (underlineText.value === undefined) {
          observer.error(new Error('underlineText.value is undefined'))
          return
        }
        preloadTl
          .add([
            gsap.fromTo(
              content.value,
              {
                autoAlpha: 0,
              },
              {
                y: 0,
                duration: 0.3,
                autoAlpha: 1,
                ease: 'power3.out',
              },
            ),
            gsap.to(count, {
              val: 100,
              duration: 20,
              ease: 'power3.out',
            }),
            underlineText.value.start(),
          ])
          .add(() => {
            observer.next(undefined)
            observer.complete()
          })
      })
    }),
    catchError((error) => {
      console.error(error)
      return of(undefined)
    }),
    takeUntil(rxjsComponent.beforeUnmountSubject$),
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
    tap(() => preloadTl.clear()),
    switchMap(
      () =>
        new Observable((observer) => {
          if (content.value === undefined) {
            observer.error(new Error('content.value is undefined'))
            return
          }
          if (underlineText.value === undefined) {
            observer.error(new Error('underlineText.value is undefined'))
            return
          }
          if (maskLayerOuter.value === undefined) {
            observer.error(new Error('maskLayerOuter.value is undefined'))
            return
          }
          if (maskLayerInner.value === undefined) {
            observer.error(new Error('maskLayerInner.value is undefined'))
            return
          }
          preloadTl
            .to(content.value, {
              y: 0,
              autoAlpha: 1,
              ease: 'power3.out',
              duration: 0.3,
              overwrite: true,
            })
            .add([
              gsap.to(count, {
                val: 100,
                duration: 2.4 / globalVariables.animations.timeScale.preloader,
                ease: 'expo.inOut',
              }),
              underlineText.value.finish(),
            ])
            .add(
              [
                hideMask([maskLayerOuter.value, maskLayerInner.value], {
                  duration: 1,
                }),
                gsap.to(underlineText.value!.$el!, {
                  y: -50,
                  autoAlpha: 0,
                  duration: 0.3,
                }),
                gsap.to(content.value!, {
                  y: -50,
                  autoAlpha: 0,
                  duration: 0.3,
                  delay: 0.1,
                }),
              ],
              '-=0.3',
            )
            .add(() => {
              visiblePreLoader.value = false
            })
            .add(() => {
              globalEventStore.artsPreloaderEndSubject$.next(undefined)
            }, '-=0.3')
            .add(() => {
              observer.next(undefined)
              observer.complete()
            })

          return () => preloadTl.clear()
        }),
    ),
    takeUntil(rxjsComponent.beforeUnmountSubject$),
  )
  .subscribe({
    error: (error) => console.error(error),
    complete: () => {},
  })

rxjsComponent.beforeUnmountSubject$.pipe(first()).subscribe({
  next: () => {
    preloadTl.kill()
  },
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
  .mask-reveal__layer-outer {
    background-color: var(--color-dark-1);
  }
  .mask-reveal__layer {
    display: block;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  &__wrapper {
    display: flex;
    flex-wrap: wrap;
    position: fixed;
    justify-content: space-between;
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
  &__content {
    align-self: flex-end;
    font-size: 30px;
  }
  .underline-text {
    font-size: 150px;
    width: 350px;
    align-self: flex-end;
  }
}
</style>
