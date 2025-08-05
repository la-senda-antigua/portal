import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
import { Sermon } from '../../models/Sermon';
import { VideoRecordingsService } from '../../services/video-recordings.service';

export interface DisplaySermon {
  id: number;
  preacher: string;
  date: string;
  title: string;
}

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
  tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'Preacher', datasourceName: 'preacher' },
    { displayName: 'Date', datasourceName: 'date' },
  ];
  readonly dataSource = signal<TableViewDataSource>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    items: [],
    columns: this.tableCols
  });
  readonly isLoading = signal(true);

  tableTitle = 'Church Services';

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
        const sermons = response.items.map(
          (s) =>
            ({
              id: s.id,
              date: this.datePipe.transform(s.date, 'yyyy-MM-dd'),
              title: s.title,
              preacher: s.preacher.name,
            } as DisplaySermon)
        );
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: sermons,
          columns: this.tableCols
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('error loading sermons', err);
        this.isLoading.set(false);
        this.snackBar.open('There was an error loading sermons.', '', {
          duration: 2000,
        });
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

  onEdit(sermon: Sermon) {
    // const dialogRef = this.dialog.open(SermonDialogComponent, {
    //   data: sermon,
    // });
    // dialogRef.afterClosed().subscribe((updatedSermon) => {
    //   if (updatedSermon) {
    //     this.isLoading = true;
    //     updatedSermon.id = sermon.id;
    //     this.videoRecordings.updateSermon(updatedSermon).subscribe({
    //       next: () => {
    //         this.loadSermons();
    //       },
    //       error: (err) => {
    //         this.isLoading = false;
    //         console.error('Error on update', err);
    //       },
    //     });
    //   }
    // });
  }

  onAdd() {
    // const dialogRef = this.dialog.open(SermonDialogComponent);
    // dialogRef.afterClosed().subscribe((newSermon) => {
    //   if (newSermon) {
    //     this.isLoading = true;
    //     this.videoRecordings.addSermon(newSermon).subscribe({
    //       next: () => {
    //         this.loadSermons();
    //       },
    //       error: (err) => {
    //         this.isLoading = false;
    //         alert(err.message || 'on add');
    //         console.error(err);
    //       },
    //     });
    //   }
    // });
  }
}
