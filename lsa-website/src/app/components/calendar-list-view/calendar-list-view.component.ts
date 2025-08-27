import { Component, input } from '@angular/core';
import { CalendarListViewConfig } from 'src/app/models/app.config.models';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'lsa-calendar-list-view',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './calendar-list-view.component.html',
  styleUrl: './calendar-list-view.component.scss',
})
export class CalendarListViewComponent {
  readonly config = input.required<CalendarListViewConfig>();  
}
