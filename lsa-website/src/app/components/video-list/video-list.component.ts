import { Component, computed, input } from '@angular/core';
import { VideoListConfig } from 'src/app/models/app.config.models';
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { MatButtonModule } from '@angular/material/button';
import { SearchboxComponent } from '../searchbox/searchbox.component';

@Component({
  selector: 'lsa-video-list',
  imports: [DescriptionBlockComponent, MatButtonModule, SearchboxComponent],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent {
  readonly config = input.required<VideoListConfig>();
  readonly button = computed(() => this.config().button);
  readonly searchBox = computed(() => this.config().searchBox);
  readonly descriptionBlock = computed(() => this.config().descriptionBlock);
}
