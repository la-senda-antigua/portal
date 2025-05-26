import { Component, input } from '@angular/core';
import { ImageCardConfig } from 'src/app/models/app.config.models';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lsa-image-card',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss'
})
export class ImageCardComponent {
  readonly config = input.required<ImageCardConfig>();
}
