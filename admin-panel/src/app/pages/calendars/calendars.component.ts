import {
  Component,
  computed,
  DestroyRef,
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
import { PortalUser, UserRole } from '../../models/PortalUser';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { EventOptionsComponent } from '../../components/event-options/event-options.component';
import { CalendarEvent } from '../../models/CalendarEvent';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  readonly calendarEventsLoading = signal(false);
  readonly calendarListLoading = signal(false);
  readonly fullCalendarComponent = viewChild(FullCalendarComponent);
  readonly fullCalendarApi = computed(() =>
    this.fullCalendarComponent()?.getApi(),
  );
  readonly destroyRef = inject(DestroyRef);

  readonly calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: [] as EventInput,
    datesSet: () => this.handleLoadCalendarEvents(),
    displayEventTime: true,
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
    },
    eventClick: (info: any) => this.showEventOptions(info),
    dateClick: (inf: any) => this.openAddEventDialog(inf),

  };

  myCalendars: CalendarDto[] = [];
  selectedCalendars: string[] = [];
  private allEvents: any[] = [];

  constructor(
    private service: CalendarsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadCalendarsAndEvents();
  }

  loadCalendarsAndEvents(reload = false) {
    this.loadCalendarList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => this.handleLoadCalendarEvents()),
      )
      .subscribe((calendars) => {
        this.calendarListLoading.set(false);
        this.myCalendars = calendars;
        if (!reload) {
          this.selectedCalendars = calendars.map((item) => item.id!);
        }
      });
  }

  handleLoadCalendarEvents() {
    this.loadCalendarEvents().subscribe((events) => {
      this.allEvents = events;
      this.filterEvents();
      this.calendarEventsLoading.set(false);
    });
  }

  loadCalendarList(): Observable<CalendarDto[]> {
    this.calendarListLoading.set(true);

    return this.service.getMyCalendars().pipe(
      map((calendarDtos) => {
        return calendarDtos.map(
          (c: CalendarDto) =>
            ({
              id: c.id,
              name: c.name,
              color: this.service.getCalendarColor(c.id!),
            }) as CalendarDto,
        );
      }),
      catchError(() => of([])),
    );
  }

  loadCalendarEvents(): Observable<CalendarEvent[]> {
    this.calendarEventsLoading.set(true);
    const currentStart = this.fullCalendarApi()?.view.currentStart ?? new Date();
    const month = currentStart.getMonth() + 1;
    const year = currentStart.getFullYear();

    return this.service
      .getMonthEvents(month, year)
      .pipe(catchError(() => of([])));
  }

  private filterEvents() {
    this.calendarOptions.events = this.allEvents
      .filter((e) => this.selectedCalendars.includes(e.calendarId))
      .map((e) => {
        let end = e.end?.replace(' ', 'T');

        if (e.allDay && e.end) {
          end = this.adjustDateByDays(e.end, 1);
        }

        const color = this.service.getCalendarColor(e.calendarId);

        return {
          title: e.displayTitle ?? e.title,
          backgroundColor: color,
          borderColor: color,
          start: e.start?.replace(' ', 'T'),
          end: end,
          allDay: e.allDay,
          extendedProps: {
            calendarId: e.calendarId,
            description: e.description,
            id: e.id,
            originalTitle: e.title,
            displayTitle: e.displayTitle,
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

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((dialogCloseResult) => {
          if (!dialogCloseResult) return of(null);

          const { data } = dialogCloseResult;
          const { name, id, action } = data;
          if (action === 'delete') {
            this.deleteCalendar(id, name);
            return of(null);
          }

          const selectedUsers = data.selectedUsers as CalendarMemberDto[];
          const members: CalendarMemberDto[] = selectedUsers
            .filter((u) => u.role === 'User');

          const managers: CalendarMemberDto[] = selectedUsers
            .filter((u) => u.role === 'Manager');

          const calendar: CalendarDto = {
            id,
            name,
            members,
            managers,
          };
          return this.service.edit(calendar);
        }),
        catchError(() => of(null)),
      )
      .subscribe((result) => {
        if (result != null) {
          this.loadCalendarsAndEvents(true);
        }
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
        this.calendarListLoading.set(true);
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
            this.calendarListLoading.set(false);
          },
          error: (err) => {
            this.calendarListLoading.set(false);
            this.handleException(
              err,
              'There was a problem when attempting to add the calendar.',
            );
          },
        });
      }
    });
  }

  openAddEventDialog(eventData?: any): void {
    let assignees: PortalUser[] = [];
    if (eventData?.id){
      assignees = this.allEvents.find(e=> e.id === eventData.id)?.assignees || [];
      eventData.assignees = assignees;
    }

    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      maxHeight: '95vh',
      data: { calendars: this.myCalendars, event: eventData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.calendarEventsLoading.set(true);
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
      result.assignees = result.assignees || [];

      if (result.id) {
        this.service.updateEvent(result).subscribe({
          next: () => {
            this.calendarEventsLoading.set(false);
            this.loadCalendarsAndEvents(true);
            if (isCopy) {
              const copyData = this.prepareCopyData(result);
              this.openAddEventDialog(copyData);
            }
          },
          error: (err) => {
            this.calendarEventsLoading.set(false);
            this.handleException(
              err,
              'There was a problem updating the event.',
            );
          },
        });
      } else {
        this.service.addEvent(result).subscribe({
          next: () => {
            this.calendarEventsLoading.set(false);
            this.loadCalendarsAndEvents(true);
            if (isCopy) {
              const copyData = this.prepareCopyData(result);
              this.openAddEventDialog(copyData);
            }
          },
          error: (err) => {
            this.calendarEventsLoading.set(false);
            this.handleException(err, 'There was a problem adding the event.');
          },
        });
      }
    });
  }

  private prepareCopyData(result: any): any {
    return {
      allDay: result.allDay,
      assignees: result.assignees,
      calendarId: result.calendarId,
      date: result.start.substring(0, 10),
      description: result.description,
      endDate: result.end
        ? result.end.substring(0, 10)
        : result.start.substring(0, 10),
      title: `${result.title}`,
      start: result.start
        ? result.start.split('T')[1]?.substring(0, 5) || ''
        : '',
      end: result.end ? result.end.split('T')[1]?.substring(0, 5) || '' : '',
    };
  }

  showEventOptions(item: any) {
    const { allDay, startStr, endStr, extendedProps, title: displayTitle, backgroundColor } = item.event;
    const startDate = allDay ? startStr : startStr.split('T')[0];
    let endDate = startDate;

    if (endStr) {
      if (allDay) {
        endDate = this.adjustDateByDays(endStr, -1);
      } else {
        endDate = endStr.split('T')[0];
      }
    }

    const assignees: PortalUser[] = this.allEvents.find(e=> e.id === extendedProps.id)?.assignees || [];
    const originalTitle = this.allEvents.find(e => e.id === extendedProps.id)?.title;

    const event = {
      id: extendedProps.id,
      title: originalTitle,
      displayTitle: displayTitle,
      description: extendedProps.description,
      date: startDate,
      endDate: endDate,
      start: allDay ? '00:00' : startStr.split('T')[1]?.substring(0, 5) || '',
      end: allDay ? '23:59' : endStr?.split('T')[1]?.substring(0, 5) || '',
      allDay: allDay,
      calendarId: extendedProps.calendarId,
      calendarName: this.myCalendars.find(
        (c) => c.id === extendedProps.calendarId,
      )?.name,
      color: backgroundColor,
      assignees
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
      panelClass: 'event-options-panel',
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') {
        this.openAddEventDialog(result.event);
      } else if (result?.action === 'delete') {
        const dialogDelete = this.dialog.open(DeleteConfirmationComponent, {
          data: {
            id: event.id,
            matchingString: event.title,
            name: event.title,
          },
        });

        dialogDelete.afterClosed().subscribe((result) => {
          if (result) {
            this.calendarEventsLoading.set(true);
            this.service.deleteEvent(event.id).subscribe({
              next: () => this.loadCalendarsAndEvents(true),
              error: (err) => {
                this.calendarEventsLoading.set(false);
                this.handleException(
                  err,
                  'There was a problem when attempting to delete.',
                );
              },
            });
          }
        });
      }
    });
  }

  deleteCalendar(id: string, name: string) {
    const dialogDelete = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        id: id,
        matchingString: name,
        name: name,
      },
    });

    dialogDelete.afterClosed().subscribe((result) => {
      if (result) {
        this.calendarEventsLoading.set(true);
        this.service.delete(id).subscribe({
          next: () => this.loadCalendarsAndEvents(true),
          error: (err) => {
            this.calendarEventsLoading.set(false);
            this.handleException(err, err.error);
          },
        });
      }
    });
  }

  handleException(e: Error, message: string) {
    this.calendarEventsLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private adjustDateByDays(dateString: string, days: number): string {
    const datePart = dateString.substring(0, 10);
    const date = new Date(`${datePart}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  }
}
