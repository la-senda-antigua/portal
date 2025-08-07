import { DatePipe } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  EditVideoFormComponent,
  VideoFormData,
} from '../../components/edit-video-form/edit-video-form.component';
import {
  TableViewColumn,
  TableViewComponent
} from '../../components/table-view/table-view.component';
import { SermonDto } from '../../models/Sermon';
import { CoursesService } from '../../services/courses.service';
import { PageBaseComponent } from '../page-base/page-base.component';

@Component({
  selector: 'app-bible-courses',
  imports: [TableViewComponent],
  templateUrl: './bible-courses.component.html',
  styleUrl: './bible-courses.component.scss',
  providers: [DatePipe],
})
export class BibleCoursesComponent extends PageBaseComponent {
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
  override tableTitle = 'Bible Courses';

  constructor(service: CoursesService) {
    super(service);
  }

  override loadVideos(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getAll(page, pageSize).subscribe({
      next: (response) => {
        const courses = response.items.map((s: any) => ({
          id: s.id,
          date: this.datePipe.transform(s.date, 'yyyy-MM-dd'),
          title: s.title,
          preacherName: s.preacher.name,
          preacherId: s.preacher.id,
          cover: s.cover,
          videoUrl: s.videoPath,
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: courses,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading courses.');
      },
    });
  }

  override parseVideoForm(videoForm: VideoFormData): SermonDto {
    const course = {
      date: videoForm.data.date.toISOString().substring(0, 10),
      title: videoForm.data.title,
      videoPath: videoForm.data.videoUrl,
      cover: videoForm.data.cover,
      preacherId: videoForm.data.preacherId!,
    } as SermonDto;
    if (videoForm.data.id != undefined) {
      course['id'] = videoForm.data.id;
    }

    return course;
  }
}
