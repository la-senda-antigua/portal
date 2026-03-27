import { Component, computed, input, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VerseConfig } from 'src/app/models/app.config.models';

interface Verse {
  id: number;
  text: string;
  reference: string;
  image: string;
}

@Component({
  selector: 'lsa-verse-of-the-day',
  standalone: true,
  imports: [],
  templateUrl: './verse-of-the-day.component.html',
  styleUrl: './verse-of-the-day.component.scss'
})

export class VerseOfTheDayComponent implements OnInit {
  readonly verseOfTheDay = signal<Verse | null>(null)
  readonly config = input.required<VerseConfig>();
  readonly overlayColor = computed(() => {
    if (!this.config()?.overlayColor) {
      return undefined;
    }
    return `background-image: radial-gradient(rgba(56,56,56,0.4), ${this.config()?.overlayColor})`;
  });
  readonly backgroundPosition = computed(() => this.config()?.backgroundPosition ?? '');
  readonly backgroundImage = computed(() => this.config()?.showBackgroundImage ? `url(assets/${this.verseOfTheDay()?.image})` : '');
  readonly textColor = computed(() => this.config()?.textColor ?? 'auto');
  readonly textShadow = computed(() => this.config()?.showBackgroundImage ? 'black 1px 1px 5px' : 'none');
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Verse[]>('/assets/verses.json').subscribe((verses) => {
      const dayOfYear = this.getDayOfYear(new Date());
      const index = dayOfYear % verses.length;
      this.verseOfTheDay.set(verses[index]);
    });
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
}
