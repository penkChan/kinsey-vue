import { ReplaySubject, Subject } from 'rxjs'
import { onBeforeUnmount, onMounted } from 'vue'

export function useRxjsComponent() {
  const mountedSubject$ = new ReplaySubject<undefined>(1)
  const beforeUnmountSubject$ = new Subject<undefined>()

  onMounted(() => {
    mountedSubject$.next(undefined)
  })

  onBeforeUnmount(() => {
    beforeUnmountSubject$.next(undefined)
  })

  return {
    mountedSubject$,
    beforeUnmountSubject$,
  }
}
