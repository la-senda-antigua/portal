import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
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
  readonly loadedSuccessfully = signal<boolean>(false);
  cardHovered = false;
  
}
