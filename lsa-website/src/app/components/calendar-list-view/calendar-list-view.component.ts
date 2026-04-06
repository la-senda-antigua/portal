import { Component, effect, input, OnInit, signal } from '@angular/core';
import { CalendarListViewConfig } from 'src/app/models/app.config.models';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalendarEventService } from 'src/app/services/calendar-events.service';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { DescriptionBlockComponent } from '../description-block/description-block.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'lsa-calendar-list-view',
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    DescriptionBlockComponent,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  providers: [DatePipe],
  templateUrl: './calendar-list-view.component.html',
  styleUrl: './calendar-list-view.component.scss',
})
export class CalendarListViewComponent implements OnInit {
  readonly config = input.required<CalendarListViewConfig>();

  constructor(public calendarEventService: CalendarEventService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.calendarEventService.loadEvents();
  }

  // Estos métodos se hacen privados porque solo se usarán internamente en getFormattedDateRange
  private isMultiDay(start: string | Date, end?: string | Date): boolean {
    if (!end) return false;
    const s = new Date(start);
    const e = new Date(end);
    return s.toDateString() !== e.toDateString();
  }

  private isSameMonth(start: string | Date, end?: string | Date): boolean {
    if (!end) return true;
    const s = new Date(start);
    const e = new Date(end);
    return s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  }

  private isSameYear(start: string | Date, end?: string | Date): boolean {
    if (!end) return true;
    const s = new Date(start);
    const e = new Date(end);
    return s.getFullYear() === e.getFullYear();
  }

  getFormattedDateRange(start: string | Date, end?: string | Date): string {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : undefined;

    if (!endDate || !this.isMultiDay(startDate, endDate)) {
      return `<b class="capitalize-text">${this.datePipe.transform(startDate, 'MMM d, y', '', 'es')}</b>, todo el día.`;
    }

    // Multiple days events
    if (this.isSameYear(startDate, endDate)) {
      if (this.isSameMonth(startDate, endDate)) {
        // Same year, same month
        return `Del <b>${this.datePipe.transform(startDate, 'd', '', 'es')}</b> 
                al <b>${this.datePipe.transform(endDate, 'd', '', 'es')}</b> 
                de <b class="capitalize-text">${this.datePipe.transform(startDate, 'MMMM', '', 'es')}</b>, 
                de <b>${this.datePipe.transform(startDate, 'y', '', 'es')}</b>`;
      } else {
        // Same year, different month
        return `Del <b>${this.datePipe.transform(startDate, 'd', '', 'es')} de 
                <span class="capitalize-text">${this.datePipe.transform(startDate, 'MMMM', '', 'es')}</span></b> 
                al <b>${this.datePipe.transform(endDate, 'd', '', 'es')} 
                de <span class="capitalize-text">${this.datePipe.transform(endDate, 'MMMM', '', 'es')}</span></b>, 
                de <b>${this.datePipe.transform(startDate, 'y', '', 'es')}</b>`;
      }
    } else {
      // Different year
      return `Del <b>${this.datePipe.transform(startDate, 'd', '', 'es')} de 
              <span class="capitalize-text">${this.datePipe.transform(startDate, 'MMMM', '', 'es')}</span>, 
              ${this.datePipe.transform(startDate, 'y', '', 'es')}</b> 
              al <b>${this.datePipe.transform(endDate, 'd', '', 'es')} 
              de <span class="capitalize-text">${this.datePipe.transform(endDate, 'MMMM', '', 'es')}</span>, 
              ${this.datePipe.transform(endDate, 'y', '', 'es')}</b>`;
    }
  }
}
