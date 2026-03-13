import {
  Component,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
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
import { PortalUser, UserRole } from '../../models/PortalUser';

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
  selectCalendarsLoaded,
  selectLoadingCalendars,
  selectCalendars,
  selectError,
} from '../../state/appstate.selectors';
import { UsersActions } from '../../state/users.actions';
import { CalendarsActions } from '../../state/calendars.actions';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';

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
  override tableCols: TableViewColumn[] = [
    { displayName: 'User ID', datasourceName: 'username', width: '15%' },
    { displayName: 'Name', datasourceName: 'displayName', width: '10%' },
    {
      displayName: 'Roles',
      datasourceName: 'roles',
      isArray: true,
      width: '25%',
      filterOptions: Object.values(UserRole).map((role) => ({
        value: role,
        viewValue: role,
      })),
    },
    {
      displayName: 'Calendars',
      datasourceName: 'calendars',
      displayProperty: 'calendarName',
      isArray: true,
      width: '25%',
      filterOptions: [],
    },
    {
      displayName: 'Groups',
      datasourceName: 'groups',
      displayProperty: 'groupName',
      isArray: true,
      filterOptions: [],
      width: '25%',
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
  readonly calendarsLoading = this.store.selectSignal(selectLoadingCalendars);
  readonly calendarsLoaded = this.store.selectSignal(selectCalendarsLoaded);
  readonly usersLoaded = this.store.selectSignal(selectUsersLoaded);
  readonly userGroupsLoaded = this.store.selectSignal(selectUserGroupsLoaded);
  readonly error = this.store.selectSignal(selectError);
  readonly users = this.store.selectSignal(selectUsers);
  readonly userGroups = this.store.selectSignal(selectUserGroups);
  readonly calendars = this.store.selectSignal(selectCalendars);
  readonly addMenuOptions = [
    { option: 'Add new user', form: EditUserFormComponent },
    { option: 'Create a group', form: EditIdNameFormComponent },
  ];
  readonly addUserTriggered = signal(false);

  constructor(service: UsersService) {
    super(service);
    effect(() => {
      let loading = false;
      if (
        this.usersLoading() ||
        this.userGroupsLoading() ||
        this.calendarsLoading()
      ) {
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
          calendars: [
            ...(u.calendarsAsManager?.map((c) => ({
              calendarName: `* ${c.name}`,
            })) || []),
            ...(u.calendarsAsMember?.map((c) => ({ calendarName: c.name })) ||
              []),
          ],
          groups: u.groups,
        }));

      untracked(() => {
        const newDataSource = { ...this.dataSource() };
        newDataSource.items = mappedUsers;
        this.dataSource.set(newDataSource);
      });
    });
    effect(() => {
      const groups = this.userGroups();
      const calendars = this.calendars();
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
          if (col.datasourceName === 'calendars') {
            return {
              ...col,
              filterOptions: calendars
                .map((c) => ({ value: c.name, viewValue: c.name }))
                .sort((a, b) => a.viewValue.localeCompare(b.viewValue)),
            };
          }
          return col;
        }),
      }));
    });
    effect(() => {
      if (!this.usersLoading() && this.addUserTriggered() && !this.error()) {
        this.showSnackbar('User added successfully');
        this.addUserTriggered.update(() => false);
      }
    });
    effect(()=>{
      if(this.error()){
        this.handleException(new Error(this.error()!), 'There was a problem with your request');
      }
    });
  }

  override load(): void {
    if (!this.usersLoaded() && !this.usersLoading()) {
      this.store.dispatch(UsersActions.loadUsers());
    }
    if (!this.userGroupsLoaded() && !this.userGroupsLoading()) {
      this.store.dispatch(UsersActions.loadUserGroups());
    }
    if (!this.calendarsLoaded() && !this.calendarsLoading()) {
      this.store.dispatch(CalendarsActions.loadCalendars());
    }
  }

  override parseForm(form: UserFormData): PortalUser {
    let item = {
      username: form.data.username,
      name: form.data.name,
      lastName: form.data.lastName,
      role: form.data.roles?.join(',') || '',
      calendarsAsManager: form.data.calendarsAsManager?.map((c) => c.id),
      calendarsAsMember: form.data.calendarsAsMember?.map((c) => c.id),
    } as PortalUser;

    if (form.data.id) item.userId = form.data.id;

    return item;
  }

  addUserOrGroup(form: UserFormData) {
    const user = this.parseForm(form);
    this.store.dispatch(UsersActions.addUser({ user }));
    this.addUserTriggered.update(() => true);
  }
}
