import {
  Component,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { CalendarsService } from '../../services/calendars.service';
import { CalendarDto } from '../../models/CalendarDto';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calentar-form/edit-calendar-form.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventInput } from '@fullcalendar/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-calendars',
  imports: [
    FullCalendarModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent implements OnInit {
  isLoading = signal(false);

  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: [] as EventInput,
    datesSet: (dateInfo: any) => this.getMonthEvents(dateInfo),
    displayEventTime: true,
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false
    }

  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];

  constructor(private service: CalendarsService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyCaelndars();
  }

  loadMyCaelndars(): void {
    this.isLoading.set(true);
    this.service.getMyCalendars().subscribe({
      next: (response) => {
        const items = response.map(
          (c: CalendarDto) =>
            ({
              id: c.id,
              name: c.name,
              color: this.service.getCalendarColor(c.id!),
            } as CalendarDto)
        );

        this.myCalendars = items;
        this.selectedCalendars = items.map((item) => item.id!);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.myCalendars = [];
        this.isLoading.set(false);
      },
    });
  }

  getMonthEvents(dateInfo: any) {
    const month = dateInfo.view.currentStart.getMonth() + 1;
    const year = dateInfo.view.currentStart.getFullYear();

    this.service.getMonthEvents(month, year).subscribe({
      next: (response) => {
        this.calendarOptions.events = response.map(e => ({
          title: e.title,
          backgroundColor: this.service.getCalendarColor(e.calendarId),
          borderColor: this.service.getCalendarColor(e.calendarId),
          start: `${e.eventDate.split('T')[0]}T${e.startTime}`,
        } as EventInput));
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  onCalendarSelectionChange(event: MatSelectionListChange) {
    this.selectedCalendars = event.source.selectedOptions.selected.map(
      (option) => option.value
    );
  }

  goToDetails(data: any) {
    this.router.navigate(['/calendars/details', data.id], {
      state: { name: data.name },
    });
  }

  showModal() {
    console.log('adding');
  }
}
