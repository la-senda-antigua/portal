import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewType,
} from '../../components/table-view/table-view.component';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { GeneralServiceBase } from '../../services/general.service.base';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { VideoFormData } from '../../components/edit-video-form/edit-video-form.component';
import { EditIdNameFormData } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { CalendarFormData } from '../../components/edit-calendar-form/edit-calendar-form.component';
import { DisableConfirmationData } from '../../components/disable-confirmation/disable-confirmation.component';

@Component({
  selector: 'app-page-base',
  imports: [],
  template: '',
  providers: [DatePipe],
})
export class PageBaseComponent implements OnInit {
  tableViewComponent!: Signal<TableViewComponent | undefined>;
  editForm: any;
  createForm: any;
  deleteFields!: DeleteConfirmationData;
  disableFields!: DisableConfirmationData;
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
  readonly datePipe = inject(DatePipe);
  readonly snackBar = inject(MatSnackBar);
  constructor(
    protected service: GeneralServiceBase,    
  ) {}

  ngOnInit(): void {
    this.load(1, 10);
  }

  load(page: number, pageSize: number): void {}

  onPageChange(event: PageEvent) {
    this.load(event.pageIndex + 1, event.pageSize);
  }

  onDelete(id: string) {
    this.isLoading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem when attempting to delete.'
        );
      },
    });
  }
  
  onToggleDisable(data: any) {
    const {id, actionName} = data
    const isActive = actionName === 'disable'
    this.isLoading.set(true);
    this.service.disable(id, isActive).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem when attempting to disable.'
        );
      },
    });
  }

  onEdit(form: VideoFormData) {
    this.isLoading.set(true);
    const video = this.parseForm(form) as any;
    this.service.edit(video).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem updating.');
      },
    });
  }

  onAdd(form: VideoFormData) {
    this.isLoading.set(true);
    const video = this.parseForm(form);
    this.service.add(video).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the item.');
      },
    });
  }

  parseForm(videoForm: VideoFormData | EditIdNameFormData | CalendarFormData) {}

  handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  protected reload() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.load(pageIndex + 1, pageSize);
  }
}
