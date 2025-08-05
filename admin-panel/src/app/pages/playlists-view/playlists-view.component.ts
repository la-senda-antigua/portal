import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { VideoPlaylist } from '../../models/VideoPlaylist';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VideoRecordingsService } from '../../services/video-recordings.service';
import { Preacher } from '../../models/Preacher';
import { catchError, of, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playlists-view',
  imports: [
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './playlists-view.component.html',
  styleUrl: './playlists-view.component.scss',
})
export class PlaylistsViewComponent {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<VideoPlaylist>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  playlistForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  @ViewChild('playlistConfigDialog') playlistConfigDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private videoService: VideoRecordingsService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.playlistForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPlaylists();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadPlaylists(): void {
    this.isLoading = true;
    this.videoService.getAllPlaylists().subscribe({
      next: (playlists) => {
        this.dataSource.data = playlists;
        this.totalItems = playlists.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('error loading preachers', err);
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
  }

  async onDelete(playlist: VideoPlaylist) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      data: playlist,
    });

    this.dialogRef
      .afterClosed()
      .pipe(
        switchMap((confirmed) => {
          if (confirmed) {
            this.isLoading = true;
            return this.videoService.deletePlaylist(playlist.id!);
          }
          return of(false);
        }),
        catchError((err) => {
          this.isLoading = false;
          console.error('Error on delete', err);
          return of(false);
        })
      )
      .subscribe();
  }

  async onEdit(playlist: VideoPlaylist) {
    this.playlistForm = this.fb.group({
      id: [playlist.id],
      name: [playlist.name, Validators.required],
    });

    this.dialogRef = this.dialog.open(this.playlistConfigDialog, {
      data: playlist,
    });

    this.dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (result) {
            this.isLoading = true;
            return this.videoService.updatePlaylist(result);
          }
          return of(null);
        }),
        catchError((err) => {
          this.isLoading = false;
          console.error('Error on update', err);
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.loadPlaylists();
        }
      });
  }

  async onAdd() {
    this.playlistForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
    });

    this.dialogRef = this.dialog.open(this.playlistConfigDialog, {
      data: { name: '', id: null },
    });

    this.dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          if (result) {
            this.isLoading = true;
            return this.videoService.addPlaylist({ name: result.name });
          }
          return of(null);
        }),
        catchError((err) => {
          this.isLoading = false;
          console.error('Error on add', err);
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.loadPlaylists();
        }
      });
  }
}
