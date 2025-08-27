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
    
    private loadEvents(): void {
        this.httpClient.get<CalendarEventModel[]>(`${this.baseUrl}/GetEvents`)
        .subscribe(res=> {
            this.calendarEventList.set(res)
        })        
    }
}