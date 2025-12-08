import { Component, viewChild } from '@angular/core';
import {
  TableViewColumn,
  TableViewComponent,
} from '../../components/table-view/table-view.component';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { PublicEventsService } from '../../services/publicEvent.service';
import { PublicEvent } from '../../models/PublicEvent';
import {
  EditPublicEventFormComponent,
  PublicEventFormData,
} from '../../components/edit-public-event-form/edit-public-event-form.component';
import { DisableConfirmationData } from '../../components/disable-confirmation/disable-confirmation.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-public-event',
  imports: [TableViewComponent],
  templateUrl: './public-event-list-view.component.html',
  styleUrl: './public-event-list-view.component.scss',
  providers: [DatePipe],
})
export class PublicEventComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditPublicEventFormComponent;
  override createForm = EditPublicEventFormComponent;
  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'Description', datasourceName: 'description' },
    { displayName: 'StartTime', datasourceName: 'startTime' },
    { displayName: 'EndTime', datasourceName: 'endTime' },
    { displayName: 'Status', datasourceName: 'status' },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'id',
    name: 'title',
  };

  override disableFields: DisableConfirmationData = {
    id: 'id',
    name: 'title',
    actionName: 'disable',
  };

  override tableTitle = 'Calendar Events';

  constructor(service: PublicEventsService) {
    super(service);
  }

  override load(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getPage(page, pageSize).subscribe({
      next: (response) => {
        const item = response.items.map((s: PublicEvent) => ({
          id: s.id,
          title: s.title,
          startTime: this.datePipe.transform(s.startTime, 'YYYY-MM-dd hh:mm a') ?? s.startTime,
          endTime: this.datePipe.transform(s.endTime, 'YYYY-MM-dd hh:mm a') ?? s.endTime,

          description: s.description,
          status: s.status,
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

  override parseForm(calendarForm: PublicEventFormData): PublicEvent {
    const item = {
      title: calendarForm.data.title,
      startTime: calendarForm.data.startTime,
      endTime: calendarForm.data.endTime,
      description: calendarForm.data.description,
    } as PublicEvent;
    if (calendarForm.data.id != undefined) {
      item['id'] = calendarForm.data.id;
    }

    return item;
  }
}
