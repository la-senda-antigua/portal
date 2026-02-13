import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { PortalUser } from '../../models/PortalUser';
import { UserSelectorComponent } from '../user-selector/user-selector.component';
import { UsersService } from '../../services/users.service';
import { UserGroupsService } from '../../services/userGroups.service';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import {
  getUserColor,
  getInitial,
  getDisplayName,
} from '../../../utils/user.utils';
import { UserGroup } from '../../models/UserGroup';

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
  userCtrl = new FormControl('');
  filteredUsers: Observable<(PortalUser | UserGroup)[]>;
  allUsers: PortalUser[] = [];
  allGroups: UserGroup[] = [];
  protected readonly getUserColor = getUserColor;
  protected readonly getInitial = getInitial;
  protected readonly getDisplayName = getDisplayName;

  constructor(
    public dialogRef: MatDialogRef<AddPeopleFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      calendarId: string;
      groupId?: string;
      existingUsers?: PortalUser[];
    }
  ) {}

  onSelectedUsersChange(users: PortalUser[]) {
    this.selectedUsers = users;
  }

  save() {
    this.selectedUsers.forEach((element) => {
      element.role = 'User';
    });
    this.dialogRef.close(this.selectedUsers);
  }

  close() {
    this.dialogRef.close();
  }
}
