import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'lsa-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent { 
  readonly autoRotateMs = input<number | undefined>(undefined);
  readonly loop = input<boolean>(true);

  readonly projectedSlides = contentChildren(TemplateRef);
  readonly activeIndex = signal(0);

  readonly hasSlides = computed(() => this.projectedSlides().length > 0);
  readonly hasMultipleSlides = computed(() => this.projectedSlides().length > 1);
  readonly trackTransform = computed(
    () => `translateX(-${this.activeIndex() * 100}%)`
  );

  constructor() {
    effect(() => {
      const maxIndex = this.projectedSlides().length - 1;
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
      if (!rotateEveryMs || rotateEveryMs <= 0 || !this.hasMultipleSlides()) {
        return;
      }

      const intervalId = window.setInterval(() => {
        this.next();
      }, rotateEveryMs);

      onCleanup(() => {
        window.clearInterval(intervalId);
      });
    });
  }

  previous() {
    const current = this.activeIndex();
    if (current === 0) {
      if (this.loop()) {
        this.activeIndex.set(this.projectedSlides().length - 1);
      }
      return;
    }
    this.activeIndex.set(current - 1);
  }

  next() {
    const current = this.activeIndex();
    const lastIndex = this.projectedSlides().length - 1;
    if (current >= lastIndex) {
      if (this.loop()) {
        this.activeIndex.set(0);
      }
      return;
    }
    this.activeIndex.set(current + 1);
  }

  goTo(index: number) {
    if (index < 0 || index > this.projectedSlides().length - 1) {
      return;
    }
    this.activeIndex.set(index);
  }
}
