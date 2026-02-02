import { inject, Injectable, signal, Signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CalendarEventModel } from '../models/calendar-event.model';
import { HttpClient } from '@angular/common/http';
@Injectable({
    providedIn: 'root',
})
export class CalendarEventService {
    private baseUrl = environment.apiUrl;
    private httpClient = inject(HttpClient);
    calendarEventList = signal<CalendarEventModel[]>([]);
    loading = signal<boolean>(false);

    loadEvents(): void {
        this.loading.set(true);
        this.httpClient.get<CalendarEventModel[]>(`${this.baseUrl}/calendars/GetPublicEvents`)
        .subscribe(res=> {
            this.calendarEventList.set(res)
            this.loading.set(false);
        })
    }
}
