import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

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

export interface TableViewFormData {
  type: 'sermon' | 'biblecourse' | 'gallery' | 'preacher' | 'playlist';
  mode: 'add' | 'edit' | 'delete';
  data: any;
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
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
})
export class TableViewComponent {
  readonly paginator = viewChild(MatPaginator);
  readonly viewType = input.required<
    'sermon' | 'biblecourse' | 'gallery' | 'preacher' | 'playlist'
  >();
  readonly createForm = input.required<any>();
  readonly editForm = input.required<any>();
  readonly deleteForm = input.required<any>();
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
  readonly createRequest = output<any>();
  readonly editRequest = output<any>();

  readonly dialog = inject(MatDialog);

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

  openCreateForm() {
    const dialogRef = this.dialog.open(this.createForm(), {
      data: {
        mode: 'add',
        type: this.viewType(),
        data: {},
      } as TableViewFormData,
    });
    dialogRef.afterClosed().subscribe((form) => {
      if (form != null) {
        this.createRequest.emit(form);
      }
    });
  }

  openEditForm(entry: any) {
    const dialogRef = this.dialog.open(this.editForm(), {
      data: {
        mode: 'edit',
        type: this.viewType(),
        data: { ...entry },
      } as TableViewFormData,
    });
    dialogRef.afterClosed().subscribe((form) => {
      if (form != null) {
        this.editRequest.emit(form);
      }
    });
  }
}
