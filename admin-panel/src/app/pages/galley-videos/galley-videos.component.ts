import { Component, signal, viewChild } from '@angular/core';
import { TableViewColumn, TableViewComponent, TableViewDataSource, TableViewType } from '../../components/table-view/table-view.component';
import { DatePipe } from '@angular/common';
import { EditVideoFormComponent, VideoFormData } from '../../components/edit-video-form/edit-video-form.component';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { VideoRecordingsService } from '../../services/video-recordings.service';
import { GalleryVideo } from '../../models/GalleryVideo';

@Component({
  selector: 'app-galley-videos',
  imports: [TableViewComponent],
  templateUrl: './galley-videos.component.html',
  styleUrl: './galley-videos.component.scss',
  providers: [DatePipe],
})
export class GalleyVideosComponent {
  readonly tableViewComponent = viewChild(TableViewComponent);
  readonly editForm = EditVideoFormComponent;
  readonly tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },    
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
  readonly deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'title',
    name: 'title',
  };
  readonly tableTitle = 'Gallery Videos';
  readonly tableViewTypes = TableViewType;

  constructor(
    private videoRecordings: VideoRecordingsService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVideos(1, 10);
  }

  loadVideos(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.videoRecordings.getGalleryVideos(page, pageSize).subscribe({
      next: (response) => {
        const videos = response.items.map((s) => ({
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
          items: videos,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading gallery.');
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.loadVideos(event.pageIndex + 1, event.pageSize);
  }

  async onDelete(id: string) {
    this.isLoading.set(true);
    this.videoRecordings.deleteGalleryVideo(parseInt(id)).subscribe({
      next: () => {
        this.reloadVideos();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem when attempting to delete this video.'
        );
      },
    });
  }

  onEdit(form: VideoFormData) {
    this.isLoading.set(true);
    const video = this.parseVideoForm(form) as any;
    this.videoRecordings.updateGalleryVideo(video).subscribe({
      next: () => {
        this.reloadVideos();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem updating the video.'
        );
      },
    });
  }

  onAdd(form: VideoFormData) {
    this.isLoading.set(true);
    const video = this.parseVideoForm(form);
    this.videoRecordings.addGalleryVideo(video).subscribe({
      next: () => {
        this.reloadVideos();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the video.');
      },
    });
  }

  private parseVideoForm(videoForm: VideoFormData): GalleryVideo {
    const video = {
      date: videoForm.data.date.toISOString().substring(0, 10),
      title: videoForm.data.title,
      videoPath: videoForm.data.videoUrl,
      cover: videoForm.data.cover,
    } as GalleryVideo;
    if (videoForm.data.id != undefined) {
      video['id'] = videoForm.data.id;
    }

    return video;
  }

  private handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private reloadVideos() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.loadVideos(pageIndex + 1, pageSize);
  }
}
