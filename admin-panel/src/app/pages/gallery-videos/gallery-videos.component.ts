import { DatePipe } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { EditVideoFormComponent, VideoFormData } from '../../components/edit-video-form/edit-video-form.component';
import { TableViewColumn, TableViewComponent } from '../../components/table-view/table-view.component';
import { GalleryService } from '../../services/gallery.service';
import { PageBaseComponent } from '../page-base/page-base.component';
import { GalleryVideo } from '../../models/GalleryVideo';

@Component({
  selector: 'app-gallery-videos',
  imports: [TableViewComponent],
  templateUrl: './gallery-videos.component.html',
  styleUrl: './gallery-videos.component.scss',
  providers: [DatePipe],
})
export class GalleryVideosComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
    override editForm = EditVideoFormComponent;
    override createForm = EditVideoFormComponent;
    override tableCols: TableViewColumn[] = [
      { displayName: 'Id', datasourceName: 'id' },
      { displayName: 'Title', datasourceName: 'title' },
      { displayName: 'Date', datasourceName: 'date' },
    ];
  
    override deleteFields: DeleteConfirmationData = {
      id: 'id',
      matchingString: 'id',
      name: 'title',
    };
    override tableTitle = 'Video Gallery';
  
    constructor(service: GalleryService) {
      super(service);
    }
  
    override loadVideos(page: number, pageSize: number): void {
      this.isLoading.set(true);
      this.service.getAll(page, pageSize).subscribe({
        next: (response) => {
          const item = response.items.map((s: any) => ({
            id: s.id,
            date: this.datePipe.transform(s.date, 'yyyy-MM-dd'),
            title: s.title,
            cover: s.cover,
            videoUrl: s.videoPath,
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
          this.handleException(err, 'There was an error loading gallery.');
        },
      });
    }
  
    override parseVideoForm(videoForm: VideoFormData): GalleryVideo {
      const item = {
        date: videoForm.data.date.toISOString().substring(0, 10),
        title: videoForm.data.title,
        videoPath: videoForm.data.videoUrl,
        cover: videoForm.data.cover,        
      } as GalleryVideo;
      if (videoForm.data.id != undefined) {
        item['id'] = videoForm.data.id;
      }
  
      return item;
    }
  
}
