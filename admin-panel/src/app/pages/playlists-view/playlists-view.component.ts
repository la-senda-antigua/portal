import { DatePipe } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { EditIdNameFormComponent, EditIdNameFormData } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { TableViewColumn, TableViewComponent } from '../../components/table-view/table-view.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { PlaylistsService } from '../../services/playlists.service';
import { VideoPlaylist } from '../../models/VideoPlaylist';

@Component({
  selector: 'app-playlists-view',
  imports: [TableViewComponent],
  templateUrl: './playlists-view.component.html',
  styleUrl: './playlists-view.component.scss',
  providers: [DatePipe],
})
export class PlaylistsViewComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditIdNameFormComponent;
  override createForm = EditIdNameFormComponent;
  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Name', datasourceName: 'name' },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'name',
    name: 'name',
  };
  override tableTitle = 'Video Playlists';

  constructor(service: PlaylistsService) {
    super(service);
  }

  override loadVideos(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getAll(page, pageSize).subscribe({
      next: (response) => {
        if (!(response && response.items)) {
          this.isLoading.set(false);
          return;
        }

        const item = response.items.map((s: VideoPlaylist) => ({
          id: s.id,
          name: s.name
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: item,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading sermons.');
      },
    });
  }

  override parseVideoForm(form: EditIdNameFormData): VideoPlaylist {
    const item = {
      id: form.data.id,
      name: form.data.name,
    } as VideoPlaylist;
    if (form.data.id != undefined) {
      item['id'] = form.data.id;
    }

    return item;
  }

}
