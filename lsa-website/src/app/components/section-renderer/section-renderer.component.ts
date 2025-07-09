import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { SectionConfig } from '../../models/app.config.models';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { VerseOfTheDayComponent } from '../verse-of-the-day/verse-of-the-day.component';
import { MapWidgetComponent } from '../map-widget/map-widget.component';
import { FooterComponent } from '../footer/footer.component';
import { ImageCardComponent } from '../image-card/image-card.component';
import { QuickLinksComponent } from '../quick-links/quick-links.component';
import { SearchboxComponent } from '../searchbox/searchbox.component';
import { VideoListComponent } from '../video-list/video-list.component';

@Component({
  selector: 'lsa-section-renderer',
  imports: [
    DescriptionBlockComponent,
    VerseOfTheDayComponent,
    MapWidgetComponent,
    FooterComponent,
    ImageCardComponent,
    QuickLinksComponent,
    SearchboxComponent,
    VideoListComponent
  ],
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
