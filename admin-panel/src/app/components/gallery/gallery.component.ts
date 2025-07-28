import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Gallery } from '../../models/Gallery';
import { VideosService } from '../../services/videos.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GalleryDialogComponent } from '../gallery-dialog/gallery-dialog.component';




@Component({
  selector: 'app-gallery',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, DatePipe, MatDialogContent, MatDialogActions, MatButtonModule, MatProgressSpinnerModule, CommonModule, MatProgressBar],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  displayedColumns: string[] = ['id', 'title', 'date', 'actions'];
  dataSource = new MatTableDataSource<Gallery>([]);
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
    this.loadVideos(this.currentPage, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVideos(currentPage: number = 1, pageSize: number = 10): void {
    this.isLoading = true;
    this.videoService.getGallery(currentPage, pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalItems = response.totalItems;
          this.pageSize = response.pageSize;
          this.currentPage = response.page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('error loading gallery', err);
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadVideos(this.currentPage, this.pageSize);
  }

  async onDelete(video: Gallery) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      data: video,
    });

    this.dialogRef.afterClosed().subscribe({
      next: (confimed) => {
        if (confimed) {
          this.isLoading = true
          this.videoService.deleteGalleryItem(video.id);
        }
      },
      error: (err) => {
        this.isLoading = false
        console.error('Error on delete', err);
      }
    });
  }

  onEdit(item: Gallery) {
    const dialogRef = this.dialog.open(GalleryDialogComponent, {
      data: item,
    });

    dialogRef.afterClosed().subscribe((updatedItem) => {
      if (updatedItem) {
        this.isLoading = true
        updatedItem.id = item.id
        this.videoService.updateGalleryItem(updatedItem).subscribe({
          next: () => {
            this.loadVideos()
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
    const dialogRef = this.dialog.open(GalleryDialogComponent);

    dialogRef.afterClosed().subscribe((newItem) => {
      if (newItem) {
        this.isLoading = true
        this.videoService.addGalleryItem(newItem).subscribe({
          next: () => {
            this.loadVideos()
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
