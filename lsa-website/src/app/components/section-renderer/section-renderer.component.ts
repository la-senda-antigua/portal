import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SectionConfig } from '../../models/app.config.models';
import { DescriptionBlockComponent } from '../description-block/description-block.component';

@Component({
  selector: 'lsa-section-renderer',
  imports: [DescriptionBlockComponent],
  templateUrl: './section-renderer.component.html',
  styleUrl: './section-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionRendererComponent {
  readonly sectionConfig = input.required<SectionConfig>();
  readonly title = computed(() => this.sectionConfig().title);
  readonly backgroundColor = computed(
    () => this.sectionConfig().backgroundColor ?? 'var(--mat-sys-background)'
  );
  readonly textColor = computed(
    () => this.sectionConfig().textColor ?? 'var(--mat-sys-on-background)'
  );
  readonly textAlign = computed(() => this.sectionConfig().textAlign ?? 'left');
}
