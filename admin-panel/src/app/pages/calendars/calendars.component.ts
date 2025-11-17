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

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-calendars',
  imports: [FullCalendarModule, MatListModule, MatCheckboxModule],
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
    events: [{ title: 'Evento demo', date: '2025-11-16' }],
  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];

  constructor(private service: CalendarsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.service.getMyPage().subscribe({
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
