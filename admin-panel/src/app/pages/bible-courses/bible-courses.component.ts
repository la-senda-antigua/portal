import { DatePipe } from '@angular/common';
import { Component, OnInit, signal, viewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  EditVideoFormComponent,
  VideoFormData,
} from '../../components/edit-video-form/edit-video-form.component';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
  TableViewType,
} from '../../components/table-view/table-view.component';
import { SermonDto } from '../../models/Sermon';
import { VideoRecordingsService } from '../../services/video-recordings.service';

@Component({
  selector: 'app-bible-courses',
  imports: [TableViewComponent],
  templateUrl: './bible-courses.component.html',
  styleUrl: './bible-courses.component.scss',
  providers: [DatePipe],
})
export class BibleCoursesComponent implements OnInit {
  readonly tableViewComponent = viewChild(TableViewComponent);
  readonly tableViewTypes = TableViewType;
  readonly tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Title', datasourceName: 'title' },
    { displayName: 'Preacher', datasourceName: 'preacherName' },
    { displayName: 'Date', datasourceName: 'date' },
  ];
  readonly isLoading = signal(true);
  readonly dataSource = signal<TableViewDataSource>({
    totalItems: 0,
    page: 1,
    pageSize: 10,
    items: [],
    columns: this.tableCols,
  });
  readonly tableTitle = 'Bible Courses';
  readonly editForm = EditVideoFormComponent;
  readonly deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'title',
    name: 'title',
  };

  constructor(
    private videoRecordings: VideoRecordingsService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCourses(1, 10);
  }

  loadCourses(currentPage: number, pageSize: number): void {
    this.isLoading.set(true);
    this.videoRecordings.getCourses(currentPage, pageSize).subscribe({
      next: (response) => {
        const courses = response.items.map((s) => ({
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

  onPageChange(event: PageEvent) {
    this.loadCourses(event.pageIndex + 1, event.pageSize);
  }

  async onDelete(id: string) {
    this.isLoading.set(true);
    this.videoRecordings.deleteCourse(parseInt(id)).subscribe({
      next: () => {
        this.reloadCourses();
      },
      error: (err) => {
        this.handleException(
          err,
          'There was a problem when attempting to delete this course.'
        );
      },
    });
  }

  onEdit(sermonForm: VideoFormData) {
    this.isLoading.set(true);
    const course = this.parseVideoForm(sermonForm) as any;
    this.videoRecordings.updateCourse(course).subscribe({
      next: () => {
        this.reloadCourses();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem updating the course.');
      },
    });
  }

  onAdd(sermonForm: VideoFormData) {
    this.isLoading.set(true);
    const course = this.parseVideoForm(sermonForm);
    this.videoRecordings.addCourse(course as any).subscribe({
      next: () => {
        this.reloadCourses();
      },
      error: (err) => {
        this.handleException(err, 'There was a problem adding the course.');
      },
    });
  }

  private parseVideoForm(videoForm: VideoFormData): SermonDto {
    const sermon = {
      date: videoForm.data.date.toISOString().substring(0, 10),
      title: videoForm.data.title,
      videoPath: videoForm.data.videoUrl,
      cover: videoForm.data.cover,
      preacherId: videoForm.data.preacherId!,
    } as SermonDto;
    if (videoForm.data.id != undefined) {
      sermon['id'] = videoForm.data.id;
    }

    return sermon;
  }

  private handleException(e: Error, message: string) {
    this.isLoading.set(false);
    console.error(e);
    this.snackBar.open(message, '', {
      duration: 4000,
    });
  }

  private reloadCourses() {
    const { pageSize, pageIndex } = this.tableViewComponent()!.paginator()!;
    this.loadCourses(pageIndex + 1, pageSize);
  }
}
