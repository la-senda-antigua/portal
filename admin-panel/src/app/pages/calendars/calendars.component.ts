import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { Calendar, CalendarDto } from '../../models/CalendarDto';
import { CalendarsService } from '../../services/calendars.service';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DatesSetArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Store } from '@ngrx/store';
import { AddEventDialogComponent } from '../../components/add-event-dialog/add-event-dialog.component';
import {
  DeleteConfirmationComponent,
  DeleteConfirmationData,
} from '../../components/delete-confirmation/delete-confirmation.component';
import {
  CalendarFormData,
  EditCalendarFormComponent,
} from '../../components/edit-calendar-form/edit-calendar-form.component';
import { EventOptionsComponent } from '../../components/event-options/event-options.component';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { PortalUser, UserRole } from '../../models/PortalUser';
import { AuthService } from '../../services/auth.service';
import {
  selectCalendarEventsByRange,
  selectCalendarEventsLoading,
  selectCalendars,
  selectCalendarsLoaded,
  selectLoadingCalendars,
  selectUsers,
  selectUsersLoaded,
} from '../../state/appstate.selectors';
import { CalendarsActions } from '../../state/calendars.actions';
import { UsersActions } from '../../state/users.actions';

interface ExtendedCalendar extends Calendar {
  iAmManager: boolean;
  color: string;
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
    RouterLink,
  ],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent {
  // Injected Services
  readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);
  readonly store = inject(Store);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly service = inject(CalendarsService);

  // Auth & User Info
  readonly currentUserId = this.authService.currentUserId;
  readonly isAdmin = this.authService.hasRole(UserRole.Admin);

  // Store Selectors (Observable)
  readonly calendars$ = this.store.select(selectCalendars);
  readonly calendarsLoaded$ = this.store.select(selectCalendarsLoaded);
  readonly usersLoaded$ = this.store.select(selectUsersLoaded);

  // Store Signals - Loading States
  readonly calendarEventsLoading = this.store.selectSignal(
    selectCalendarEventsLoading,
  );
  readonly calendarListLoading = this.store.selectSignal(
    selectLoadingCalendars,
  );
  readonly calendarListLoaded = this.store.selectSignal(selectCalendarsLoaded);
  readonly usersLoading = this.store.selectSignal(selectLoadingCalendars);
  readonly usersLoaded = this.store.selectSignal(selectUsersLoaded);

  // Store Signals - Data
  readonly users = this.store.selectSignal(selectUsers);
  readonly calendars: Signal<ExtendedCalendar[]> = computed(() =>
    this.store
      .selectSignal(selectCalendars)()
      .map((c) => ({
        ...c,
        color: this.service.getCalendarColor(c.id!),
        iAmManager:
          this.isAdmin ||
          (c.managers?.some((m) => m.userId === this.currentUserId) ?? false),
      })),
  );

  // Computed Data
  readonly myCalendars = computed(() =>
    this.calendars().filter((c) => c.iAmManager),
  );
  readonly currentUser = computed(() =>
    this.users().find((u) => u.userId === this.currentUserId),
  );
  readonly calendarViewEvents = computed(() => {
    if (this.shouldLoadEvents()) {
      return [];
    }
    return this.store.selectSignal(selectCalendarEventsByRange)()[
      this.eventHashKey()
    ];
  });
  readonly filteredEvents = computed(() => {
    const uniqueEvents = new Map<string, any>();
    this.calendarViewEvents()
      .filter((e) => e.id!! && this.selectedCalendars().includes(e.calendarId))
      .forEach((e) => {
        if (uniqueEvents.has(e.id!)) return;
        let end = e.end?.replace(' ', 'T');
        if (e.allDay && e.end) {
          end = this.adjustDateByDays(e.end, 1);
        }
        const color = this.service.getCalendarColor(e.calendarId);
        uniqueEvents.set(e.id!, {
          title: e.displayTitle ?? e.title,
          backgroundColor: color,
          borderColor: color,
          start: e.start?.replace(' ', 'T'),
          end: end,
          allDay: e.allDay,
          extendedProps: {
            calendarId: e.calendarId,
            description: e.description,
            id: e.id!,
            originalTitle: e.title,
            displayTitle: e.displayTitle,
          },
        } as EventInput);
      });

    return Array.from(uniqueEvents.values());
  });

  // User State
  readonly selectedCalendars = signal<string[]>([]);

  // Calendar View State
  readonly newCalendarViewDateSet = signal<DatesSetArg | undefined>(undefined);
  readonly eventHashKey = computed(() => {
    if (
      !this.newCalendarViewDateSet()?.startStr ||
      !this.newCalendarViewDateSet()?.endStr
    ) {
      return '';
    }
    const { startStr, endStr } = this.newCalendarViewDateSet() ?? {
      start: new Date(),
    };

    const startDateStr = startStr!.split('T')[0];
    const endDateStr = endStr!.split('T')[0];
    const calendarIds = this.myCalendars().map((c) => c.id!);
    return this.buildEventsCacheKey(startDateStr, endDateStr, calendarIds);
  });
  readonly shouldLoadEvents = computed(() => {
    const cacheKey = this.eventHashKey();
    if (!cacheKey) {
      return false;
    }
    const eventsInCache = this.store.selectSignal(
      selectCalendarEventsByRange,
    )();
    return !Object.prototype.hasOwnProperty.call(eventsInCache, cacheKey);
  });

  // Calendar Configuration
  readonly calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    events: [] as EventInput,
    datesSet: (args: DatesSetArg) => this.newCalendarViewDateSet.set(args),
    displayEventTime: true,
    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: true,
    },
    eventClick: (info: any) => this.showEventOptions(info),
    dateClick: (inf: DateClickArg) => this.openAddOrEditEventDialog(inf),
  };

  constructor() {
    if (!this.calendarListLoaded() && !this.calendarListLoading()) {
      this.store.dispatch(CalendarsActions.loadCalendars());
    }
    if (!this.usersLoaded() && !this.usersLoading()) {
      this.store.dispatch(UsersActions.loadUsers());
    }

    effect(() => {
      const currentUser = this.currentUser();

      if (!currentUser || this.selectedCalendars().length > 0) {
        return;
      }

      const preferencesString = currentUser?.preferences ?? '{}';
      let preferences = { [LAST_SELECTED_CALENDARS_KEY]: [] };
      try {
        preferences = JSON.parse(preferencesString);
      } catch (error) {
        console.error('Error parsing user preferences: ', error);
      } finally {
        this.selectedCalendars.set(
          preferences[LAST_SELECTED_CALENDARS_KEY] ?? [],
        );
      }
    });
    effect(() => {
      if (this.shouldLoadEvents()) {
        const { startDate, endDate, calendarIds } = this.parseCacheKey(
          this.eventHashKey(),
        );
        this.store.dispatch(
          CalendarsActions.loadCalendarEventsRange({
            cacheKey: this.eventHashKey(),
            startDate,
            endDate,
            calendarIds,
          }),
        );
      }
    });
    effect(() => {
      this.calendarOptions.events = this.filteredEvents();
    });
  }

  toggleSelectAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedCalendars.set(this.myCalendars().map((c) => c.id!));
    } else {
      this.selectedCalendars.set([]);
    }
    const e: MatSelectionListChange = {
      source: {
        selectedOptions: {
          selected: this.selectedCalendars().map((id) => ({
            value: id,
          })) as any,
        },
      } as any,
      options: [] as any,
    };
    this.onCalendarSelectionChange(e);
  }

  onCalendarSelectionChange(event: MatSelectionListChange) {
    this.selectedCalendars.set(
      event.source.selectedOptions.selected.map((option) => option.value),
    );

    const preferences = {
      [LAST_SELECTED_CALENDARS_KEY]: this.selectedCalendars,
    };
    const updatedUser: PortalUser = {
      ...this.currentUser()!,
      preferences: JSON.stringify(preferences),
    };
    this.store.dispatch(
      UsersActions.updateUser({
        userId: updatedUser.userId,
        user: updatedUser,
      }),
    );
  }

  showCalendarOptions(event: MouseEvent, calendar: ExtendedCalendar) {
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

    dialogRef.afterClosed().subscribe((dialogCloseResult) => {
      if (!dialogCloseResult) return;

      const { data } = dialogCloseResult;
      if (data.action === 'delete') {
        this.deleteCalendar(data.id, data.name);
        return;
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
      this.store.dispatch(
        CalendarsActions.updateCalendar({
          calendarId: calendar.id!,
          calendar,
        }),
      );
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
        this.store.dispatch(
          CalendarsActions.addCalendar({ calendar: result.data }),
        );
      }
    });
  }

  openAddOrEditEventDialog(eventData?: any): void {
    let assignees: PortalUser[] = [];
    if (eventData?.id) {
      assignees =
        this.calendarViewEvents().find((e) => e.id === eventData.id)
          ?.assignees || [];
      eventData.assignees = assignees;
    }

    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width: '500px',
      maxHeight: '95vh',
      data: {
        calendars: this.myCalendars(),
        event: eventData,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }
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
        this.store.dispatch(
          CalendarsActions.updateEvent({ eventId: result.id, event: result }),
        );
      } else {
        this.store.dispatch(CalendarsActions.addEvent({ event: result }));
      }

      if (isCopy) {
        const copyData = this.prepareCopyData(result);
        this.openAddOrEditEventDialog(copyData);
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
    const calendar = this.myCalendars().find(
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
      this.filteredEvents().find((e) => e.id === extendedProps.id)?.assignees ||
      [];
    const originalTitle = this.filteredEvents().find(
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
        this.openAddOrEditEventDialog(result.event);
      } else if (result?.action === 'delete') {
        const deleteConfirmationData: DeleteConfirmationData = {
          id: event.id,
          requestMatchingString: false,
          prompt: `Are you sure you want to delete ${displayTitle}?`,
        };
        const dialogDelete = this.dialog.open(DeleteConfirmationComponent, {
          data: deleteConfirmationData,
        });

        dialogDelete.afterClosed().subscribe((result) => {
          if (result) {
            this.store.dispatch(
              CalendarsActions.removeEvent({ eventId: event.id! }),
            );
          }
        });
      }
    });
  }

  deleteCalendar(id: string, name: string) {
    const dialogDelete = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        id: id,
        requestMatchingString: false,
        prompt: `Are you sure you want to delete ${name}?`,
      } as DeleteConfirmationData,
    });

    dialogDelete.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(
          CalendarsActions.removeCalendar({ calendarId: id }),
        );
      }
    });
  }

  handleException(e: Error, message: string) {
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

  private buildEventsCacheKey(
    startDate: string,
    endDate: string,
    calendarIds: string[],
  ): string {
    const sortedIds = [...calendarIds].sort();
    return [startDate, endDate, sortedIds.join(',')].join('|');
  }

  private parseCacheKey(cacheKey: string): {
    startDate: string;
    endDate: string;
    calendarIds: string[];
  } {
    const [startDate, endDate, calendarIdsStr] = cacheKey.split('|');
    const calendarIds = calendarIdsStr ? calendarIdsStr.split(',') : [];
    return { startDate, endDate, calendarIds };
  }
}
