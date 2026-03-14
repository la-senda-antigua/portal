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
  constructor(protected service: GeneralServiceBase) {}

  ngOnInit(): void {
    this.load(1, 10);
    this.dataSource.update((ds) => ({ ...ds, columns: this.tableCols }));
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
          'There was a problem when attempting to delete.',
        );
      },
    });
  }

  onToggleDisable(data: any) {
    const { id, actionName } = data;
    const isActive = actionName === 'disable';
    this.isLoading.set(true);
    this.service.disable(id, isActive).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem when attempting to disable.',
        );
      },
    });
  }

  onEdit(form: any) {
    this.isLoading.set(true);
    const data = this.parseUserForm(form) as any;
    this.service.edit(data).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem updating.');
      },
    });
  }

  onAdd(form: any) {
    this.isLoading.set(true);
    const data = this.parseUserForm(form);
    this.service.add(data).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the item.');
      },
    });
  }

  onSearch(data: any): void {}

  parseUserForm(form: any) {}

  handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
      panelClass: ['snackbar-error']
    });
  }

  showSnackbar(message: string) {
    this.snackBar.open(message, '', {
      duration: 4000,
      panelClass: ['snackbar-success']
    });
  }

  protected reload() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.load(pageIndex + 1, pageSize);
  }
}
