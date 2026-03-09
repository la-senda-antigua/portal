import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { CalendarDto } from '../../models/CalendarDto';
import { CalendarsService } from '../../services/calendars.service';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import { EventOptionsComponent } from '../../components/event-options/event-options.component';
import { CalendarEvent } from '../../models/CalendarEvent';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { PortalUser, UserRole } from '../../models/PortalUser';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

interface ExtendedCalendar extends CalendarDto {
  iAmManager: boolean;
}

export const LAST_SELECTED_CALENDARS_KEY = 'lastSelectedCalendars';

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
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent {
  readonly calendarEventsLoading = signal(false);
  readonly calendarListLoading = signal(false);
  readonly fullCalendarComponent = viewChild(FullCalendarComponent);
  readonly fullCalendarApi = computed(() =>
    this.fullCalendarComponent()?.getApi(),
  );
  readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);
  readonly userService = inject(UsersService);

  readonly currentUserId = this.authService.currentUserId;
  readonly currentUser = toSignal(
    this.userService.getById(this.currentUserId ?? ''),
  );

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
      hour12: true,
    },
    eventClick: (info: any) => this.showEventOptions(info),
    dateClick: (inf: any) => this.openAddEventDialog(inf),
  };

  myCalendars: ExtendedCalendar[] = [];
  selectedCalendars: string[] = [];
  private allEvents: any[] = [];

  constructor(
    private service: CalendarsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    effect(() => {
      if (!this.currentUser()) {
        return;
      }
      const preferencesString = this.currentUser()?.preferences ?? '{}';
      let preferences = { [LAST_SELECTED_CALENDARS_KEY]: [] };
      try {
        preferences = JSON.parse(preferencesString);
      } catch (error) {
        console.error('Error parsing user preferences: ', error);
      } finally {
        const selectedCalendars = preferences[LAST_SELECTED_CALENDARS_KEY];
        this.loadCalendarsAndEvents(selectedCalendars ?? []);
      }
    });
  }

  toggleSelectAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedCalendars = this.myCalendars.map((c) => c.id!);
    } else {
      this.selectedCalendars = [];
    }
    const e: MatSelectionListChange = {
      source: {
        selectedOptions: {
          selected: this.selectedCalendars.map((id) => ({ value: id })) as any,
        },
      } as any,
      options: [] as any,
    };
    this.onCalendarSelectionChange(e);
  }

  loadCalendarsAndEvents(calendarSelection: string[]) {
    this.loadCalendarList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((calendars) => {
          this.selectedCalendars = calendarSelection.filter((id) =>
            calendars.some((c) => c.id === id),
          );
          this.myCalendars = calendars.map((c) => ({
            ...c,
            iAmManager:
              this.authService.hasRole(UserRole.Admin) ||
              (c.managers?.some((m) => m.userId === this.currentUserId) ??
                false),
          }));
        }),
        switchMap(() => this.loadCalendarEvents()),
        tap(() => {
          this.handleLoadCalendarEvents();
        }),
      )
      .subscribe(() => {
        this.calendarListLoading.set(false);
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
              isPublic: c.isPublic,
              isHidden: c.isHidden,
              members: c.members,
              managers: c.managers,
            }) as CalendarDto,
        );
      }),
      catchError(() => of([])),
    );
  }

  loadCalendarEvents(): Observable<CalendarEvent[]> {
    this.calendarEventsLoading.set(true);
    const currentStart =
      this.fullCalendarApi()?.view.currentStart ?? new Date();
    const month = currentStart.getMonth() + 1;
    const year = currentStart.getFullYear();

    const startDate = this.getInitialDateForMonthView(month, year);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);

    return this.service
      .getEventsByDates(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        this.myCalendars.map((c) => c.id!),
      )
      .pipe(catchError(() => of([])));
  }

  private filterEvents() {
    const uniqueEvents = new Map<string, any>();

    this.allEvents
      .filter((e) => this.selectedCalendars.includes(e.calendarId))
      .forEach((e) => {
        if (uniqueEvents.has(e.id)) return;

        let end = e.end?.replace(' ', 'T');

        if (e.allDay && e.end) {
          end = this.adjustDateByDays(e.end, 1);
        }

        const color = this.service.getCalendarColor(e.calendarId);

        uniqueEvents.set(e.id, {
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
        } as EventInput);
      });

    this.calendarOptions.events = Array.from(uniqueEvents.values());
  }

  onCalendarSelectionChange(event: MatSelectionListChange) {
    this.selectedCalendars = event.source.selectedOptions.selected.map(
      (option) => option.value,
    );
    this.filterEvents();
    const preferences = {
      [LAST_SELECTED_CALENDARS_KEY]: this.selectedCalendars,
    };
    const updatedUser: PortalUser = {
      ...this.currentUser()!,
      preferences: JSON.stringify(preferences),
    };
    this.userService.edit(updatedUser).subscribe();
  }

  showCalendarOptions(event: MouseEvent, calendar: CalendarDto) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(EditCalendarFormComponent, {
      width: '450px',
      maxHeight: '80vh',
      data: {
        mode: 'edit',
        type: 'calendar',
        data: { ...calendar },
      } as CalendarFormData,
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((dialogCloseResult) => {
          if (!dialogCloseResult) return of(null);

          const { data } = dialogCloseResult;
          if (data.action === 'delete') {
            this.deleteCalendar(data.id, data.name);
            return of(null);
          }

          const selectedUsers = data.selectedUsers as CalendarMemberDto[];
          const members: CalendarMemberDto[] = selectedUsers.filter(
            (u) => u.role === 'User',
          );

          const managers: CalendarMemberDto[] = selectedUsers.filter(
            (u) => u.role === 'Manager',
          );

          const calendar: CalendarDto = {
            ...data,
            members,
            managers,
          };
          return this.service.edit(calendar);
        }),
        catchError(() => of(null)),
      )
      .subscribe((result) => {
        if (result != null) {
          this.loadCalendarsAndEvents(this.selectedCalendars);
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
        this.service.add(result.data).subscribe({
          next: (response) => {
            let calendarWithColor = {
              ...result.data,
              color: this.service.getCalendarColor(response.id!),
            };
            calendarWithColor.id = response.id;
            calendarWithColor.iamManager = true;
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
    if (eventData?.id) {
      assignees =
        this.allEvents.find((e) => e.id === eventData.id)?.assignees || [];
      eventData.assignees = assignees;
    }

    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      maxHeight: '95vh',
      data: {
        calendars: this.myCalendars.filter((c) => c.iAmManager),
        event: eventData,
      },
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
            this.loadCalendarsAndEvents(this.selectedCalendars);
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
            this.loadCalendarsAndEvents(this.selectedCalendars);
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
    const {
      allDay,
      startStr,
      endStr,
      extendedProps,
      title: displayTitle,
      backgroundColor,
    } = item.event;
    const calendar = this.myCalendars.find(
      (c) => c.id === extendedProps.calendarId,
    );

    if (!calendar) {
      return;
    }

    const startDate = allDay ? startStr : startStr.split('T')[0];
    let endDate = startDate;

    if (endStr) {
      if (allDay) {
        endDate = this.adjustDateByDays(endStr, -1);
      } else {
        endDate = endStr.split('T')[0];
      }
    }

    const assignees: PortalUser[] =
      this.allEvents.find((e) => e.id === extendedProps.id)?.assignees || [];
    const originalTitle = this.allEvents.find(
      (e) => e.id === extendedProps.id,
    )?.title;

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
      calendarName: calendar?.name,
      color: backgroundColor,
      assignees,
      canEdit: calendar.iAmManager,
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
              next: () => this.loadCalendarsAndEvents(this.selectedCalendars),
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
          next: () => this.loadCalendarsAndEvents(this.selectedCalendars),
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

  /**
   *
   * @param month The month for which to calculate the initial date (1-12)
   * @param year The year for which to calculate the initial date
   * @returns A Date object representing the initial date to be used in the calendar, which is the Sunday on or before the first day of the given month and year
   * This ensures that the calendar view always starts on a Sunday, even if the first day of the month is in the middle of the week
   */
  private getInitialDateForMonthView(month: number, year: number): Date {
    const startOfMonth = new Date(year, month - 1, 1);
    const indexOfFirstDay = startOfMonth.getDay();
    const initialDate = new Date(startOfMonth);
    initialDate.setDate(initialDate.getDate() - indexOfFirstDay);
    return initialDate;
  }
}
