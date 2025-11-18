import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from '../../services/users.service';
import { PortalUser } from '../../models/PortalUser';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-add-people-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogContent,
    MatChipsModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-people-form.component.html',
  styleUrl: './add-people-form.component.scss',
})
export class AddPeopleFormComponent {
  selectedUsers: PortalUser[] = [];
  userCtrl = new FormControl('');
  filteredUsers: Observable<PortalUser[]>;
  allUsers: PortalUser[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPeopleFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      calendarId: string;
      existingUsers?: PortalUser[];
    },
    private usersService: UsersService
  ) {
    this.usersService.getAll().subscribe((result) => {
      this.allUsers = result;
    });

    this.filteredUsers = this.userCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string | PortalUser): PortalUser[] {
    const filterValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : value.username.toLowerCase();

    const existingUserIds = [
      ...this.selectedUsers,
      ...(this.data.existingUsers || []),
    ].map((user) => user.userId);

    return this.allUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(filterValue) &&
        !existingUserIds.includes(user.userId)
    );
  }

  remove(user: PortalUser): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as PortalUser;
    if (!this.selectedUsers.find((u) => u.userId === user.userId)) {
      this.selectedUsers.push(user);
      this.userCtrl.setValue('');
    }
  }

  displayFn(user: PortalUser): string {
    return user ? `${user.name} (${user.username})` : '';
  }

  getRandomColor(userId: string): string {
    const colors = [
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#009688',
      '#4CAF50',
      '#8BC34A',
      '#FF9800',
      '#FF5722',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
  }

  getInitial(user: PortalUser): string {
    const name = user.name || user.username;
    return name.charAt(0).toUpperCase();
  }

  getDisplayName(user: PortalUser): string {
    if (user.name) {
      return user.name.split(' ')[0];
    }
    return user.username.split('@')[0];
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
