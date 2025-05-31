import { debounceTime, type Observable, Subscription } from 'rxjs'

export class MobileBarHeight<AllResizeEvent> {
  vh: number = 0
  static resizeSubscription: Subscription | undefined = undefined

  constructor(mergedAllResizeEventSubject$: Observable<AllResizeEvent>) {
    if (MobileBarHeight.resizeSubscription === undefined) {
      this.setVh()
      MobileBarHeight.resizeSubscription = mergedAllResizeEventSubject$
        .pipe(debounceTime(250))
        .subscribe({
          next: () => {
            this.setVh()
          },
        })
    }
  }
  private setVh() {
    this.vh = document.documentElement.clientHeight * 0.01
    document.documentElement.style.setProperty('--fix-bar-vh', `${this.vh}px`)
  }
}
