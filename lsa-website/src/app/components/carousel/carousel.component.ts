import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'lsa-carousel',
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent { 
  readonly autoRotateMs = input<number | undefined>(undefined);
  readonly loop = input<boolean>(true);
  readonly slideCount = input<number | undefined>(undefined);
  readonly transitionMs = input<number>(900);

  readonly activeIndex = signal(0);
  readonly autoRotateRestartKey = signal(0);
  readonly isTransitioning = signal(false);

  private transitionTimeoutId: number | undefined;
  private readonly destroyRef = inject(DestroyRef);

  readonly totalSlides = computed(() => this.slideCount() ?? 0);

  readonly slideIndexes = computed(() =>
    Array.from({ length: this.totalSlides() }, (_, index) => index)
  );
  readonly hasSlides = computed(() => this.totalSlides() > 0);
  readonly hasMultipleSlides = computed(() => this.totalSlides() > 1);
  readonly trackTransform = computed(
    () => `translateX(-${this.activeIndex() * 100}%)`
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.transitionTimeoutId !== undefined) {
        window.clearTimeout(this.transitionTimeoutId);
      }
    });

    effect(() => {
      const maxIndex = this.totalSlides() - 1;
      if (maxIndex < 0) {
        this.activeIndex.set(0);
        return;
      }
      if (this.activeIndex() > maxIndex) {
        this.activeIndex.set(maxIndex);
      }
    });

    effect((onCleanup) => {
      const rotateEveryMs = this.autoRotateMs();
      this.autoRotateRestartKey();
      if (!rotateEveryMs || rotateEveryMs <= 0 || !this.hasMultipleSlides()) {
        return;
      }

      const intervalId = window.setInterval(() => {
        this.next('auto');
      }, rotateEveryMs);

      onCleanup(() => {
        window.clearInterval(intervalId);
      });
    });
  }

  previous(source: 'user' | 'auto' = 'user') {
    const current = this.activeIndex();
    if (current === 0) {
      if (this.loop()) {
        this.setActiveIndex(this.totalSlides() - 1, source);
      }
      return;
    }
    this.setActiveIndex(current - 1, source);
  }

  next(source: 'user' | 'auto' = 'user') {
    const current = this.activeIndex();
    const lastIndex = this.totalSlides() - 1;
    if (current >= lastIndex) {
      if (this.loop()) {
        this.setActiveIndex(0, source);
      }
      return;
    }
    this.setActiveIndex(current + 1, source);
  }

  goTo(index: number, source: 'user' | 'auto' = 'user') {
    if (index < 0 || index > this.totalSlides() - 1) {
      return;
    }
    this.setActiveIndex(index, source);
  }

  private setActiveIndex(index: number, source: 'user' | 'auto') {
    if (this.activeIndex() === index) {
      return;
    }

    this.beginTransition();
    this.activeIndex.set(index);

    if (source === 'user') {
      this.autoRotateRestartKey.update((value) => value + 1);
    }
  }

  private beginTransition() {
    this.isTransitioning.set(true);

    if (this.transitionTimeoutId !== undefined) {
      window.clearTimeout(this.transitionTimeoutId);
    }

    this.transitionTimeoutId = window.setTimeout(() => {
      this.isTransitioning.set(false);
      this.transitionTimeoutId = undefined;
    }, this.transitionMs());
  }
}
