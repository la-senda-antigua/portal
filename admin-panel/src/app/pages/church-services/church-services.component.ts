import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
} from '../../components/table-view/table-view.component';
import { Sermon, SermonDto } from '../../models/Sermon';
import { VideoRecordingsService } from '../../services/video-recordings.service';
import {
  EditVideoFormComponent,
  VideoFormData,
} from '../../components/edit-video-form/edit-video-form.component';

@Component({
  selector: 'app-church-services',
  standalone: true,
  templateUrl: './church-services.component.html',
  styleUrls: ['./church-services.component.scss'],
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    TableViewComponent,
  ],
  providers: [DatePipe],
})
export class ChurchServicesComponent implements OnInit {
  readonly tableViewComponent = viewChild(TableViewComponent);
  readonly editSermonForm = EditVideoFormComponent;
  readonly tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'Preacher', datasourceName: 'preacherName' },
    { displayName: 'Date', datasourceName: 'date' },
  ];
  readonly dataSource = signal<TableViewDataSource>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    items: [],
    columns: this.tableCols,
  });
  readonly isLoading = signal(true);

  readonly tableTitle = 'Church Services';

  constructor(
    private videoRecordings: VideoRecordingsService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSermons(1, 10);
  }

  loadSermons(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.videoRecordings.getSermons(page, pageSize).subscribe({
      next: (response) => {
        const sermons = response.items.map((s) => ({
          id: s.id,
          date: this.datePipe.transform(s.date, 'yyyy-MM-dd'),
          title: s.title,
          preacherName: s.preacher.name,
          preacherId: s.preacher.id,
          cover: s.cover,
          videoUrl: s.videoPath,
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: sermons,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading sermons.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.loadSermons(event.pageIndex + 1, event.pageSize);
  }

  async onDelete(sermon: Sermon) {
    // this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
    //   data: sermon,
    // });
    // this.dialogRef.afterClosed().subscribe({
    //   next: (confimed) => {
    //     if (confimed) {
    //       this.isLoading = true;
    //       this.videoRecordings.deleteSermon(sermon.id);
    //     }
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     console.error('Error on delete', err);
    //   },
    // });
  }

  onEdit(sermonForm: VideoFormData) {
    this.isLoading.set(true);
    const sermon = this.parseVideoForm(sermonForm) as any;
    this.videoRecordings.updateSermon(sermon).subscribe({
      next: () => {
        this.reloadSermons();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem updating the preaching.'
        );
      },
    });
  }

  onAdd(sermonForm: VideoFormData) {
    this.isLoading.set(true);
    const sermon = this.parseVideoForm(sermonForm);
    this.videoRecordings.addSermon(sermon).subscribe({
      next: () => {
        this.reloadSermons();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the preaching.');
      },
    });
  }

  private parseVideoForm(videoForm: VideoFormData): SermonDto {
    const sermon = {
      date: videoForm.data.date.toISOString().substring(0, 10),
      title: videoForm.data.title,
      videoPath: videoForm.data.videoUrl,
      cover: videoForm.data.cover,
      preacherId: videoForm.data.preacherId!,
    } as SermonDto;
    if (videoForm.data.id != undefined) {
      sermon['id'] = videoForm.data.id;
    }

    return sermon;
  }

  private handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private reloadSermons() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.loadSermons(pageIndex + 1, pageSize);
  }
}
