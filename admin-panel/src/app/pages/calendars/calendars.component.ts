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
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventInput } from '@fullcalendar/core';
import { MatDialog } from '@angular/material/dialog';
import { PortalUser } from '../../models/PortalUser';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-calendars',
  imports: [
    FullCalendarModule,
    MatListModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBar,
  ],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent implements OnInit {
  isLoading = signal(false);
  fullcalendar = viewChild(FullCalendarComponent);

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
    eventClick: (info: any) => this.selectEvent(info),
    dateClick: (inf: any) => this.openAddEventDialog(inf),
    loading: (isLoading: boolean) => {
      this.isLoading.set(isLoading);
    },
  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];
  private allEvents: any[] = [];

  constructor(
    private service: CalendarsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.isLoading.set(true);
    this.loadMyCaelndars().then(() => {
      const calendarApi = this.fullcalendar()?.getApi();
      const currentStart = calendarApi?.view?.currentStart ?? new Date();

      this.getMonthEvents({
        view: {
          currentStart: currentStart,
        },
      });
      this.isLoading.set(false);
    });
  }

  async loadMyCaelndars(): Promise<void> {
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
          resolve();
        },
        error: (err) => {
          this.myCalendars = [];
          this.selectedCalendars = [];
          resolve();
        },
      });
    });
  }

  getMonthEvents(dateInfo: any) {
    this.isLoading.set(true);
    const month = dateInfo.view.currentStart.getMonth() + 1;
    const year = dateInfo.view.currentStart.getFullYear();

    this.service.getMonthEvents(month, year).subscribe({
      next: (response) => {
        this.allEvents = response;
        this.filterEvents();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('error', err);
        this.isLoading.set(false);
      },
    });
  }

  private filterEvents() {
    this.calendarOptions.events = this.allEvents
      .filter((e) => this.selectedCalendars.includes(e.calendarId))
      .map((e) => {
        let end = e.end?.replace(' ', 'T');

        if (e.allDay && e.end) {
          const date = new Date(e.end.substring(0, 10));
          date.setUTCDate(date.getUTCDate() + 1);
          end = date.toISOString().split('T')[0];
        }

        return {
          title: e.title,
          backgroundColor: this.service.getCalendarColor(e.calendarId),
          start: e.start?.replace(' ', 'T'),
          end: end,
          allDay: e.allDay,
          extendedProps: {
            calendarId: e.calendarId,
            description: e.description,
            id: e.id,
          },
        } as EventInput;
      });
  }

  onCalendarSelectionChange(event: MatSelectionListChange) {
    this.selectedCalendars = event.source.selectedOptions.selected.map(
      (option) => option.value
    );
    this.filterEvents();
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
    if (top + 200 > window.innerHeight) {
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
      width: '450px',
      maxHeight: '80vh',
      data: {
        mode: 'edit',
        type: 'calendar',
        data: {
          id: calendar.id,
          name: calendar.name,
        },
      } as CalendarFormData,
    });

    dialogRef.afterClosed().subscribe((result) => {

      if (!result) return;

      const { data } = result;
      const { name, id } = data;
      const selectedUsers = data.selectedUsers as PortalUser[];
      const members: CalendarMemberDto[] = selectedUsers
        .filter((u) => u.role === 'User')
        .map((u) => ({
          calendarId: id,
          userId: u.userId,
          username: u.username,
          role: u.role,
        }));

      const managers: CalendarMemberDto[] = selectedUsers
        .filter((u) => u.role === 'Manager')
        .map((u) => ({
          calendarId: id,
          userId: u.userId,
          username: u.username,
          role: u.role,
        }));

      const calendar: CalendarDto = {
        id,
        name,
        members,
        managers,
      };

      this.service.edit(calendar).subscribe({
        next: () => {
          this.reload();
        },
        error: (error) => {
          console.error('Error updating calendar:', error);
        },
      });
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
        const { data } = result;
        this.service.add(data).subscribe({
          next: () => {
            const calendarWithColor = {
              ...data,
              color: this.service.getCalendarColor(data.id!),
            };
            this.myCalendars.push(calendarWithColor);
            this.selectedCalendars.push(data.id);
          },
        });
      }
    });
  }

  openAddEventDialog(eventData?: any): void {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '400px',
      data: { calendars: this.myCalendars, event: eventData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {return;}

      this.isLoading.set(true);
      const isCopy = result.trigger === 'copy';

      if (result.start && result.start.length === 5) {
        result.start = result.start + ':00';
      }
      if (result.end){
        if (result.end.length === 5) {
          result.end = result.end + ':00';
        }
      } else {
        result.end = null;
      }

      result.eventDate = result.date;

      if (result.id) {
        this.service.updateEvent(result).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.reload();
            if (isCopy) {
              const copyData = this.prepareCopyData(result);
              this.openAddEventDialog(copyData);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Error al actualizar el evento:', err);
          },
        });
      } else {
        this.service.addEvent(result).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.reload();
            if (isCopy) {
              const copyData = this.prepareCopyData(result);
              this.openAddEventDialog(copyData);
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Error al agregar el evento:', err);
          },
        });
      }
    });
  }

  private prepareCopyData(result: any): any {
    return {
      allDay: result.allDay,
      calendarId: result.calendarId,
      date: result.start.substring(0, 10),
      description: result.description,
      endDate: result.end ? result.end.substring(0, 10) : result.start.substring(0, 10),
      title: `Copy of ${result.title}`,
      start: result.start ? result.start.split('T')[1]?.substring(0, 5) || '' : '',
      end: result.end ? result.end.split('T')[1]?.substring(0, 5) || '' : ''
    };
  }

  selectEvent(item: any) {
    const { allDay, startStr, endStr, extendedProps, title } = item.event;
    const startDate = allDay ? startStr : startStr.split('T')[0];
    let endDate = startDate;

    if (endStr) {
      if (allDay) {
        const date = new Date(endStr);
        date.setUTCDate(date.getUTCDate() - 1);
        endDate = date.toISOString().split('T')[0];
      } else {
        endDate = endStr.split('T')[0];
      }
    }

    const event = {
      id: extendedProps.id,
      title: title,
      description: extendedProps.description,
      date: startDate,
      endDate: endDate,
      start: allDay ? '00:00' : (startStr.split('T')[1]?.substring(0, 5) || ''),
      end: allDay ? '23:59' : (endStr?.split('T')[1]?.substring(0, 5) || ''),
      allDay: allDay,
      calendarId: extendedProps.calendarId,
    };
    this.openAddEventDialog(event);
  }
}
