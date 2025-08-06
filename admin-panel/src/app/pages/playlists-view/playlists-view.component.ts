import { Component, OnInit, signal, viewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewType,
} from '../../components/table-view/table-view.component';
import { VideoPlaylist } from '../../models/VideoPlaylist';
import { VideoRecordingsService } from '../../services/video-recordings.service';

@Component({
  selector: 'app-playlists-view',
  imports: [TableViewComponent],
  templateUrl: './playlists-view.component.html',
  styleUrl: './playlists-view.component.scss',
})
export class PlaylistsViewComponent implements OnInit {
  readonly tableView = viewChild(TableViewComponent);
  readonly isLoading = signal(true);
  readonly tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Name', datasourceName: 'name' },
  ];
  readonly dataSource = signal<TableViewDataSource>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    items: [],
    columns: this.tableCols,
  });
  readonly tableName = 'Video Playlists';
  readonly tableViewTypes = TableViewType;
  readonly editIdAndNameComponent = EditIdNameFormComponent;
  readonly deletePlaylistFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'id',
    name: 'name',
  };

  constructor(
    private videoService: VideoRecordingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.isLoading.set(true);
    this.videoService.getAllPlaylists().subscribe({
      next: (playlists) => {
        const { pageIndex, pageSize } = this.tableView()!.paginator()!;
        this.dataSource.set({
          totalItems: playlists.length,
          page: pageIndex + 1,
          pageSize,
          columns: this.tableCols,
          items: playlists,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was a problem loadint the playlists.');
      },
    });
  }

  async onDelete(id: string) {
    // this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
    //   data: playlist,
    // });
    // this.dialogRef
    //   .afterClosed()
    //   .pipe(
    //     switchMap((confirmed) => {
    //       if (confirmed) {
    //         this.isLoading = true;
    //         return this.videoService.deletePlaylist(playlist.id!);
    //       }
    //       return of(false);
    //     }),
    //     catchError((err) => {
    //       this.isLoading = false;
    //       console.error('Error on delete', err);
    //       return of(false);
    //     })
    //   )
    //   .subscribe();
  }

  async onEdit(playlist: VideoPlaylist) {
    // this.playlistForm = this.fb.group({
    //   id: [playlist.id],
    //   name: [playlist.name, Validators.required],
    // });
    // this.dialogRef = this.dialog.open(this.playlistConfigDialog, {
    //   data: playlist,
    // });
    // this.dialogRef
    //   .afterClosed()
    //   .pipe(
    //     switchMap((result) => {
    //       if (result) {
    //         this.isLoading = true;
    //         return this.videoService.updatePlaylist(result);
    //       }
    //       return of(null);
    //     }),
    //     catchError((err) => {
    //       this.isLoading = false;
    //       console.error('Error on update', err);
    //       return of(null);
    //     })
    //   )
    //   .subscribe((result) => {
    //     if (result) {
    //       this.loadPlaylists();
    //     }
    //   });
  }

  async onAdd(playlist: VideoPlaylist) {
    // this.playlistForm = this.fb.group({
    //   id: [null],
    //   name: ['', Validators.required],
    // });
    // this.dialogRef = this.dialog.open(this.playlistConfigDialog, {
    //   data: { name: '', id: null },
    // });
    // this.dialogRef
    //   .afterClosed()
    //   .pipe(
    //     switchMap((result) => {
    //       if (result) {
    //         this.isLoading = true;
    //         return this.videoService.addPlaylist({ name: result.name });
    //       }
    //       return of(null);
    //     }),
    //     catchError((err) => {
    //       this.isLoading = false;
    //       console.error('Error on add', err);
    //       return of(null);
    //     })
    //   )
    //   .subscribe((result) => {
    //     if (result) {
    //       this.loadPlaylists();
    //     }
    //   });
  }

  private handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }
}
