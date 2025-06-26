import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Preacher } from '../../models/Preacher';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SermonsService } from '../../services/sermons.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-preachers',
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatDialogContent, MatDialogActions, MatButtonModule, MatProgressSpinnerModule, CommonModule, MatProgressBar],
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any>;

  constructor(
    private sermonsService: SermonsService,
    private dialog: MatDialog
  ) { }

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
          this.sermonsService.deletePreacher(preacher.id);
        }
      },
      error: (err) => {
        console.error('Error al eliminar predicarod', err)
      }
    })
  }

  onEdit(preacher: Preacher){

  } 

  onAdd(){

  }
}
