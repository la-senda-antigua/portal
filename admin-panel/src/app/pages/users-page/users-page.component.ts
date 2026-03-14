import {
  Component,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DeleteConfirmationData } from '../../components/delete-confirmation/delete-confirmation.component';
import {
  TableViewColumn,
  TableViewComponent,
} from '../../components/table-view/table-view.component';
import { PortalUser, UserRole } from '../../models/PortalUser';
import { UsersService } from '../../services/users.service';
import { PageBaseComponent } from '../page-base/page-base.component';

import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { EditIdNameFormComponent } from '../../components/edit-id-name-form/edit-id-name-form.component';
import {
  EditUserFormComponent,
  UserFormData,
} from '../../components/edit-user-form/edit-user-form.component';
import {
  selectCalendars,
  selectCalendarsLoaded,
  selectError,
  selectLoadingCalendars,
  selectUserGroups,
  selectUserGroupsLoaded,
  selectUserGroupsLoading,
  selectUsers,
  selectUsersLoaded,
  selectUsersLoading,
} from '../../state/appstate.selectors';
import { CalendarsActions } from '../../state/calendars.actions';
import { UsersActions } from '../../state/users.actions';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { UserGroup, UserGroupDto } from '../../models/UserGroup';
import { AddPeopleFormComponent } from '../../components/add-people-form/add-people-form.component';
import { EditUserGroupFormComponent } from '../../components/edit-user-group-form/edit-user-group-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-users-page',
  imports: [
    MatIconModule,
    MatButtonModule,
    TableViewComponent,
    RouterLink,
    MatMenuModule,
  ],
  providers: [DatePipe],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
})
export class UsersPageComponent extends PageBaseComponent {
  override tableViewComponent = viewChild(TableViewComponent);
  override editForm = EditUserFormComponent;
  override createForm = EditUserFormComponent;
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
  private readonly dialog = inject(MatDialog);
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
  readonly addUserTriggered = signal(false);
  readonly editUserTriggered = signal(false);
  readonly deleteUserTriggered = signal(false);
  readonly addUserGroupTriggered = signal(false);
  readonly updateUserGroupTriggered = signal(false);

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
      if (this.usersLoading() || this.error()) {
        return;
      }
      if (this.addUserTriggered()) {
        this.showSnackbar('User added successfully');
        this.addUserTriggered.update(() => false);
      }
      if (this.editUserTriggered()) {
        this.showSnackbar('User edited successfully');
        this.editUserTriggered.update(() => false);
      }
      if (this.deleteUserTriggered()) {
        this.showSnackbar('User deleted successfully');
        this.deleteUserTriggered.update(() => false);
      }
      if (this.addUserGroupTriggered()) {
        this.showSnackbar('User group added successfully');
        this.addUserGroupTriggered.update(() => false);
      }
      if (this.updateUserGroupTriggered()) {
        this.showSnackbar('User group updated successfully');
        this.updateUserGroupTriggered.update(() => false);
      }
    });
    effect(() => {
      if (this.error()) {
        this.handleException(
          new Error(this.error()!),
          'There was a problem with your request',
        );
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

  override parseUserForm(form: UserFormData): PortalUser {
    const user = {
      username: form.data.username,
      name: form.data.name,
      lastName: form.data.lastName,
      role: form.data.roles?.join(',') || '',
      calendarsAsManager: form.data.calendarsAsManager?.map((c) => c.id),
      calendarsAsMember: form.data.calendarsAsMember?.map((c) => c.id),
      groups: form.data.groups?.map((g) => g.id),
    } as PortalUser;

    if (form.data.id) user.userId = form.data.id;

    return user;
  }

  openAddUserForm() {
    this.tableViewComponent()?.openCreateForm();
  }

  openAddGroupForm() {
    this.tableViewComponent()?.openCreateForm(EditIdNameFormComponent);
  }

  openEditGroupForm(group: UserGroup) {
    const editGroupDialog = this.dialog.open(EditUserGroupFormComponent, {
      data: group,
      width: '400px',
      height: 'calc(60vh + 140px)',
    });
    editGroupDialog.afterClosed().subscribe((result) => this.editGroup(result));
  }

  /** Handles the create request from TableView (create user or usergroup) */
  handleCreateRequest(form: any) {
    if (form.data.username) {
      this.addOrEditUser(form);
      return;
    }
    this.addGroup(form);
  }

  /** Handles the edit request from TableView (edit user) */
  handleEditRequest(form: any) {
    if (form.data.username) {
      this.addOrEditUser(form);
    }
  }

  addOrEditUser(form: UserFormData) {
    const user = this.parseUserForm(form);
    if (user.userId != undefined) {
      this.store.dispatch(
        UsersActions.updateUser({ userId: user.userId, user }),
      );
      this.editUserTriggered.set(true);
    } else {
      this.store.dispatch(UsersActions.addUser({ user }));
      this.addUserTriggered.set(true);
    }
  }

  deleteUser(userId: string) {
    this.store.dispatch(UsersActions.removeUser({ userId }));
    this.deleteUserTriggered.set(true);
  }

  addGroup(form: { data: { name: string } }) {
    const newUserGroup: UserGroupDto = {
      groupName: form.data.name as string,
    };

    this.store.dispatch(UsersActions.addUserGroup({ group: newUserGroup }));
    this.addUserGroupTriggered.set(true);
  }

  editGroup(form: {
    data: { id: string; groupName: string; members: string[] };
  }) {
    this.store.dispatch(
      UsersActions.updateUserGroup({
        groupId: form.data.id,
        userGroup: {
          id: form.data.id,
          groupName: form.data.groupName,
          members: form.data.members,
        },
      }),
    );
    this.updateUserGroupTriggered.set(true);
  }
}
