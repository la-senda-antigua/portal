import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { SectionConfig } from 'src/app/models/app.config.models';
import { BackgroundImageWithFloatingTextComponent } from '../background-image-with-floating-text/background-image-with-floating-text.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { VerseOfTheDayComponent } from '../verse-of-the-day/verse-of-the-day.component';

@Component({
  selector: 'lsa-header',
  imports: [
    CommonModule,
    BackgroundImageWithFloatingTextComponent,
    CarouselComponent,
    VerseOfTheDayComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly headerConfig = input.required<SectionConfig>();
}
