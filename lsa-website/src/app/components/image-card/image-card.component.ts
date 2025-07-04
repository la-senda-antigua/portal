import { Component, input, signal } from '@angular/core';
import { ImageCardConfig } from 'src/app/models/app.config.models';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lsa-image-card',
  imports: [RouterLink, MatButtonModule, NgClass],
  templateUrl: './image-card.component.html',
  styleUrl: './image-card.component.scss'
})
export class ImageCardComponent {
  isSmallScreen = signal(false)
  readonly config = input.required<ImageCardConfig>();

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe('(max-width: 850px)')
    .subscribe(state => {
      this.isSmallScreen.set(state.matches)
    })

  }
}