import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { CommonModule, UpperCasePipe } from '@angular/common';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';

export interface TableViewColumn {
  displayName: string;
  datasourceName: string;
}

export interface TableViewDataSource {
  totalItems: number;
  page: number;
  pageSize: number;
  items: any[];
  columns: TableViewColumn[];
}

@Component({
  selector: 'app-table-view',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatDividerModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
})
export class TableViewComponent {
  readonly paginator = viewChild(MatPaginator);
  readonly datasource = input.required<TableViewDataSource>();
  readonly loadWithPagination = input<boolean>(true);
  readonly tableTitle = input.required<string>();
  readonly isLoading = input<boolean>(false);
  readonly showActions = input<boolean>(true);
  readonly columnsAndActions = computed(() => {
    const cols: string[] = [];
    if (this.datasource && this.datasource()) {
      cols.push(...this.datasource().columns.map((c) => c.datasourceName));
    }
    cols.push('actions');
    return cols;
  });

  readonly pageChange = output<PageEvent>();

  tableDatasource?: MatTableDataSource<any>;

  constructor(private changeDetector: ChangeDetectorRef) {
    effect(() => {
      if (this.datasource && this.datasource()) {
        this.tableDatasource = new MatTableDataSource(this.datasource().items);
        const paginator = this.paginator();
        if (paginator) {
          if (!this.loadWithPagination()) {
            this.tableDatasource.paginator = paginator;
          }
          paginator.pageSize = this.datasource().pageSize;
          paginator.pageIndex = this.datasource().page - 1;
          paginator.length = this.datasource().totalItems;
          this.changeDetector.detectChanges();
        }
      }
    });
  }

  // async onDelete(sermon: Sermon) {
  //   this.dialogRef = this.dialog.open(this.confirmDeleteDialog, {
  //     data: sermon,
  //   });

  //   this.dialogRef.afterClosed().subscribe({
  //     next: (confimed) => {
  //       if (confimed) {
  //         this.isLoading = true;
  //         this.sermonsService.deleteSermon(sermon.id);
  //       }
  //     },
  //     error: (err) => {
  //       this.isLoading = false;
  //       console.error('Error on delete', err);
  //     },
  //   });
  // }

  // onEdit(sermon: Sermon) {
  //   const dialogRef = this.dialog.open(SermonDialogComponent, {
  //     data: sermon,
  //   });

  //   dialogRef.afterClosed().subscribe((updatedSermon) => {
  //     if (updatedSermon) {
  //       this.isLoading = true;
  //       updatedSermon.id = sermon.id;
  //       this.sermonsService.updateSermon(updatedSermon).subscribe({
  //         next: () => {
  //           this.loadSermons();
  //         },
  //         error: (err) => {
  //           this.isLoading = false;
  //           console.error('Error on update', err);
  //         },
  //       });
  //     }
  //   });
  // }

  // onAdd() {
  //   const dialogRef = this.dialog.open(SermonDialogComponent);

  //   dialogRef.afterClosed().subscribe((newSermon) => {
  //     if (newSermon) {
  //       this.isLoading = true;
  //       this.sermonsService.addSermon(newSermon).subscribe({
  //         next: () => {
  //           this.loadSermons();
  //         },
  //         error: (err) => {
  //           this.isLoading = false;
  //           alert(err.message || 'on add');
  //           console.error(err);
  //         },
  //       });
  //     }
  //   });
  // }
}
