import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, map, startWith } from 'rxjs';
import { PortalUser } from '../../models/PortalUser';
import { UserGroup } from '../../models/UserGroup';
import { UsersService } from '../../services/users.service';
import { UserGroupsService } from '../../services/userGroups.service';
import { getDisplayName, getInitial, getUserColor } from '../../../utils/user.utils';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
})
export class UserSelectorComponent implements OnInit {
  @Input() existingUsers: PortalUser[] = [];
  @Input() initialSelectedUsers: PortalUser[] = [];
  @Input() label: string = 'Add Users';
  @Input() hint: string = '';
  @Output() selectedUsersChange = new EventEmitter<PortalUser[]>();

  selectedUsers: PortalUser[] = [];
  userCtrl = new FormControl('');
  filteredUsers: Observable<(PortalUser | UserGroup)[]>;
  allUsers: PortalUser[] = [];
  allGroups: UserGroup[] = [];

  protected readonly getUserColor = getUserColor;
  protected readonly getInitial = getInitial;
  protected readonly getDisplayName = getDisplayName;

  private usersService = inject(UsersService);
  private userGroupsService = inject(UserGroupsService);

  constructor() {
    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  ngOnInit(): void {
    this.selectedUsers = [...this.initialSelectedUsers];

    this.usersService.getAll().subscribe((result) => {
      this.allUsers = result;
      this.userCtrl.setValue(this.userCtrl.value);
    });

    this.userGroupsService.getAll().subscribe((result) => {
      this.allGroups = result;
      this.userCtrl.setValue(this.userCtrl.value);
    });
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
      ...this.existingUsers,
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
      this.selectedUsersChange.emit(this.selectedUsers);
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
          const isExisting = this.existingUsers.some((u) => u.userId === member.userId);

          if (!isSelected && !isExisting) {
            this.selectedUsers.push({
              userId: member.userId,
              username: member.username,
              name: member.name,
              role: 'User',
            });
          }
        });
      }
    }
    this.userCtrl.setValue('');
    this.selectedUsersChange.emit(this.selectedUsers);
  }

  displayFn(value: PortalUser | UserGroup): string {
    if (!value) return '';
    if ((value as PortalUser).userId !== undefined) {
      const user = value as PortalUser;
      return `${user.name} (${user.username})`;
    }
    return `${(value as UserGroup).groupName} (Group)`;
  }
}
