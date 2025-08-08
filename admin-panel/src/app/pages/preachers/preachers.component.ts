import { DatePipe } from '@angular/common';
import { Component, viewChild } from '@angular/core';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { EditIdNameFormComponent, EditIdNameFormData } from '../../components/edit-id-name-form/edit-id-name-form.component';
import { TableViewColumn, TableViewComponent } from '../../components/table-view/table-view.component';
import { Preacher } from '../../models/Preacher';
import { PreachersService } from '../../services/preachers.service';
import { PageBaseComponent } from '../page-base/page-base.component';

@Component({
  selector: 'app-preachers',
  imports: [TableViewComponent],
  templateUrl: './preachers.component.html',
  styleUrl: './preachers.component.scss',
  providers: [DatePipe],
})
export class PreachersComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditIdNameFormComponent;
  override createForm = EditIdNameFormComponent;
  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'id' },
    { displayName: 'Name', datasourceName: 'name' },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'id',
    name: 'name',
  };
  override tableTitle = 'Preachers';

  constructor(service: PreachersService) {
    super(service);
  }

  override loadVideos(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getPage(page, pageSize).subscribe({
      next: (response) => {
        const item = response.items.map((s: Preacher) => ({
          id: s.id,
          name: s.name
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: item,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading sermons.');
      },
    });
  }

  override parseVideoForm(form: EditIdNameFormData): Preacher {
    const item = {
      id: form.data.id,
      name: form.data.name,
    } as Preacher;
    if (form.data.id != undefined) {
      item['id'] = form.data.id;
    }

    return item;
  }

}
