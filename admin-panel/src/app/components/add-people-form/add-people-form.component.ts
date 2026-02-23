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
