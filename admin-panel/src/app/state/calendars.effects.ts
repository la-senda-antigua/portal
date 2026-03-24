import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CalendarsActions, CalendarsApiActions } from './calendars.actions';
import { CalendarsService } from '../services/calendars.service';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class CalendarsEffects {
    private readonly actions$ = inject(Actions);
    private readonly calendarsService = inject(CalendarsService);

    loadCalendars$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CalendarsActions.loadCalendars),
            mergeMap(() =>
                this.calendarsService.getMyCalendars().pipe(
                    map(calendars => CalendarsApiActions.loadCalendarsSuccess({ calendars })),
                    catchError(error => of(CalendarsApiActions.loadCalendarsFailure({ error })))
                )
            )
        )
    );

    createCalendar$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CalendarsActions.addCalendar),
            mergeMap(({ calendar }) =>
                this.calendarsService.add(calendar).pipe(
                    map(newCalendar => CalendarsApiActions.addCalendarSuccess({ calendar: newCalendar })),
                    catchError(error => of(CalendarsApiActions.addCalendarFailure({ error })))
                )
            )
        )
    );

    updateCalendar$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CalendarsActions.updateCalendar),
            mergeMap(({ calendarId, calendar }) =>
                this.calendarsService.edit(calendar).pipe(
                    map(updatedCalendar => CalendarsApiActions.updateCalendarSuccess({ calendarId, calendar: updatedCalendar })),
                    catchError(error => of(CalendarsApiActions.updateCalendarFailure({ error })))
                )
            )
        )
    );

    deleteCalendar$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CalendarsActions.removeCalendar),
            mergeMap(({ calendarId }) =>
                this.calendarsService.delete(calendarId).pipe(
                    map(() => CalendarsApiActions.removeCalendarSuccess({ calendarId })),
                    catchError(error => of(CalendarsApiActions.removeCalendarFailure({ error })))
                )
            )
        )
    );

    loadCalendarEventsRange$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarsActions.loadCalendarEventsRange),
        mergeMap(({ startDate, endDate, calendarIds }) =>
          this.calendarsService.getEventsByDates(startDate, endDate, calendarIds).pipe(
            map(events =>
              CalendarsApiActions.loadCalendarEventsRangeSuccess({
                startDate,
                endDate,
                calendarIds,
                events,
              }),
            ),
            catchError(error =>
              of(
                CalendarsApiActions.loadCalendarEventsRangeFailure({
                  startDate,
                  endDate,
                  calendarIds,
                  error,
                }),
              ),
            ),
          ),
        ),
      ),
    );

    updateEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarsActions.updateEvent),
        switchMap(({ event }) =>
          this.calendarsService.updateEvent(event).pipe(
            map(updatedEvent =>
              CalendarsApiActions.updateEventSuccess({ event: updatedEvent }),
            ),
            catchError(error =>
              of(CalendarsApiActions.updateEventFailure({ error })),
            ),
          ),
        ),
      ),
    );

    addEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarsActions.addEvent),
        switchMap(({ event }) =>
          this.calendarsService.addEvent(event).pipe(
            map(newEvent =>
              CalendarsApiActions.addEventSuccess({ event: newEvent }),
            ),
            catchError(error => of(CalendarsApiActions.addEventFailure({ error }))),
          ),
        ),
      ),
    );

    removeEvent$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CalendarsActions.removeEvent),
        switchMap(({ eventId }) =>
          this.calendarsService.deleteEvent(eventId).pipe(
            map(() =>
              CalendarsApiActions.removeEventSuccess({ eventId }),
            ),
            catchError(error =>
              of(CalendarsApiActions.removeEventFailure({ error })),
            ),
          ),
        ),
      ),
    );
}
