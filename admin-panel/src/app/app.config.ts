import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { appStateReducer } from './state/appstate.reducer';
import { UsersEffects } from './state/users.effects';
import { CalendarsEffects } from './state/calendars.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ appState: appStateReducer }),
    provideEffects(UsersEffects, CalendarsEffects),
  ],
};
