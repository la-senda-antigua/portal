import { Component, signal } from '@angular/core';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewType,
} from '../../components/table-view/table-view.component';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { VideosServiceBase } from '../../services/videos.service.base';

@Component({
  selector: 'app-page-base',
  imports: [],
  template: '',
})
export class PageBaseComponent {
  tableViewComponent!: TableViewComponent;
  editForm: any;
  createForm: any;
  deleteFields!: DeleteConfirmationData;
  tableCols!: TableViewColumn[];
  tableTitle!: string;
  readonly tableViewTypes = TableViewType;

  readonly dataSource = signal<TableViewDataSource>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    items: [],
    columns: this.tableCols,
  });
  readonly isLoading = signal(true);
  constructor(private service: VideosServiceBase){

  }
}
