import { CommonModule, DatePipe } from '@angular/common';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { CalendarDto } from '../../models/CalendarDto';
import { CalendarsService } from '../../services/calendars.service';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  catchError,
  combineLatest,
  debounceTime,
  first,
  map,
  Observable,
  of,
  ReplaySubject,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import { CalendarEvent } from '../../models/CalendarEvent';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { UserRole } from '../../models/PortalUser';
import { AuthService } from '../../services/auth.service';

interface ExtendedCalendar extends CalendarDto {
  iAmManager: boolean;
}

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
    CommonModule,
  ],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent implements OnInit {
  readonly calendarEventsLoading = signal(false);
  readonly fullCalendarComponent = viewChild(FullCalendarComponent);
  readonly fullCalendarApi = computed(() =>
    this.fullCalendarComponent()?.getApi(),
  );
  readonly destroyRef = inject(DestroyRef);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly calendarsService = inject(CalendarsService);
  readonly router = inject(Router);
  readonly authService = signal(inject(AuthService));
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);

  readonly currentUserId = computed(() => this.authService().currentUserId);
  readonly calendarEventRecords: Record<
    string,
    Record<number, Record<number, CalendarEvent[]>>
  > = {};

  private triggerGetCalendarList$ = new ReplaySubject(1);

  readonly currentMonth$ = this.activatedRoute.queryParams.pipe(
    map((params) =>
      params['month'] ? parseInt(params['month']) : new Date().getMonth() + 1,
    ),
  );
  readonly currentYear$ = this.activatedRoute.queryParams.pipe(
    map((params) =>
      params['year'] ? parseInt(params['year']) : new Date().getFullYear(),
    ),
  );
  readonly selectedCalendarIds$ = this.activatedRoute.queryParams.pipe(
    map((params) =>
      params['calendars'] ? params['calendars'].split(',') : [],
    ),
  );

  readonly myCalendars$: Observable<ExtendedCalendar[]> =
    this.triggerGetCalendarList$.pipe(
      switchMap(() => this.calendarsService.getMyCalendars()),
      takeUntilDestroyed(this.destroyRef),
      map((calendarDtos) => {
        return calendarDtos.map(
          (c: CalendarDto) =>
            ({
              id: c.id,
              name: c.name,
              color: this.calendarsService.getCalendarColor(c.id!),
              isPublic: c.isPublic,
              isHidden: c.isHidden,
              members: c.members,
              managers: c.managers,
            }) as CalendarDto,
        );
      }),
      catchError(() => of([])),
      map((calendars) =>
        calendars.map((c) => ({
          ...c,
          iAmManager:
            this.authService().hasRole(UserRole.Admin) ||
            (c.managers?.some((m) => m.userId === this.currentUserId()) ??
              false),
        })),
      ),
    );

  /** The list of calendars is fetched only once per session */
  readonly calendarListLoading$ = this.triggerGetCalendarList$.pipe(
    switchMap(() => this.myCalendars$),
    map(() => false),
  );

  readonly calendarEvents$ = combineLatest([
    this.selectedCalendarIds$,
    this.currentMonth$,
    this.currentYear$,
  ]).pipe(
    debounceTime(200),
    switchMap(([selectedCalendarIds, month, year]) => {
      if (!selectedCalendarIds.length) {
        return of([] as CalendarEvent[]);
      }
      const missingCalendarIds = selectedCalendarIds.filter(
        (id: string) =>
          !this.calendarEventRecords[id] ||
          !this.calendarEventRecords[id][year] ||
          !this.calendarEventRecords[id][year][month],
      );
      const existingEvents = this.getEventsInStore(selectedCalendarIds);
      if (!missingCalendarIds.length) {
        return of(existingEvents);
      }
      const startDate = this.getInitialDate(month, year);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 41);
      this.calendarEventsLoading.set(true);
      return this.calendarsService
        .getEventsByDates(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          missingCalendarIds,
        )
        .pipe(
          map((events) => {
            this.addEventsToStore(events, month, year, missingCalendarIds);
            return this.getEventsInStore(selectedCalendarIds);
          }),
        );
    }),
    catchError(() => of([] as CalendarEvent[])),
    map((events) => this.mapEvents(events)),
  );

  calendarOptions?: CalendarOptions;

  ngOnInit(): void {
    this.triggerGetCalendarList$.next(true);

    this.calendarEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((events) => {
        if (this.calendarOptions != undefined) {
          this.calendarOptions.events = events;
          this.calendarEventsLoading.set(false);
        }
      });

    combineLatest([this.currentMonth$, this.currentYear$])
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe(([month, year]) => {
        this.calendarOptions = {
          plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          editable: true,
          selectable: true,
          events: [] as EventInput,
          initialDate: new Date(year, month - 1, 1),
          datesSet: (args) => this.calendarMonthChange(args),
          displayEventTime: true,
          eventTimeFormat: {
            hour: '2-digit' as const,
            minute: '2-digit' as const,
            hour12: true,
          },
          eventClick: (info: any) => this.showEventOptions(info),
          dateClick: (inf: any) => this.openAddEventDialog(inf),
        };
      });
  }

  calendarSelectionChange(event: MatSelectionListChange) {
    const ids = event.source.selectedOptions.selected.map(
      (option) => option.value,
    );
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { calendars: ids.join(',') },
      queryParamsHandling: 'merge',
    });
  }

  calendarMonthChange(datesSet: DatesSetArg) {
    const { month, year } = this.getCurrentMonthFromDate(datesSet.start);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { month, year },
      queryParamsHandling: 'merge',
    });
  }

  openEditCalendarDialog(event: MouseEvent, calendar: CalendarDto) {
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
          return this.calendarsService.edit(calendar);
        }),
        catchError(() => of(null)),
      )
      .subscribe((result) => {
        if (result != null) {
          this.triggerGetCalendarList$.next(true);
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
        this.calendarsService.add(result.data).subscribe({
          next: () => {
            this.triggerGetCalendarList$.next(true);
          },
          error: (err) => {
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
    // let assignees: PortalUser[] = [];
    // if (eventData?.id) {
    //   assignees =
    //     this.allEvents.find((e) => e.id === eventData.id)?.assignees || [];
    //   eventData.assignees = assignees;
    // }
    // const dialogRef = this.dialog.open(AddEventDialogComponent, {
    //   width: '500px',
    //   maxHeight: '95vh',
    //   data: {
    //     calendars: this.myCalendars$.filter((c) => c.iAmManager),
    //     event: eventData,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (!result) {
    //     return;
    //   }
    //   this.calendarEventsLoading.set(true);
    //   const isCopy = result.trigger === 'copy';
    //   if (result.start && result.start.length === 5) {
    //     result.start = result.start + ':00';
    //   }
    //   if (result.end) {
    //     if (result.end.length === 5) {
    //       result.end = result.end + ':00';
    //     }
    //   } else {
    //     result.end = null;
    //   }
    //   result.eventDate = result.date;
    //   result.assignees = result.assignees || [];
    //   if (result.id) {
    //     this.calendarsService.updateEvent(result).subscribe({
    //       next: () => {
    //         this.calendarEventsLoading.set(false);
    //         this.loadCalendarsAndEvents(true);
    //         if (isCopy) {
    //           const copyData = this.prepareCopyData(result);
    //           this.openAddEventDialog(copyData);
    //         }
    //       },
    //       error: (err) => {
    //         this.calendarEventsLoading.set(false);
    //         this.handleException(
    //           err,
    //           'There was a problem updating the event.',
    //         );
    //       },
    //     });
    //   } else {
    //     this.calendarsService.addEvent(result).subscribe({
    //       next: () => {
    //         this.calendarEventsLoading.set(false);
    //         this.loadCalendarsAndEvents(true);
    //         if (isCopy) {
    //           const copyData = this.prepareCopyData(result);
    //           this.openAddEventDialog(copyData);
    //         }
    //       },
    //       error: (err) => {
    //         this.calendarEventsLoading.set(false);
    //         this.handleException(err, 'There was a problem adding the event.');
    //       },
    //     });
    //   }
    // });
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
    // const {
    //   allDay,
    //   startStr,
    //   endStr,
    //   extendedProps,
    //   title: displayTitle,
    //   backgroundColor,
    // } = item.event;
    // const calendar = this.myCalendars$.find(
    //   (c) => c.id === extendedProps.calendarId,
    // );
    // if (!calendar) {
    //   return;
    // }
    // const startDate = allDay ? startStr : startStr.split('T')[0];
    // let endDate = startDate;
    // if (endStr) {
    //   if (allDay) {
    //     endDate = this.adjustDateByDays(endStr, -1);
    //   } else {
    //     endDate = endStr.split('T')[0];
    //   }
    // }
    // const assignees: PortalUser[] =
    //   this.allEvents.find((e) => e.id === extendedProps.id)?.assignees || [];
    // const originalTitle = this.allEvents.find(
    //   (e) => e.id === extendedProps.id,
    // )?.title;
    // const event = {
    //   id: extendedProps.id,
    //   title: originalTitle,
    //   displayTitle: displayTitle,
    //   description: extendedProps.description,
    //   date: startDate,
    //   endDate: endDate,
    //   start: allDay ? '00:00' : startStr.split('T')[1]?.substring(0, 5) || '',
    //   end: allDay ? '23:59' : endStr?.split('T')[1]?.substring(0, 5) || '',
    //   allDay: allDay,
    //   calendarId: extendedProps.calendarId,
    //   calendarName: calendar?.name,
    //   color: backgroundColor,
    //   assignees,
    //   canEdit: calendar.iAmManager,
    // };
    // const dialogWidth = 400;
    // const dialogHeight = 300;
    // const screenWidth = window.innerWidth;
    // const screenHeight = window.innerHeight;
    // let top = item.jsEvent.clientY;
    // let left = item.jsEvent.clientX;
    // if (left + dialogWidth > screenWidth) {
    //   left = screenWidth - dialogWidth - 20;
    // }
    // if (top + dialogHeight > screenHeight) {
    //   top = screenHeight - dialogHeight - 20;
    // }
    // const dialogRef = this.dialog.open(EventOptionsComponent, {
    //   data: event,
    //   width: `${dialogWidth}px`,
    //   panelClass: 'event-options-panel',
    //   position: {
    //     top: `${top}px`,
    //     left: `${left}px`,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result?.action === 'edit') {
    //     this.openAddEventDialog(result.event);
    //   } else if (result?.action === 'delete') {
    //     const dialogDelete = this.dialog.open(DeleteConfirmationComponent, {
    //       data: {
    //         id: event.id,
    //         matchingString: event.title,
    //         name: event.title,
    //       },
    //     });
    //     dialogDelete.afterClosed().subscribe((result) => {
    //       if (result) {
    //         this.calendarEventsLoading.set(true);
    //         this.calendarsService.deleteEvent(event.id).subscribe({
    //           next: () => this.loadCalendarsAndEvents(true),
    //           error: (err) => {
    //             this.calendarEventsLoading.set(false);
    //             this.handleException(
    //               err,
    //               'There was a problem when attempting to delete.',
    //             );
    //           },
    //         });
    //       }
    //     });
    //   }
    // });
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
        this.calendarsService
          .delete(id)
          .pipe(switchMap(() => this.selectedCalendarIds$))
          .subscribe({
            next: (ids: string[]) => {
              delete this.calendarEventRecords[id];
              this.triggerGetCalendarList$.next(true);
              const updatedIds = ids.filter((calendarId) => calendarId !== id);
              this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { calendars: updatedIds.join(',') },
                queryParamsHandling: 'merge',
              });
            },
            error: (err) => {
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

  private mapEvents(events: CalendarEvent[]) {
    return events.map((e) => {
      let end = e.end?.replace(' ', 'T');

      if (e.allDay && e.end) {
        end = this.adjustDateByDays(e.end, 1);
      }

      const color = this.calendarsService.getCalendarColor(e.calendarId);

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

  private adjustDateByDays(dateString: string, days: number): string {
    const datePart = dateString.substring(0, 10);
    const date = new Date(`${datePart}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split('T')[0];
  }

  private getEventsInStore(selectedCalendarIds: string[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    selectedCalendarIds.forEach((id) => {
      const calendarEvents = this.calendarEventRecords[id];
      if (calendarEvents) {
        Object.values(calendarEvents).forEach((yearEvents) => {
          Object.values(yearEvents).forEach((monthEvents) => {
            events.push(...monthEvents);
          });
        });
      }
    });
    return [...new Map(events.map((e) => [e.id, e])).values()];
  }

  private addEventsToStore(
    events: CalendarEvent[],
    month: number,
    year: number,
    missingCalendarIds: string[],
  ) {
    missingCalendarIds.forEach((id) => {
      if (!this.calendarEventRecords[id]) {
        this.calendarEventRecords[id] = {};
        if (!this.calendarEventRecords[id][year]) {
          this.calendarEventRecords[id][year] = {};
        }
        if (!this.calendarEventRecords[id][year][month]) {
          this.calendarEventRecords[id][year][month] = [];
        }
      }
    });

    events.forEach((e) => {
      if (
        !this.calendarEventRecords[e.calendarId][year][month].some(
          (ev) => ev.id === e.id,
        )
      ) {
        this.calendarEventRecords[e.calendarId][year][month].push(e);
      }
    });
  }

  /**
   *
   * @param month The month for which to calculate the initial date (1-12)
   * @param year The year for which to calculate the initial date
   * @returns A Date object representing the initial date to be used in the calendar, which is the Sunday on or before the first day of the given month and year
   * This ensures that the calendar view always starts on a Sunday, even if the first day of the month is in the middle of the week
   */
  private getInitialDate(month: number, year: number): Date {
    const startOfMonth = new Date(year, month - 1, 1);
    const indexOfFirstDay = startOfMonth.getDay();
    const initialDate = new Date(startOfMonth);
    initialDate.setDate(initialDate.getDate() - indexOfFirstDay);
    return initialDate;
  }

  /**
   * @param date The date of the first Sunday of the calendar view
   * @returns The month (1-12) that should be used as the current month in the calendar view. If the given date is not the first day of the month
   * it returns the next month, otherwise it returns the month of the given date.
   * This is used to determine the current month when the calendar view starts on a Sunday that belongs to the previous month
   */
  private getCurrentMonthFromDate(date: Date): { month: number; year: number } {
    if (date.getDate() === 1) {
      return { month: date.getMonth() + 1, year: date.getFullYear() };
    }
    const nextMonth = new Date(date);
    nextMonth.setDate(nextMonth.getDate() + 7);
    return { month: nextMonth.getMonth() + 1, year: nextMonth.getFullYear() };
  }
}
