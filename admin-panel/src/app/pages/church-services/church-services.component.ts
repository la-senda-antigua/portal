import { DatePipe } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  EditVideoFormComponent,
  VideoFormData,
} from '../../components/edit-video-form/edit-video-form.component';
import {
  TableViewColumn,
  TableViewComponent,
} from '../../components/table-view/table-view.component';
import { Sermon, SermonDto } from '../../models/Sermon';

import { SermonsService } from '../../services/sermons.service';
import { PageBaseComponent } from '../page-base/page-base.component';

@Component({
  selector: 'app-church-services',
  standalone: true,
  templateUrl: './church-services.component.html',
  styleUrls: ['./church-services.component.scss'],
  imports: [TableViewComponent],
  providers: [DatePipe],
})
export class ChurchServicesComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditVideoFormComponent;
  override createForm = EditVideoFormComponent;
  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'Preacher', datasourceName: 'preacherName' },
    { displayName: 'Date', datasourceName: 'date' },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'id',
    name: 'title',
  };
  override tableTitle = 'Church Services';

  constructor(service: SermonsService) {
    super(service);
  }

  override load(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getPage(page, pageSize).subscribe({
      next: (response) => {
        const sermons = response.items.map((s: Sermon) => ({
          id: s.id,
          date: this.datePipe.transform(s.date, 'yyyy-MM-dd'),
          title: s.title,
          preacherName: s.preacher.name,
          preacherId: s.preacher.id,
          cover: s.cover,
          videoUrl: s.videoPath,
          playlistId: s.playlist,
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

  override parseForm(videoForm: VideoFormData): SermonDto {
    const sermon = {
      date: videoForm.data.date.toISOString().substring(0, 10),
      title: videoForm.data.title,
      videoPath: videoForm.data.videoUrl,
      cover: videoForm.data.cover,
      preacherId: videoForm.data.preacherId!,
      playlist: videoForm.data.playlistId
    } as SermonDto;
    if (videoForm.data.id != undefined) {
      sermon['id'] = videoForm.data.id;
    }

    return sermon;
  }
}
