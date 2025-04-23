import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Verse {
  id: number;
  text: string;
  reference: string;
}

@Component({
  selector: 'lsa-verse-of-the-day',
  standalone: true,
  imports: [],
  templateUrl: './verse-of-the-day.component.html',
  styleUrl: './verse-of-the-day.component.scss'
})

export class VerseOfTheDayComponent implements OnInit {
  verseOfTheDay: Verse | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Verse[]>('/assets/verses.json').subscribe((verses) => {
      const dayOfYear = this.getDayOfYear(new Date());
      const index = dayOfYear % verses.length;
      this.verseOfTheDay = verses[index];

      console.log("el verso del dia", this.verseOfTheDay)
    });
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
}
