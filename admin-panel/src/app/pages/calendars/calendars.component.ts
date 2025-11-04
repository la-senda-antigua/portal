import { Component, viewChild } from '@angular/core';
import {
  TableViewComponent,
  TableViewColumn,
} from '../../components/table-view/table-view.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { CalendarsService } from '../../services/calendars.service';
import { CalendarDto } from '../../models/CalendarDto';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendars',
  imports: [TableViewComponent],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  providers: [DatePipe],
})
export class CalendarsComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override tableCols: TableViewColumn[] = [
    { displayName: 'Name', datasourceName: 'name' },
  ];
  override tableTitle = 'My Calendars';

  constructor(service: CalendarsService) {
    super(service);
  }

  override load(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getMyPage(page, pageSize).subscribe({
      next: (response) => {
        const items = response.items.map((c: CalendarDto) => ({
          id: c.id,
          name: c.name,
          active: c.active
        }))

        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          columns: this.tableCols,
          items
        });

        this.isLoading.set(false);
      },
      error: (err)=> {
        this.handleException(err, 'There was an error loading my calendars.');
      }
    })
  }
}
