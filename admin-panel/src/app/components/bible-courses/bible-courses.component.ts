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
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SermonDialogComponent } from '../sermon-dialog/sermon-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bible-courses',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, DatePipe, MatDialogContent, MatDialogActions, MatButtonModule],
  templateUrl: './bible-courses.component.html',
  styleUrl: './bible-courses.component.scss'
})
export class BibleCoursesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sermonId', 'title', 'date', 'actions'];
  dataSource = new MatTableDataSource<Sermon>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private sermonsService: SermonsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadCourses(): void {
    this.sermonsService.getCourses().subscribe({
      next: (data: Sermon[]) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error al cargar los cursos', error);
      },
    });
  }

  async onDelete(sermon: Sermon) {
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
      data: sermon,
    });

    this.dialogRef.afterClosed().subscribe({
      next: (confimed) => {
        if (confimed) {
          this.sermonsService.deleteCourse(sermon.id);
        }
      },
      error: (err) =>{
        console.error('Error al eliminar curso', err);
      }
    });
  }

  onEdit(sermon: Sermon) {
    const dialogRef = this.dialog.open(SermonDialogComponent, {
      data: sermon,
    });

    dialogRef.afterClosed().subscribe((updatedSermon) => {
      if (updatedSermon) {
        this.sermonsService.updateCourse(updatedSermon).subscribe({
          next: (result) => {
            this.dataSource.data = this.dataSource.data.map((s) =>
              s.id === result.id ? result : s
            );
          },
          error: (err) => {
            console.error('Error al actualizar curso', err);
          },
        });
      }
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(SermonDialogComponent);

    dialogRef.afterClosed().subscribe((newSermon) => {
      if (newSermon) {
        this.sermonsService.addCourse(newSermon).subscribe({
          next: (addedSermon) => {
            this.dataSource.data = [...this.dataSource.data, addedSermon];
          },
          error: (err) => {
            console.error('Error al agregar curso', err);
          },
        });
      }
    });
  }
}
