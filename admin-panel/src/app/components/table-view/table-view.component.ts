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
import {
  DeleteConfirmationComponent,
  DeleteConfirmationData,
} from '../delete-confirmation/delete-confirmation.component';
import { DisableConfirmationComponent, DisableConfirmationData } from '../disable-confirmation/disable-confirmation.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ArrayToStringPipe } from "../../pipes/array-to-string.pipe";
import { MatChipsModule } from '@angular/material/chips';

export enum TableViewType {
  'sermon' = 'sermon',
  'biblecourse' = 'biblecourse',
  'gallery' = 'gallery',
  'preacher' = 'preacher',
  'playlist' = 'playlist',
  'calendar' = 'calendar'
}

export enum TableViewAccessMode {
  'add' = 'add',
  'edit' = 'edit',
  'delete' = 'delete',
}
export interface TableViewColumn {
  displayName: string;
  datasourceName: string;
  displayProperty?: string;
  isArray?: boolean;
}

export interface TableViewDataSource {
  totalItems: number;
  page: number;
  pageSize: number;
  items: any[];
  columns: TableViewColumn[];
}

export interface TableViewFormData {
  type: TableViewType;
  mode: TableViewAccessMode;
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
    MatFormFieldModule,
    MatInputModule,
    FormsModule,MatChipsModule
],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss',
})
export class TableViewComponent {
  /** Access the MatPaginator component */
  readonly paginator = viewChild(MatPaginator);
  /** A flag that let's other components know what type it is being used */
  readonly viewType = input.required<TableViewType>();
  /** A component that will be presented in a MatDialog when user presses the Add button */
  readonly createForm = input.required<any>();
  /** A component that will be presented in a MatDialog when user presses the Edit button */
  readonly editForm = input.required<any>();
  /** This is the source of data for the table.  */
  readonly datasource = input.required<TableViewDataSource>();
  /** Should the table emit when page changes? Default is true. That means that the parent component will handle the pagination. */
  readonly loadWithPagination = input<boolean>(true);
  /** The title to be presented on top of the table */
  readonly tableTitle = input.required<string>();
  /** The names (keys) of the properties to use as values for delte confirmation */
  readonly deleteConfirmationFields = input.required<DeleteConfirmationData>();
  /** The names (keys) of the properties to use as values for delte confirmation */
  readonly disableConfirmationFields = input<DisableConfirmationData>();
  /** If set to true, will show an infinite progress bar animation */
  readonly isLoading = input<boolean>(false);
  /** Whether or not to show the action column  */
  readonly showActions = input<boolean>(true);
  /** Whether or not to show the disable button  */
  readonly showDisableButton = input<boolean>(false);

  /** Used to include the actions column in the list of columsn of the datasource */
  readonly columnsAndActions = computed(() => {
    const cols: string[] = [];
    if (this.datasource && this.datasource()?.columns?.length) {
      cols.push(...this.datasource().columns.map((c) => c.datasourceName));
    }
    cols.push('actions');
    return cols;
  });

  /** Emits when the paginator page changes, and only if loadWithPagination is true */
  readonly pageChange = output<PageEvent>();
  /** Emits the value returned by the createForm component. */
  readonly createRequest = output<any>();
  /** Emits the value returned by the editForm component. */
  readonly editRequest = output<any>();
  /** Emits the Id passed in the deleteConfirmationFeilds object, when delete is confirmed.  */
  readonly deleteRequest = output<string>();
  /** Emits the Id passed in the disableConfirmationFeilds object, when disable is confirmed.  */
  readonly disableRequest = output<string>();

  readonly onSearch = output<any>();
  readonly dialog = inject(MatDialog);

  tableDatasource?: MatTableDataSource<any>;

  searchTerm: string = '';

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

  openDeleteConfirmation(entry: any) {
    const confirmationData = {
      id: entry[this.deleteConfirmationFields().id],
      matchingString: entry[this.deleteConfirmationFields().matchingString],
      name: entry[this.deleteConfirmationFields().name],
    } as DeleteConfirmationData;
    const dialogRef = this.dialog.open(DeleteConfirmationComponent, {
      data: confirmationData,
    });
    dialogRef.afterClosed().subscribe((confirmationId) => {
      if (confirmationId != undefined) {
        this.deleteRequest.emit(confirmationId);
      }
    });
  }

  openDisableConfirmation(entry: any){
    const confirmationData = {
      id: entry[this.disableConfirmationFields()!.id],
      name: entry[this.disableConfirmationFields()!.name],
      actionName: entry.status === 'Cancelled' ? 'enable' : 'disable'
    } as DisableConfirmationData;
    const dialogRef = this.dialog.open(DisableConfirmationComponent, {
      data: confirmationData,
    });
    dialogRef.afterClosed().subscribe((confirmationId) => {
      if (confirmationId != undefined) {
        this.disableRequest.emit(confirmationId);
      }
    });
  }

  search(){
    const data = {searchTerm: this.searchTerm, page: 1, pageSize: this.datasource().pageSize};
    this.onSearch.emit(data);
  }
}
