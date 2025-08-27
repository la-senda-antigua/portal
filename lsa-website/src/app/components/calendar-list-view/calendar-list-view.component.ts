import { Component, effect, input, OnInit, signal } from '@angular/core';
import { CalendarListViewConfig } from 'src/app/models/app.config.models';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CalendarEventService } from 'src/app/services/calendar-events.service';
import { CalendarEventModel } from 'src/app/models/calendar-event.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lsa-calendar-list-view',
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './calendar-list-view.component.html',
  styleUrl: './calendar-list-view.component.scss',
})
export class CalendarListViewComponent implements OnInit {
  readonly config = input.required<CalendarListViewConfig>();

  constructor(public calendarEventService: CalendarEventService) {    
  }

  ngOnInit(): void {    
    this.calendarEventService.loadEvents();
  }
}
