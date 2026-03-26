import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import {
  BackgroundImageWithFloatingTextConfig,
} from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-background-image-with-floating-text',
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './background-image-with-floating-text.component.html',
  styleUrl: './background-image-with-floating-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundImageWithFloatingTextComponent {
  readonly config = input.required<BackgroundImageWithFloatingTextConfig>();

  readonly title = computed(() => this.config().title);

  readonly backgroundColor = computed(
    () => this.config().backgroundColor ?? undefined,
  );

  readonly backgroundImage = computed(
    () => this.config().backgroundImage ?? undefined,
  );

  readonly backgroundPosition = computed(
    () => this.config().backgroundPosition,
  );

  readonly description = computed(() => {
    return this.config().floatingDescription?.descriptionBlock;
  });

  readonly textColor = computed(
    () =>
      this.config().floatingDescription?.descriptionBlock?.textColor ??
      undefined,
  );

  readonly textPosition = computed(() => {
    const position = this.config().floatingDescription?.position;
    if (position === 'right') {
      return 'right: 0; text-align: right';
    }
    if (position === 'center') {
      return 'right: 0; left: 0; top: 90px; max-height: 300px; margin: auto';
    }
    return 'position: left';
  });

  readonly overlayColor = computed(() => {
    if (!this.backgroundImage() || !this.backgroundColor()) {
      return undefined;
    }
    return `background-image: radial-gradient(rgba(56,56,56,0.4), ${this.backgroundColor()})`;
  });

  getStyleForQuoteRef(text: string) {
    if (text.includes('REF')) {
      const position = this.config().floatingDescription?.position;
      if (position === 'right') {
        return { 'text-align': 'left' };
      }
      return { 'text-align': 'right' };
    }
    return {};
  }
}
