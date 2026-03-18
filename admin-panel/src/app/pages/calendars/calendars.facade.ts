import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Calendar, CalendarDto } from '../../models/CalendarDto';
import { CalendarEvent } from '../../models/CalendarEvent';
import { PortalUser, UserRole } from '../../models/PortalUser';
import { AuthService } from '../../services/auth.service';
import { CalendarsService } from '../../services/calendars.service';
import {
  selectCalendarEventsByRange,
  selectCalendarEventsLoading,
  selectCalendars,
  selectCalendarsLoaded,
  selectError,
  selectLoadedEventRangesByCalendarId,
  selectLoadingCalendars,
  selectLoadingEventRangesByCalendarId,
  selectUsers,
  selectUsersLoaded,
  selectUsersLoading,
} from '../../state/appstate.selectors';
import { CalendarsActions } from '../../state/calendars.actions';
import { UsersActions } from '../../state/users.actions';

export interface ExtendedCalendar extends Calendar {
  iAmManager: boolean;
  color: string;
}

export const LAST_SELECTED_CALENDARS_KEY = 'lastSelectedCalendars';

@Injectable({ providedIn: 'root' })
export class CalendarsFacade {
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly calendarsService = inject(CalendarsService);

  readonly currentUserId = this.authService.currentUserId;
  readonly isAdmin = this.authService.hasRole(UserRole.Admin);

  readonly calendarEventsLoading = this.store.selectSignal(
    selectCalendarEventsLoading,
  );
  readonly calendarListLoading = this.store.selectSignal(selectLoadingCalendars);
  readonly calendarListLoaded = this.store.selectSignal(selectCalendarsLoaded);
  readonly usersLoading = this.store.selectSignal(selectUsersLoading);
  readonly usersLoaded = this.store.selectSignal(selectUsersLoaded);
  readonly error = this.store.selectSignal(selectError);

  readonly users = this.store.selectSignal(selectUsers);
  readonly calendarEventsByCalendarId = this.store.selectSignal(
    selectCalendarEventsByRange,
  );
  readonly loadedEventRangesByCalendarId = this.store.selectSignal(
    selectLoadedEventRangesByCalendarId,
  );
  readonly loadingEventRangesByCalendarId = this.store.selectSignal(
    selectLoadingEventRangesByCalendarId,
  );

  readonly calendars: Signal<ExtendedCalendar[]> = computed(() =>
    this.store
      .selectSignal(selectCalendars)()
      .map((calendar) => ({
        ...calendar,
        color: this.calendarsService.getCalendarColor(calendar.id!),
        iAmManager:
          this.isAdmin ||
          (calendar.managers?.some((m) => m.userId === this.currentUserId) ?? false),
      })),
  );

  readonly myCalendars = computed(() =>
    this.calendars().filter((calendar) => calendar.iAmManager),
  );
  readonly usersById = computed(
    () => new Map(this.users().map((user) => [user.userId, user])),
  );
  readonly currentUser = computed(() =>
    this.users().find((user) => user.userId === this.currentUserId),
  );

  readonly selectedCalendars = signal<string[]>([]);
  private readonly knownManagedCalendarIds = signal<string[]>([]);
  private hasRestoredPreferences = false;

  loadInitialData(): void {
    if (!this.calendarListLoaded() && !this.calendarListLoading()) {
      this.store.dispatch(CalendarsActions.loadCalendars());
    }

    if (!this.usersLoaded() && !this.usersLoading()) {
      this.store.dispatch(UsersActions.loadUsers());
    }
  }

  restoreCalendarSelectionFromPreferences(): void {
    if (this.hasRestoredPreferences) {
      return;
    }

    const currentUser = this.currentUser();

    if (!currentUser) {
      return;
    }

    this.hasRestoredPreferences = true;

    const preferencesString = currentUser.preferences ?? '{}';
    let preferences = { [LAST_SELECTED_CALENDARS_KEY]: [] as string[] };

    try {
      preferences = JSON.parse(preferencesString);
    } catch (error) {
      console.error('Error parsing user preferences: ', error);
    }

    this.selectedCalendars.set(preferences[LAST_SELECTED_CALENDARS_KEY] ?? []);
  }

  syncNewCalendarsIntoSelection(managedCalendarIds: string[]): void {
    const knownManagedIds = this.knownManagedCalendarIds();

    if (managedCalendarIds.length === 0) {
      return;
    }

    if (knownManagedIds.length === 0) {
      this.knownManagedCalendarIds.set([...managedCalendarIds]);
      return;
    }

    if (this.haveSameIds(knownManagedIds, managedCalendarIds)) {
      return;
    }

    const knownSet = new Set(knownManagedIds);
    const newCalendarIds = managedCalendarIds.filter((id) => !knownSet.has(id));

    if (newCalendarIds.length > 0) {
      this.selectedCalendars.set(
        Array.from(new Set([...this.selectedCalendars(), ...newCalendarIds])),
      );
    }

    this.knownManagedCalendarIds.set([...managedCalendarIds]);
  }

  updateSelectedCalendars(selectedIds: string[]): void {
    if (this.haveSameIds(this.selectedCalendars(), selectedIds)) {
      return;
    }

    this.selectedCalendars.set(selectedIds);

    const currentUser = this.currentUser();
    if (!currentUser) {
      return;
    }

    const updatedUser: PortalUser = {
      ...currentUser,
      calendarsAsManager: currentUser.calendarsAsManager?.map((m) => m.id) ?? [],
      calendarsAsMember: currentUser.calendarsAsMember?.map((m) => m.id) ?? [],
      preferences: JSON.stringify({
        [LAST_SELECTED_CALENDARS_KEY]: selectedIds,
      }),
    };

    this.store.dispatch(
      UsersActions.updateUser({
        userId: updatedUser.userId,
        user: updatedUser,
      }),
    );
  }

  loadCalendarEventsRange(
    startDate: string,
    endDate: string,
    calendarIds: string[],
  ): void {
    this.store.dispatch(
      CalendarsActions.loadCalendarEventsRange({
        startDate,
        endDate,
        calendarIds,
      }),
    );
  }

  addCalendar(calendar: CalendarDto): void {
    this.store.dispatch(CalendarsActions.addCalendar({ calendar }));
  }

  updateCalendar(calendarId: string, calendar: CalendarDto): void {
    this.store.dispatch(CalendarsActions.updateCalendar({ calendarId, calendar }));
  }

  removeCalendar(calendarId: string): void {
    this.store.dispatch(CalendarsActions.removeCalendar({ calendarId }));
  }

  addEvent(event: CalendarEvent): void {
    this.store.dispatch(CalendarsActions.addEvent({ event }));
  }

  updateEvent(eventId: string, event: CalendarEvent): void {
    this.store.dispatch(CalendarsActions.updateEvent({ eventId, event }));
  }

  removeEvent(eventId: string): void {
    this.store.dispatch(CalendarsActions.removeEvent({ eventId }));
  }

  private haveSameIds(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const setA = new Set(a);
    return b.every((id) => setA.has(id));
  }
}
