import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
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
export class UserSelectorComponent implements OnInit, OnChanges {
  @Input() existingUsers: PortalUser[] = [];
  @Input() initialSelectedUsers: PortalUser[] = [];
  @Input() label: string = 'Add Users';
  @Input() hint: string = '';
  @Input() disabled: boolean = false;
  @Input() allowedUserIds?: string[];
  @Output() selectedUsersChange = new EventEmitter<PortalUser[]>();

  selectedUsers: PortalUser[] = [];
  userCtrl = new FormControl('');
  filteredUsers: Observable<(PortalUser | UserGroup)[]>;
  allUsers: PortalUser[] = [];
  allGroups: UserGroup[] = [];
  private rawUsers: PortalUser[] = [];

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

    if (this.disabled) {
      this.userCtrl.disable();
    }

    this.usersService.getAll().subscribe((result) => {
      this.rawUsers = result;
      this.filterAvailableData();
    });

    this.userGroupsService.getAll().subscribe((result) => {
      this.allGroups = result;
      this.filterAvailableData();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled'] && this.userCtrl) {
      const isDisabled = changes['disabled'].currentValue;
      if (isDisabled) {
        this.userCtrl.disable();
      } else {
        this.userCtrl.enable();
      }
    }
    if (changes['allowedUserIds']) {
      this.filterAvailableData();
    }
  }

  private filterAvailableData() {
    if (this.allowedUserIds && this.allowedUserIds.length > 0) {
      this.allUsers = this.rawUsers.filter((u) =>
        this.allowedUserIds!.includes(u.userId)
      );

      // Filter selected users if the allowedUserIds input has changed and some selected users are no longer allowed (calendarChange for example)
      const validSelectedUsers = this.selectedUsers.filter((u) =>this.allowedUserIds!.includes(u.userId));
      if (validSelectedUsers.length !== this.selectedUsers.length) {
        this.selectedUsers = validSelectedUsers;
        setTimeout(() => {this.selectedUsersChange.emit(this.selectedUsers);});
      }
    } else {
      this.allUsers = [...this.rawUsers];
    }
    this.userCtrl.setValue(this.userCtrl.value);
  }

  private _filter(value: string | PortalUser | UserGroup): (PortalUser | UserGroup)[] {
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = this.normalizeString(value);
    } else if (this.isUser(value)) {
      filterValue = this.normalizeString(value.username);
    } else {
      filterValue = this.normalizeString((value as UserGroup).groupName);
    }

    const existingUserIds = [
      ...this.selectedUsers,
      ...this.existingUsers,
    ].map((user) => user.userId);

    const users = this.allUsers.filter(
      (user) =>
        (
          this.normalizeString(user.username || '').includes(filterValue)
          || this.normalizeString(user.name || '').includes(filterValue)
          || this.normalizeString(user.lastName || '').includes(filterValue)
        )
        && !existingUserIds.includes(user.userId)
    );

    const groups = this.allGroups.filter((group) =>
      this.normalizeString(group.groupName).includes(filterValue)
    );

    return [...users, ...groups];
  }

  private normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  isUser(value: any): value is PortalUser {
    return (value as PortalUser).userId !== undefined;
  }

  remove(user: PortalUser): void {
    if (this.disabled) {
      return;
    }
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
      this.selectedUsersChange.emit(this.selectedUsers);
    }
  }

  onInputBlur(): void {
    setTimeout(() => {
      if (this.userCtrl.value) {
        this.userCtrl.setValue('');
      }
    }, 200);
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
          const isAllowed = this.allUsers.some((u) => u.userId === member.userId);
          if (!isAllowed) {
            return;
          }
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
