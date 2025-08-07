import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewType,
} from '../../components/table-view/table-view.component';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { VideosServiceBase } from '../../services/videos.service.base';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { VideoFormData } from '../../components/edit-video-form/edit-video-form.component';
import { EditIdNameFormData } from '../../components/edit-id-name-form/edit-id-name-form.component';

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
    protected service: VideosServiceBase,    
  ) {}

  ngOnInit(): void {
    this.loadVideos(1, 10);
  }

  loadVideos(page: number, pageSize: number): void {}

  onPageChange(event: PageEvent) {
    this.loadVideos(event.pageIndex + 1, event.pageSize);
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

  onEdit(form: VideoFormData) {
    this.isLoading.set(true);
    const video = this.parseVideoForm(form) as any;
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
    const video = this.parseVideoForm(form);
    this.service.add(video).subscribe({
      next: () => {
        this.reload();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the item.');
      },
    });
  }

  parseVideoForm(videoForm: VideoFormData | EditIdNameFormData) {}

  handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private reload() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.loadVideos(pageIndex + 1, pageSize);
  }
}
