import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Sermon } from '../../models/Sermon';
import { VideosService } from '../../services/videos.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SermonDialogComponent } from '../sermon-dialog/sermon-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-church-services',
  standalone: true,
  templateUrl: './church-services.component.html',
  styleUrls: ['./church-services.component.scss'],
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, DatePipe, MatDialogContent, MatDialogActions, MatButtonModule, MatProgressSpinnerModule, CommonModule, MatProgressBar],
})
export class ChurchServicesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sermonId', 'title', 'preacher', 'date', 'actions'];
  dataSource = new MatTableDataSource<Sermon>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private videoService: VideosService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSermons(this.currentPage, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadSermons(currentPage: number = 1, pageSize: number = 10): void {
    this.isLoading = true;
    this.videoService.getSermons(currentPage, pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalItems = response.totalItems;
          this.pageSize = response.pageSize;
          this.currentPage = response.page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('error loading sermons', err);
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadSermons(this.currentPage, this.pageSize);
  }

  async onDelete(sermon: Sermon) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      data: sermon,
    });

    this.dialogRef.afterClosed().subscribe({
      next: (confimed) => {
        if (confimed) {
          this.isLoading = true
          this.videoService.deleteSermon(sermon.id);
        }
      },
      error: (err) => {
        this.isLoading = false
        console.error('Error on delete', err);
      }
    });
  }

  onEdit(sermon: Sermon) {
    const dialogRef = this.dialog.open(SermonDialogComponent, {
      data: sermon,
    });

    dialogRef.afterClosed().subscribe((updatedSermon) => {
      if (updatedSermon) {
        this.isLoading = true
        updatedSermon.id = sermon.id
        this.videoService.updateSermon(updatedSermon).subscribe({
          next: () => {
            this.loadSermons()
          },
          error: (err) => {
            this.isLoading = false
            console.error('Error on update', err);
          },
        });
      }
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(SermonDialogComponent);

    dialogRef.afterClosed().subscribe((newSermon) => {
      if (newSermon) {
        this.isLoading = true
        this.videoService.addSermon(newSermon).subscribe({
          next: () => {
            this.loadSermons()
          },
          error: (err) => {
            this.isLoading = false
            alert(err.message || 'on add');
            console.error(err);
          },
        });
      }
    });
  }
}
