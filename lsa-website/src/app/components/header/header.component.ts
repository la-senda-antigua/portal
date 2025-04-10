import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SectionConfig } from 'src/app/models/app.config.models';

@Component({
  selector: 'lsa-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly headerConfig = input.required<SectionConfig>();

  readonly title = computed(() => this.headerConfig().title);

  readonly backgroundColor = computed(
    () => this.headerConfig().backgroundColor ?? undefined
  );

  readonly backgroundImage = computed(
    () => this.headerConfig().backgroundImage ?? undefined
  );

  readonly description = computed(() => {
    const lines: string[] = [];
    const block = this.headerConfig().floatingDescription?.descriptionBlock;
    if (block) {
      for (const [key, value] of Object.entries(block)) {
        if (key.includes('line') && value) {
          lines.push(value);
        }
      }
    }
    return lines;
  });

  readonly textColor = computed(
    () =>
      this.headerConfig().floatingDescription?.descriptionBlock?.textColor ??
      undefined
  );

  readonly textPosition = computed(() => {
    const position = this.headerConfig().floatingDescription?.position;
    if (position === 'right') {
      return 'right: 0; text-align: right';
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
      const position = this.headerConfig().floatingDescription?.position;
      if (position === 'right') {
        return { 'text-align': 'left' };
      }
      return { 'text-align': 'right' };
    }
    return {};
  }
}
