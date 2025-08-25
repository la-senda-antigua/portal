import { Component, viewChild } from '@angular/core';
import { TableViewColumn, TableViewComponent } from '../../components/table-view/table-view.component';
import { DatePipe } from '@angular/common';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent } from '../../models/CalendarEvent';
import { EditCalendarFormComponent, CalendarFormData } from '../../components/edit-calendar-form/edit-calendar-form.component';

@Component({
  selector: 'app-calendar',
  imports: [TableViewComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [DatePipe],
})
export class CalendarComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditCalendarFormComponent;
  override createForm = EditCalendarFormComponent;
  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'StartTime', datasourceName: 'statTime' },
    { displayName: 'EndTime', datasourceName: 'endTime' },
    { displayName: 'Status', datasourceName: 'status' },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'id',
    name: 'title',
  };
  override tableTitle = 'Calendar Events';

  constructor(service: CalendarService) {
    super(service);
  }

  override load(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getPage(page, pageSize).subscribe({
      next: (response) => {
        const item = response.items.map((s: CalendarEvent) => ({
          id: s.id,
          title: s.title,
          startTime: this.datePipe.transform(s.startTime, 'yyyy-MM-dd'),
          endTime: this.datePipe.transform(s.endTime, 'yyyy-MM-dd'),
          description: s.description,          
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: item,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading calendar.');
      },
    });
  }

  override parseForm(calendarForm: CalendarFormData): CalendarEvent {
    const item = {
      title: calendarForm.data.title,
      startTime: calendarForm.data.startTime,
      endTime: calendarForm.data.endTime,
      description: calendarForm.data.description
    } as CalendarEvent;
    if (calendarForm.data.id != undefined) {
      item['id'] = calendarForm.data.id;
    }

    return item;
  }

}
