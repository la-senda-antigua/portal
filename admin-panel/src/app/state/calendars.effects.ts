import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CalendarsActions, CalendarsApiActions } from './calendars.actions';
import { CalendarsService } from '../services/calendars.service';
import { map, mergeMap, catchError } from 'rxjs/operators';
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
}