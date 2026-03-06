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
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
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
  readonly currentUserId = computed(() => this.authService().currentUserId);
  readonly calendarEventRecords: Record<
    number,
    Record<number, Record<string, CalendarEvent[]>>
  > = {};

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

  readonly myCalendars$: Observable<ExtendedCalendar[]> = this.calendarsService
    .getMyCalendars()
    .pipe(
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
  readonly calendarListLoading$ = this.myCalendars$.pipe(
    map(() => false),
    startWith(true),
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
          !this.calendarEventRecords[year] ||
          !this.calendarEventRecords[year][month] ||
          !this.calendarEventRecords[year][month][id],
      );
      const existingEvents: CalendarEvent[] = Object.values(this.calendarEventRecords).flatMap((yearRecords) =>
        Object.values(yearRecords).flatMap((monthRecords) =>
          Object.values(monthRecords).flatMap((events) =>
            events.filter((e) => selectedCalendarIds.includes(e.calendarId)),
          ),
        ),
      );
      if (!missingCalendarIds.length) {
        return of(existingEvents);
      }
      return this.calendarsService
        .getMonthEvents(month, year, missingCalendarIds)
        .pipe(
          map((events) => {
            events.forEach((e) => {
              if (!this.calendarEventRecords[year]) {
                this.calendarEventRecords[year] = {};
              }
              if (!this.calendarEventRecords[year][month]) {
                this.calendarEventRecords[year][month] = {};
              }
              if (!this.calendarEventRecords[year][month][e.calendarId]) {
                this.calendarEventRecords[year][month][e.calendarId] = [];
              }
              if (!this.calendarEventRecords[year][month][e.calendarId].some((ev) => ev.id === e.id)) {
                this.calendarEventRecords[year][month][e.calendarId].push(e);
              }
            });
            return [...existingEvents, ...events];
          }),
        );
    }),
    catchError(() => of([] as CalendarEvent[])),
    map((events) => this.mapEvents(events)),
  );

  readonly calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: [] as EventInput,
    datesSet: (args) => this.calendarMonthChange(args),
    displayEventTime: true,
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
    },
    eventClick: (info: any) => this.showEventOptions(info),
    dateClick: (inf: any) => this.openAddEventDialog(inf),
  };

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.calendarEvents$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((events) => {
        this.calendarOptions.events = events;
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
    const month = datesSet.start.getMonth() + 1;
    const year = datesSet.start.getFullYear();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { month, year },
      queryParamsHandling: 'merge',
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
          return this.calendarsService.edit(calendar);
        }),
        catchError(() => of(null)),
      )
      .subscribe((result) => {
        if (result != null) {
          // this.loadCalendarsAndEvents(true);
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
          next: (response) => {
            let calendarWithColor = {
              ...result.data,
              color: this.calendarsService.getCalendarColor(response.id!),
            };
            calendarWithColor.id = response.id;
            calendarWithColor.iamManager = true;
            // this.myCalendars$.push(calendarWithColor);
            // this.selectedCalendarIds.push(calendarWithColor.id!);
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

    // dialogDelete.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.calendarEventsLoading.set(true);
    //     this.calendarsService.delete(id).subscribe({
    //       next: () => this.loadCalendarsAndEvents(true),
    //       error: (err) => {
    //         this.calendarEventsLoading.set(false);
    //         this.handleException(err, err.error);
    //       },
    //     });
    //   }
    // });
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
