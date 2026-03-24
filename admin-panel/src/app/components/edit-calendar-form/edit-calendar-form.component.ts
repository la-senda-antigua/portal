import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  getDisplayName,
  getUserColor,
  getUserInitial,
} from '../../../utils/user.utils';
import { CalendarMemberDto } from '../../models/CalendarMemberDto';
import { PortalUser } from '../../models/PortalUser';
import { ExtendedCalendar } from '../../pages/calendars/calendars.facade';
import { AddPeopleFormComponent } from '../add-people-form/add-people-form.component';
import { TableViewFormData } from '../table-view/table-view.component';

export interface CalendarFormData extends TableViewFormData {
  data: ExtendedCalendar;
}

@Component({
  selector: 'app-edit-calentar-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TitleCasePipe,
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule,
  ],
  templateUrl: './edit-calendar-form.component.html',
  styleUrl: './edit-calendar-form.component.scss',
  providers: [DatePipe],
})
export class EditCalendarFormComponent implements OnInit {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditCalendarFormComponent>);
  readonly formData = inject<CalendarFormData>(MAT_DIALOG_DATA);

  readonly selectedCalendar = this.formData.data;

  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);
  readonly calendarForm = computed(() => {
    return new FormGroup({
      name: new FormControl(this.formData.data.name, Validators.required),
      isPublic: new FormControl(this.formData.data.isPublic ?? false),
      isHidden: new FormControl(this.formData.data.isHidden ?? false),
    });
  });
  selectedUsers: CalendarMemberDto[] = [];
  protected readonly getUserColor = getUserColor;
  protected readonly getUserInitial = getUserInitial;
  protected readonly getDisplayName = getDisplayName;

  ngOnInit(): void {
    this.calendarForm().controls.isPublic.valueChanges.subscribe((isPublic) => {
      if (isPublic) {
        this.selectedUsers = this.selectedUsers.filter(
          (user) => user.role === 'Manager',
        );
      }
    });
    this.calendarForm().controls.isHidden.valueChanges.subscribe((isHidden) => {
      if (isHidden) {
        this.calendarForm().controls.isPublic.setValue(false);
        this.selectedUsers = this.selectedUsers.filter(
          (user) => user.role === 'Manager',
        );
      }
    });
    const copyOfMembers = JSON.parse(
      JSON.stringify(this.selectedCalendar.members ?? []),
    );
    const copyOfManagers = JSON.parse(
      JSON.stringify(this.selectedCalendar.managers ?? []),
    );
    this.selectedUsers = [...copyOfMembers, ...copyOfManagers];
  }

  save() {
    this.dialogRef.close(this.toCalendarFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toCalendarFormData(): CalendarFormData {
    if (this.calendarForm().invalid) {
      return this.formData;
    }

    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        ...this.selectedCalendar,
        name: this.calendarForm().controls.name.value!,
        isPublic: this.calendarForm().controls.isPublic.value!,
        isHidden: this.calendarForm().controls.isHidden.value!,
        members: this.selectedUsers.filter((u) => u.role === 'User'),
        managers: this.selectedUsers.filter((u) => u.role === 'Manager'),
      },
    };
  }

  openPeopleModal() {
    const dialogRef = this.dialog.open(AddPeopleFormComponent, {
      data: {
        title: 'Share With',
        calendarId: this.formData.data.id,
        existingUsers: this.selectedUsers,
      },
      width: '400px',
      height: 'auto',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((addedUsers: PortalUser[]) => {
      if (addedUsers) {
        const newMembers: CalendarMemberDto[] = addedUsers.map((u) => ({
          userId: u.userId,
          name: u.name,
          lastName: u.lastName,
          calendarId: this.selectedCalendar.id!,
          username: u.username,
          role: 'User',
        }));
        const existingUsers = this.selectedUsers.filter(
          (existing) =>
            !newMembers.some((selected) => selected.userId === existing.userId),
        );

        const concatUsers = [...existingUsers, ...newMembers];

        if (
          this.calendarForm().controls.isPublic.value ||
          this.calendarForm().controls.isHidden.value
        ) {
          this.selectedUsers = concatUsers.map((u) => ({
            ...u,
            role: 'Manager',
          }));
        } else {
          this.selectedUsers = concatUsers;
        }
      }
    });
  }

  remove(user: CalendarMemberDto): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  deleteCalendar() {
    this.dialogRef.close({
      data: {
        action: 'delete',
        id: this.formData.data.id,
        name: this.formData.data.name,
      },
    });
  }
}
