import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DatesSetArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import {
  DeleteConfirmationData,
} from '../../components/delete-confirmation/delete-confirmation.component';
import { CalendarDto } from '../../models/CalendarDto';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { PortalUser } from '../../models/PortalUser';
import { CalendarsService } from '../../services/calendars.service';
import { CalendarsFacade, ExtendedCalendar } from './calendars.facade';
import { CalendarsDialogsService } from './calendars-dialogs.service';
import {
  DateRange,
  adjustDateByDays,
  buildEventUniqueKey,
  eventOverlapsRange,
  getEventsForCalendarIds,
  hydrateEventAssignees,
  isRangeCovered,
  mergeRanges,
  normalizeDialogEventDto,
  prepareCopyData,
  toCalendarEventInput,
} from './calendars.utils';

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
})
export class CalendarsComponent {
  /** Facade exposing calendars state, derived data and dispatch helpers. */
  readonly facade = inject(CalendarsFacade);
  /** Dialog orchestration for all calendars page modals. */
  readonly dialogs = inject(CalendarsDialogsService);
  /** Snackbar notifications for API errors and user feedback. */
  readonly snackBar = inject(MatSnackBar);
  /** Calendar data service and color assignment helper. */
  readonly service = inject(CalendarsService);

  readonly calendarEventsLoading = this.facade.calendarEventsLoading;
  /** True only until the initial calendar list and user list have been fetched. */
  readonly sidebarLoading = computed(
    () => !this.facade.calendarListLoaded() || !this.facade.usersLoaded(),
  );
  readonly error = this.facade.error;

  readonly users = this.facade.users;
  readonly usersById = this.facade.usersById;
  readonly currentUser = this.facade.currentUser;
  readonly myCalendars = this.facade.myCalendars;
  readonly calendarEventsByCalendarId = this.facade.calendarEventsByCalendarId;
  readonly loadedEventRangesByCalendarId =
    this.facade.loadedEventRangesByCalendarId;
  readonly loadingEventRangesByCalendarId =
    this.facade.loadingEventRangesByCalendarId;

  readonly selectedCalendars = this.facade.selectedCalendars;

  /** Current FullCalendar visible range in date-only format. */
  readonly viewRange = computed(() => {
    const dateSet = this.newCalendarViewDateSet();
    if (!dateSet?.startStr || !dateSet?.endStr) {
      return null;
    }

    return {
      startDate: dateSet.startStr.split('T')[0],
      endDate: dateSet.endStr.split('T')[0],
    };
  });
  /** Calendar ids that should be loaded into cache regardless of UI filter visibility. */
  readonly calendarIdsForDataLoad = computed(() =>
    this.myCalendars().map((c) => c.id!),
  );
  /**
   * Events for the current visible range.
   * Applies assignee hydration and range filtering before UI mapping.
   */
  readonly calendarViewEvents = computed(() => {
    const calendarIds = this.calendarIdsForDataLoad();
    const viewRange = this.viewRange();
    const usersById = this.usersById();

    if (!viewRange || calendarIds.length === 0) {
      return [];
    }

    return getEventsForCalendarIds(this.calendarEventsByCalendarId(), calendarIds)
      .map((event) => hydrateEventAssignees(event, usersById))
      .filter((event) => eventOverlapsRange(event, viewRange));
  });
  /**
   * Event list transformed into FullCalendar `EventInput` objects.
   * Applies selected-calendar visibility filter and deduplication.
   */
  readonly filteredEvents = computed(() => {
    const dedupedEvents = new Map<string, EventInput>();

    this.calendarViewEvents()
      .filter((event) => this.selectedCalendars().includes(event.calendarId))
      .forEach((event) => {
        const uniqueKey = buildEventUniqueKey(event);
        if (dedupedEvents.has(uniqueKey)) {
          return;
        }

        dedupedEvents.set(
          uniqueKey,
          toCalendarEventInput(event, (calendarId) =>
            this.service.getCalendarColor(calendarId),
          ),
        );
      });

    return Array.from(dedupedEvents.values());
  });

  // Calendar View State
  /** FullCalendar datesSet payload for the currently visible grid window. */
  readonly newCalendarViewDateSet = signal<DatesSetArg | undefined>(undefined);
  /**
   * Single batched load descriptor for the current view.
   * Returns null when all relevant ranges are already loaded/in-flight.
   */
  readonly pendingEventLoad = computed(() => {
    const viewRange = this.viewRange();
    if (!viewRange) {
      return null;
    }

    const loadedByCalendar = this.loadedEventRangesByCalendarId();
    const loadingByCalendar = this.loadingEventRangesByCalendarId();
    const calendarIds = this.calendarIdsForDataLoad().filter((calendarId) => {
      const loadedRanges = loadedByCalendar[calendarId] ?? [];
      const loadingRanges = loadingByCalendar[calendarId] ?? [];
      const coveredRanges = mergeRanges([
        ...loadedRanges,
        ...loadingRanges,
      ]);
      return !isRangeCovered(viewRange, coveredRanges);
    });

    if (calendarIds.length === 0) {
      return null;
    }

    return {
      startDate: viewRange.startDate,
      endDate: viewRange.endDate,
      calendarIds,
    };
  });

  // Calendar Configuration
  /** Static FullCalendar options. Dynamic events are bound from `filteredEvents()` in template. */
  readonly calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
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
    this.facade.loadInitialData();
    this.initializeEffects();
  }

  /** Toggle handler for "Select all" in the calendar sidebar filter. */
  toggleSelectAll(event: MatCheckboxChange) {
    const selectedIds = event.checked
      ? this.myCalendars().map((calendar) => calendar.id!)
      : [];

    this.facade.updateSelectedCalendars(selectedIds);
  }

  /** Selection-list change handler; persists selected calendar ids to user preferences. */
  onCalendarSelectionChange(event: MatSelectionListChange) {
    const selectedIds = event.source.selectedOptions.selected.map(
      (option) => option.value,
    );
    this.facade.updateSelectedCalendars(selectedIds);
  }

  /** Opens calendar edit options and dispatches update/delete actions based on dialog result. */
  showCalendarOptions(event: MouseEvent, calendar: ExtendedCalendar) {
    event.stopPropagation();

    this.dialogs.openEditCalendarDialog(calendar).subscribe((dialogCloseResult) => {
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
      this.facade.updateCalendar(calendar.id!, calendar);
    });
  }

  /** Opens the add calendar modal and dispatches create action on submit. */
  openAddCalendarModal() {
    this.dialogs.openAddCalendarDialog().subscribe((result) => {
      if (result) {
        this.facade.addCalendar(result.data);
      }
    });
  }

  /** Opens add/edit event dialog, normalizes payload, and dispatches add/update actions. */
  openAddOrEditEventDialog(eventData?: any): void {
    this.dialogs.openAddOrEditEventDialog(this.myCalendars(), eventData).subscribe((eventDto) => {
      if (!eventDto) {
        return;
      }
      const normalizedEventDto = normalizeDialogEventDto(eventDto);
      const isCopy = normalizedEventDto.trigger === 'copy';

      if (eventDto.id) {
        this.facade.updateEvent(normalizedEventDto.id, normalizedEventDto);
      } else {
        this.facade.addEvent(normalizedEventDto);
      }

      if (isCopy) {
        const assignees = normalizedEventDto.assignees
          .map((a: { userId: string }) => this.usersById().get(a.userId))
          .filter((u: PortalUser): u is PortalUser => !!u);
        const copyData = prepareCopyData({
          ...normalizedEventDto,
          assignees,
        });
        this.openAddOrEditEventDialog(copyData);
      }
    });
  }

  /** Registers reactive effects for preference restore, selection sync, and range loading. */
  private initializeEffects(): void {
    effect(() => this.facade.restoreCalendarSelectionFromPreferences());
    effect(() => this.facade.syncNewCalendarsIntoSelection(this.calendarIdsForDataLoad()));
    effect(() => this.dispatchPendingEventLoad());
    effect(() => this.showApiErrorToast());
  }

  /** Displays a generic API error snackbar when state error is populated. */
  private showApiErrorToast(): void {
    if (!this.error()) {
      return;
    }

    this.handleException(
      new Error(this.error()!),
      'There was a problem with your request',
    );
  }

  /** Dispatches a single batched events-range load when missing coverage exists. */
  private dispatchPendingEventLoad(): void {
    const pendingLoad = this.pendingEventLoad();
    if (!pendingLoad) {
      return;
    }

    this.facade.loadCalendarEventsRange(
      pendingLoad.startDate,
      pendingLoad.endDate,
      pendingLoad.calendarIds,
    );
  }

  /** Opens event context dialog and routes edit/delete actions. */
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

    const existingEvent = this.calendarViewEvents().find(
      (e) => e.id === extendedProps.id,
    );

    if (!existingEvent?.id) {
      return;
    }
    const existingEventId = existingEvent.id;

    const startDate = allDay ? startStr : startStr.split('T')[0];
    let endDate = startDate;

    if (endStr) {
      if (allDay) {
        endDate = adjustDateByDays(endStr, -1);
      } else {
        endDate = endStr.split('T')[0];
      }
    }

    const event = {
      ...existingEvent,
      calendarName: calendar.name,
      backgroundColor,
      canEdit: calendar.iAmManager,
      date: startDate,
      endDate: endDate,
      start: allDay ? '00:00' : startStr.split('T')[1]?.substring(0, 5) || '',
      end: allDay ? '23:59' : endStr?.split('T')[1]?.substring(0, 5) || '',
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

    this.dialogs.openEventOptionsDialog(event, top, left).subscribe((result) => {
      if (result?.action === 'edit') {
        this.openAddOrEditEventDialog(result.event);
      } else if (result?.action === 'delete') {
        const deleteConfirmationData: DeleteConfirmationData = {
          id: existingEventId,
          requestMatchingString: false,
          prompt: `Are you sure you want to delete ${displayTitle}?`,
        };

        this.dialogs.openDeleteConfirmationDialog(deleteConfirmationData).subscribe((result) => {
          if (result) {
            this.facade.removeEvent(existingEventId);
          }
        });
      }
    });
  }

  /** Opens delete confirmation for a calendar and dispatches removal when confirmed. */
  deleteCalendar(id: string, name: string) {
    this.dialogs
      .openDeleteConfirmationDialog({
        id,
        requestMatchingString: false,
        prompt: `Are you sure you want to delete ${name}?`,
      } as DeleteConfirmationData)
      .subscribe((result) => {
      if (result) {
        this.facade.removeCalendar(id);
      }
    });
  }

  /** Standardized local error display helper. */
  private handleException(e: Error, message: string): void {
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }
}
