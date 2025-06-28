import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Sermon } from '../../models/Sermon';
import { SermonsService } from '../../services/sermons.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SermonDialogComponent } from '../sermon-dialog/sermon-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-bible-courses',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, DatePipe, MatDialogContent, MatDialogActions, MatButtonModule, MatProgressBar, CommonModule],
  templateUrl: './bible-courses.component.html',
  styleUrl: './bible-courses.component.scss'
})
export class BibleCoursesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sermonId', 'title', 'preacher', 'date', 'actions'];
  dataSource = new MatTableDataSource<Sermon>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private sermonsService: SermonsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses(this.currentPage, this.pageSize);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadCourses(currentPage: number = 1, pageSize: number = 10): void {
    this.isLoading = true;
    this.sermonsService.getCourses(currentPage, pageSize)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
          this.totalItems = response.totalItems;
          this.pageSize = response.pageSize;
          this.currentPage = response.page;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading', err);
          this.isLoading = false;
        }
      });      
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadCourses(this.currentPage, this.pageSize);
  }

  async onDelete(course: Sermon) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      data: course,
    });

    this.dialogRef.afterClosed().subscribe({
      next: (confimed) => {
        if (confimed) {
          this.isLoading = true
          this.sermonsService.deleteCourse(course.id);
        }
      },
      error: (err) =>{
        this.isLoading = false
        console.error('Error on deleting', err);
      }
    });
  }

  onEdit(course: Sermon) {
    const dialogRef = this.dialog.open(SermonDialogComponent, {
      data: course,
    });

    dialogRef.afterClosed().subscribe((updatedCourse) => {
      if (updatedCourse) {
        this.isLoading = true
        updatedCourse.id = course.id;
        this.sermonsService.updateCourse(updatedCourse).subscribe({
          next: () => {
            this.loadCourses()
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
    const dialogRef = this.dialog.open(SermonDialogComponent);

    dialogRef.afterClosed().subscribe((newCourse) => {
      if (newCourse) {
        this.isLoading = true
        this.sermonsService.addCourse(newCourse).subscribe({
          next: () => {
            this.loadCourses()
          },
          error: (err) => {
            this.isLoading = false
            console.error('Error on add', err);
          },
        });
      }
    });
  }
}
