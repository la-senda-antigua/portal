import { Component, effect, inject, untracked, viewChild } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  TableViewColumn,
  TableViewComponent,
  TableViewDataSource,
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
import { Store } from '@ngrx/store';
import {
  selectUserGroupsLoaded,
  selectUserGroups,
  selectUserGroupsLoading,
  selectUsers,
  selectUsersLoaded,
  selectUsersLoading,
} from '../../state/users.selectors';
import { UsersActions } from '../../state/users.actions';

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
    { displayName: 'Email', datasourceName: 'username', width: '15%' },
    { displayName: 'Name', datasourceName: 'displayName', width: '10%' },
    {
      displayName: 'Roles',
      datasourceName: 'roles',
      isArray: true,
      width: '18%',
    },
    {
      displayName: 'Manager of',
      datasourceName: 'calendarsAsManager',
      displayProperty: 'name',
      isArray: true,
      width: '18%',
    },
    {
      displayName: 'Calendars',
      datasourceName: 'calendarsAsMember',
      displayProperty: 'name',
      isArray: true,
      width: '18%',
    },
    {
      displayName: 'Groups',
      datasourceName: 'groups',
      displayProperty: 'groupName',
      isArray: true,
      filterOptions: [],
      width: '18%',
    },
  ];

  override deleteFields: DeleteConfirmationData = {
    id: 'id',
    matchingString: 'username',
    name: 'username',
    requestMatchingString: true,
  };

  override tableTitle = 'Users';

  private readonly store = inject(Store);
  readonly usersLoading = this.store.selectSignal(selectUsersLoading);
  readonly userGroupsLoading = this.store.selectSignal(selectUserGroupsLoading);
  readonly usersLoaded = this.store.selectSignal(selectUsersLoaded);
  readonly userGroupsLoaded = this.store.selectSignal(selectUserGroupsLoaded);
  readonly users = this.store.selectSignal(selectUsers);
  readonly userGroups = this.store.selectSignal(selectUserGroups);

  constructor(service: UsersService) {
    super(service);
    effect(() => {
      let loading = false;
      if (this.usersLoading() || this.userGroupsLoading()) {
        loading = true;
      }
      untracked(() => this.isLoading.set(loading));
    });
    effect(() => {
      const users = this.users();
      const mappedUsers = users
        .filter((u: PortalUser) => u.userId) // Filtrar usuarios sin userId
        .map((u: PortalUser) => ({
          id: u.userId,
          username: u.username,
          name: u.name,
          lastName: u.lastName,
          displayName: `${u.name ?? ''} ${u.lastName ?? ''}`,
          roles: u.role?.split(',') || [],
          calendarsAsManager: u.calendarsAsManager,
          calendarsAsMember: u.calendarsAsMember,
          groups: u.groups,
        }));

      untracked(() => {
        this.dataSource.update((tableData) => ({
          ...tableData,
          items: mappedUsers,
        }));
      });
    });
    effect(() => {
      const groups = this.userGroups();
      this.dataSource.update((tableData) => ({
        ...tableData,
        columns: this.tableCols.map((col) => {
          if (col.datasourceName === 'groups') {
            return {
              ...col,
              filterOptions: groups
                .map((g) => ({ value: g.groupName, viewValue: g.groupName }))
                .sort((a, b) => a.viewValue.localeCompare(b.viewValue)),
            };
          }
          return col;
        }),
      }));
    });
  }

  override load(): void {
    if (!this.usersLoaded() && !this.usersLoading()) {
      this.store.dispatch(UsersActions.loadUsers());
    }
    if (!this.userGroupsLoaded() && !this.userGroupsLoading()) {
      this.store.dispatch(UsersActions.loadUserGroups());
    }
  }

  override parseForm(form: UserFormData): PortalUser {
    let item = {
      username: form.data.username,
      name: form.data.name,
      lastName: form.data.lastName,
      role: form.data.roles?.join(',') || '',
      calendarsAsManager: form.data.calendarsAsManager,
      calendarsAsMember: form.data.calendarsAsMember,
    } as PortalUser;

    if (form.data.id) item.userId = form.data.id;

    return item;
  }

  override onSearch(data: any): void {
    const { searchTerm } = data;
    this.dataSource.update((tableData) => ({
      ...tableData,
      items: this.users().filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }));
  }
}
