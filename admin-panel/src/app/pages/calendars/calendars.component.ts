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

import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventInput } from '@fullcalendar/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PortalUser } from '../../models/PortalUser';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { EventOptionsComponent } from '../../components/event-options/event-options.component';
import { CalendarEvent } from '../../models/CalendarEvent';

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
  isCalendarsLoading = signal(false);
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
    eventClick: (info: any) => this.showEventOptions(info),
    dateClick: (inf: any) => this.openAddEventDialog(inf),
    loading: (isLoading: boolean) => {
      this.isLoading.set(isLoading);
    },
  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];
  private allEvents: any[] = [];
  eventOptionsDialogRef?: MatDialogRef<EventOptionsComponent>;

  constructor(
    private service: CalendarsService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.isLoading.set(true);
    this.isCalendarsLoading.set(true);
    this.loadMyCaelndars().then(() => {
      this.isCalendarsLoading.set(false);
      const calendarApi = this.fullcalendar()?.getApi();
      const currentStart = calendarApi?.view?.currentStart ?? new Date();

      this.getMonthEvents({
        view: {
          currentStart: currentStart,
        },
      });
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
              }) as CalendarDto,
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

        const color = this.service.getCalendarColor(e.calendarId);

        return {
          title: e.title,
          backgroundColor: color,
          borderColor: color,
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
      (option) => option.value,
    );
    this.filterEvents();
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

  openAddCalendarModal() {
    const dialogRef = this.dialog.open(EditCalendarFormComponent, {
      data: {
        mode: 'add',
        type: 'calendar',
        data: {},
      } as CalendarFormData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isCalendarsLoading.set(true);
        const { data } = result;
        this.service.add(data).subscribe({
          next: (response) => {
            let calendarWithColor = {
              ...data,
              color: this.service.getCalendarColor(response.id!),
            };
            calendarWithColor.id = response.id;
            this.myCalendars.push(calendarWithColor);
            this.selectedCalendars.push(calendarWithColor.id!);
            this.isCalendarsLoading.set(false);
          },
          error: (err) => {
            console.error('Error adding calendar:', err);
            this.isCalendarsLoading.set(false);
          },
        });
      }
    });
  }

  openAddEventDialog(eventData?: any): void {
    if (this.eventOptionsDialogRef) {
      this.eventOptionsDialogRef.close();
    }

    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '400px',
      data: { calendars: this.myCalendars, event: eventData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.isLoading.set(true);
      const isCopy = result.trigger === 'copy';

      if (result.start && result.start.length === 5) {
        result.start = result.start + ':00';
      }
      if (result.end) {
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
      endDate: result.end
        ? result.end.substring(0, 10)
        : result.start.substring(0, 10),
      title: `Copy of ${result.title}`,
      start: result.start
        ? result.start.split('T')[1]?.substring(0, 5) || ''
        : '',
      end: result.end ? result.end.split('T')[1]?.substring(0, 5) || '' : '',
    };
  }

  showEventOptions(item: any) {
    if (this.eventOptionsDialogRef) {
      this.eventOptionsDialogRef.close();
    }

    const { allDay, startStr, endStr, extendedProps, title, backgroundColor } = item.event;
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
      start: allDay ? '00:00' : startStr.split('T')[1]?.substring(0, 5) || '',
      end: allDay ? '23:59' : endStr?.split('T')[1]?.substring(0, 5) || '',
      allDay: allDay,
      calendarId: extendedProps.calendarId,
      calendarName: this.myCalendars.find((c) => c.id === extendedProps.calendarId,)?.name,
      color: backgroundColor
    };

    const dialogWidth = 400;
    const dialogHeight = 300;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let top = item.jsEvent.clientY;
    let left = item.jsEvent.clientX;

    if (left + dialogWidth > screenWidth) {
      left = screenWidth - dialogWidth - 20;
    }

    if (top + dialogHeight > screenHeight) {
      top = screenHeight - dialogHeight - 20;
    }

    const dialogRef = this.dialog.open(EventOptionsComponent, {
      data: event,
      width: `${dialogWidth}px`,
      hasBackdrop: false,
      panelClass: 'event-options-panel',
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
    });
    this.eventOptionsDialogRef = dialogRef;

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        this.openAddEventDialog(result.event);
      } else if (result?.action === 'delete') {
        // this.isLoading.set(true);
        // this.service.deleteEvent(result.event.id).subscribe(() => this.reload());
      }
    });
  }

}
