import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Preacher } from '../../models/Preacher';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { VideosService } from '../../services/videos.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-preachers',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatPaginatorModule, MatIconModule, MatDialogContent, MatDialogActions, MatButtonModule, MatProgressSpinnerModule, CommonModule, MatProgressBar],
  templateUrl: './preachers.component.html',
  styleUrl: './preachers.component.scss'
})
export class PreachersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource = new MatTableDataSource<Preacher>([]);
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;
  isLoading = false;
  addForm: FormGroup;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  @ViewChild('addNewDialog') addNewDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private sermonsService: VideosService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
    this.addForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPreachers(this.currentPage, this.pageSize)    
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadPreachers(currentPage: number =1, pageSize: number =10): void {
    this.isLoading = true;
    this.sermonsService.getPreachers(currentPage, pageSize)    
    .subscribe({
      next: (response) => {
        this.dataSource.data = response.items;
        this.totalItems = response.totalItems;
        this.pageSize = response.pageSize;
        this.currentPage = response.page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('error loading preachers', err);
        this.isLoading = false;
      }
    })
  }

  onPageChange(event: PageEvent){
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadPreachers(this.currentPage, this.pageSize);
  }

  async onDelete(preacher: Preacher){
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog,{
      data: preacher
    })

    this.dialogRef.afterClosed().subscribe({
      next: (confirmed)=> {
        if (confirmed) {
          this.isLoading = true
          this.sermonsService.deletePreacher(preacher.id);
        }
      },
      error: (err) => {
        this.isLoading = false
        console.error('Error on delete', err)
      }
    })
  }

  async onEdit(preacher: Preacher) {    
    this.addForm = this.fb.group({
      id: [preacher.id],
      name: [preacher.name, Validators.required]
    });

    this.dialogRef = this.dialog.open(this.addNewDialog, {
      data: preacher
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true
        this.sermonsService.updatePreacher(result).subscribe({
          next: () => this.loadPreachers(),
          error: (err) => {
            this.isLoading = false
            console.error('Error on update', err)
          }
        });
      }
    });
  }

  async onAdd() {
    this.addForm = this.fb.group({
      id: [null],
      name: ['', Validators.required]
    });

    this.dialogRef = this.dialog.open(this.addNewDialog, {
      data: { name: '' , id: null},
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true
        this.sermonsService.addPreacher(result).subscribe({
          next: () => {
            this.loadPreachers(); 
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
