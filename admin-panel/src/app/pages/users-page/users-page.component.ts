import { Component, viewChild } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  TableViewColumn,
  TableViewComponent,
} from '../../components/table-view/table-view.component';
import { PageBaseComponent } from '../page-base/page-base.component';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import { UsersService } from '../../services/users.service';
import { PortalUser } from '../../models/PortalUser';

import { DatePipe } from '@angular/common';
import {
  EditUserFormComponent,
  UserFormData,
} from '../../components/edit-user-form/edit-user-form.component';

@Component({
  selector: 'app-users-page',
  imports: [MatIconModule, MatButtonModule, TableViewComponent],
  providers: [DatePipe],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditUserFormComponent;
  override createForm = EditUserFormComponent;

  override tableCols: TableViewColumn[] = [
    { displayName: 'Id', datasourceName: 'username' },
    { displayName: 'Role', datasourceName: 'role' },
    {
      displayName: 'Manager of',
      datasourceName: 'calendarsAsManager',
      displayProperty: 'name',
      isArray: true,
    },
    {
      displayName: 'Member of',
      datasourceName: 'calendarsAsMember',
      displayProperty: 'name',
      isArray: true,
    },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'username',
    name: 'username',
  };

  override tableTitle = 'Users';

  constructor(service: UsersService) {
    super(service);
  }

  override load(page: number, pageSize: number): void {
    this.isLoading.set(true);
    this.service.getPage(page, pageSize).subscribe({
      next: (response) => {
        const users = response.items.map((u: PortalUser) => ({
          id: u.id,
          username: u.username,
          role: u.role,
          calendarsAsManager: u.calendarsAsManager,
          calendarsAsMember: u.calendarsAsMember,
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: users,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error getting users.');
      },
    });
  }

  override parseForm(form: UserFormData): PortalUser {
    let item = {
      username: form.data.username,
      role: form.data.role,
      calendarsAsManager: form.data.calendarsAsManager,
      calendarsAsMember: form.data.calendarsAsMember,
    } as PortalUser;

    if (form.data.id) item.id = form.data.id;

    return item;
  }

  override onSearch(data: any): void {
    const { searchTerm, page, pageSize } = data;
    this.isLoading.set(true);
    this.service.search(searchTerm, page, pageSize).subscribe({
      next: (response) => {
        const users = response.items.map((u: PortalUser) => ({
          id: u.id,
          username: u.username,
          role: u.role,
          calendarsAsManager: u.calendarsAsManager,
          calendarsAsMember: u.calendarsAsMember,
        }));
        this.dataSource.set({
          page: response.page,
          pageSize: response.pageSize,
          totalItems: response.totalItems,
          items: users,
          columns: this.tableCols,
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleException(err, 'There was an error loading users.');
      },
    });
  }
}
