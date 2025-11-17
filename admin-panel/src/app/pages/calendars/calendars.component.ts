import {
  Component,
  inject,
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
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventInput } from '@fullcalendar/core';
import { MatDialog } from '@angular/material/dialog';

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
      hour12: false,
    },
    eventMouseEnter: (info: any) => {
      this.showToolTip(info);
    },
  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];
  private allEvents: any[] = [];

  constructor(private service: CalendarsService, private router: Router, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.loadMyCaelndars().then(() => {
      const now = new Date();
      this.getMonthEvents({
        view: {
          currentStart: new Date(now.getFullYear(), now.getMonth()),
        },
      });
    });
  }

  async loadMyCaelndars(): Promise<void> {
    this.isLoading.set(true);
    return new Promise((resolve) => {
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
          resolve();
        },
        error: (err) => {
          this.myCalendars = [];
          this.selectedCalendars = [];
          this.isLoading.set(false);
          resolve();
        },
      });
    });
  }

  getMonthEvents(dateInfo: any) {
    const month = dateInfo.view.currentStart.getMonth() + 1;
    const year = dateInfo.view.currentStart.getFullYear();

    this.service.getMonthEvents(month, year).subscribe({
      next: (response) => {
        this.allEvents = response;
        this.filterEvents();
      },
      error: (err) => {
        console.log('error', err);
      },
    });
  }

  private filterEvents() {
    this.calendarOptions.events = this.allEvents
      .filter((e) => this.selectedCalendars.includes(e.calendarId))
      .map(
        (e) =>
          ({
            title: e.title,
            backgroundColor: this.service.getCalendarColor(e.calendarId),
            start: `${e.eventDate.split('T')[0]}T${e.startTime}`,
            end: `${e.eventDate.split('T')[0]}T${e.endTime}`,
            extendedProps: {
              calendarId: e.calendarId,
              description: e.description,
            },
          } as EventInput)
      );
  }

  onCalendarSelectionChange(event: MatSelectionListChange) {
    this.selectedCalendars = event.source.selectedOptions.selected.map(
      (option) => option.value
    );
    this.filterEvents();
  }

  goToDetails(data: any) {
    this.router.navigate(['/calendars/details', data.id], {
      state: { name: data.name },
    });
  }

  showToolTip(info: any) {
    const tooltip = document.createElement('div');
    tooltip.className = 'fc-tooltip';

    const startTime = info.event.start?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const endTime = info.event.end?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const date = info.event.start?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    tooltip.innerHTML = `
    <strong>${info.event.title}</strong><br>
    <small>
    ${date} <br>
    ${startTime ? `Start: ${startTime}` : ''}${
      startTime && endTime ? ' | ' : ''
    }${endTime ? `End: ${endTime}` : ''}
    </small>
    <p>${info.event.extendedProps.description || ''}<p>
  `;

    tooltip.style.position = 'absolute';
    let left = info.jsEvent.pageX + 10;
    let top = info.jsEvent.pageY + 10;
    if (left + 200 > window.innerWidth) {
      left = info.jsEvent.pageX - 210;
    }
    if (top + 100 > window.innerHeight) {
      top = info.jsEvent.pageY - 110;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.border = '1px solid #ccc';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    tooltip.style.zIndex = '9';
    document.body.appendChild(tooltip);

    info.el.addEventListener('mouseleave', () => {
      tooltip.remove();
    });
  }

  showCalendarOptions(event: MouseEvent, calendar: CalendarDto) {
  event.stopPropagation();

  const dialogRef = this.dialog.open(EditCalendarFormComponent, {
    data: {
      mode: 'edit',
      type: 'calendar',
      data: {
        id: calendar.id,
        name: calendar.name,
      }
    } as CalendarFormData
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Aquí puedes manejar la actualización del calendario
      console.log('Calendar updated:', result);
      // Por ejemplo: this.updateCalendar(result);
    }
  });
}


  openModal() {
    const dialogRef = this.dialog.open(EditCalendarFormComponent, {
      data: {
        mode: 'add',
        type: 'calendar',
        data: {},
      } as CalendarFormData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Form data:', result);
      }
    });
  }
}
