import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { VideoModel } from 'src/app/models/video.model';

@Component({
  selector: 'lsa-video-card',
  imports: [MatCardModule, CommonModule],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  readonly video = input.required<VideoModel>();
  readonly emitClick = input<boolean>(false);
  readonly loadedSuccessfully = signal<boolean>(false);
  readonly outlined = input<boolean>(false);
  readonly videoClick = output<VideoModel>();
  cardHovered = false;

  openVideo() {
    if (this.video().videoUrl && !this.emitClick()) {
      window.open(this.video().videoUrl, '_blank');
    }
    if (this.emitClick()) {
      this.videoClick.emit(this.video());
    }
  }
}
