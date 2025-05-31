import { Subject } from 'rxjs'
import { onBeforeUnmount, onMounted } from 'vue'

export function useRxjsComponent() {
  const mountedSubject$ = new Subject<undefined>()
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
