import { defineStore } from 'pinia'
import { merge, Subject } from 'rxjs'

export const useGlobalEventsStore = defineStore('globalEvents', () => {
  const artsPreloaderStartSubject$ = new Subject<undefined>()
  const artsPreloaderEndSubject$ = new Subject<undefined>()

  const resizeSubject$ = new Subject<undefined | UIEvent>()
  const orientationchangeSubject$ = new Subject<undefined | Event>()
  const mergedAllResizeEventSubject$ = merge(resizeSubject$, orientationchangeSubject$)
  window.addEventListener('resize', (event) => {
    resizeSubject$.next(event)
  })
  if ('orientationchange' in window) {
    window.addEventListener('orientationchange', (event) => {
      orientationchangeSubject$.next(event)
    })
  }

  return {
    artsPreloaderStartSubject$,
    resizeSubject$,
    orientationchangeSubject$,
    mergedAllResizeEventSubject$,
    artsPreloaderEndSubject$,
  }
})
