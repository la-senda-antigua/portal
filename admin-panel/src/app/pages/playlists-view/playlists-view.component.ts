import { Component, OnInit, signal, viewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewFormData,
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
    matchingString: 'name',
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
          items: playlists.sort(this.sortPlaylistsByName),
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was a problem loadint the playlists.');
      },
    });
  }

  async onDelete(id: string) {
    this.isLoading.set(true);
    this.videoService.deletePlaylist(id).subscribe({
      next: () => {
        this.loadPlaylists();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem deleting the playlist.');
      },
    });
  }

  async onEdit(playlistFormData: TableViewFormData) {
    this.isLoading.set(true);
    this.videoService
      .updatePlaylist({
        name: playlistFormData.data.name,
        id: playlistFormData.data.id,
      })
      .subscribe({
        next: () => {
          this.loadPlaylists();
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem attempting to save the playlist.'
          );
        },
      });
  }

  async onAdd(playlistFormData: TableViewFormData) {
    this.isLoading.set(true);
    this.videoService
      .addPlaylist({ name: playlistFormData.data.name })
      .subscribe({
        next: () => {
          this.loadPlaylists();
        },
        error: (err) => {
          this.handleException(
            err,
            'There was a problem attempting to save the playlist.'
          );
        },
      });
  }

  private handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private sortPlaylistsByName(a: VideoPlaylist, b: VideoPlaylist) {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  }
}
