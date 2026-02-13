import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { PortalUser, UserRole } from '../../models/PortalUser';
import { UserSelectorComponent } from '../user-selector/user-selector.component';

@Component({
  selector: 'app-add-people-form',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogModule,
    UserSelectorComponent,
  ],
  templateUrl: './add-people-form.component.html',
  styleUrl: './add-people-form.component.scss',
})
export class AddPeopleFormComponent {
  selectedUsers: PortalUser[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPeopleFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      calendarId: string;
      groupId?: string;
      existingUsers?: PortalUser[];
    },
    private usersService: UsersService
    ,private userGroupsService: UserGroupsService
  ) {

  onSelectedUsersChange(users: PortalUser[]) {
    this.selectedUsers = users;
  }

    this.usersService.getAll().subscribe((result) => {
      this.allUsers = result;
    });
    this.userGroupsService.getAll().subscribe((result) => {
      this.allGroups = result;
    });

    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string | PortalUser | UserGroup): (PortalUser | UserGroup)[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (this.isUser(value)) {
      filterValue = value.username.toLowerCase();
    } else {
      filterValue = (value as UserGroup).groupName.toLowerCase();
    }

    const existingUserIds = [
      ...this.selectedUsers,
      ...(this.data.existingUsers || []),
    ].map((user) => user.userId);

    const users = this.allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(filterValue) &&
        !existingUserIds.includes(user.userId)
    );

    const groups = this.allGroups.filter((group) =>
      group.groupName.toLowerCase().includes(filterValue)
    );

    return [...users, ...groups];
  }

  isUser(value: any): value is PortalUser {
    return (value as PortalUser).userId !== undefined;
  }

  remove(user: PortalUser): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;

    if (this.isUser(value)) {
      const user = value as PortalUser;
      if (!this.selectedUsers.find((u) => u.userId === user.userId)) {
        this.selectedUsers.push(user);
      }
    } else {
      const group = value as UserGroup;
      if (group.members) {
        group.members.forEach((member) => {
          const isSelected = this.selectedUsers.some((u) => u.userId === member.userId);
          const isExisting = (this.data.existingUsers || []).some((u) => u.userId === member.userId);

          if (!isSelected && !isExisting) {
            this.selectedUsers.push({
              userId: member.userId,
              username: member.username,
              name: member.name,
              role: [UserRole.User].toString(),
            });
          }
        });
      }
    }
    this.userCtrl.setValue('');
  }

  displayFn(value: PortalUser | UserGroup): string {
    if (!value) return '';
    if ((value as PortalUser).userId !== undefined) {
      const user = value as PortalUser;
      return `${user.name} (${user.username})`;
    }
    return `${(value as UserGroup).groupName} (Group)`;
  }

  save() {
    this.selectedUsers.forEach((element) => {
      element.role = [UserRole.User].toString();
    });
    this.dialogRef.close(this.selectedUsers);
  }

  close() {
    this.dialogRef.close();
  }
}
