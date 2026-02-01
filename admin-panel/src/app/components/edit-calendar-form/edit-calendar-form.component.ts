import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

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
import { TableViewFormData } from '../table-view/table-view.component';
import { AddPeopleFormComponent } from '../add-people-form/add-people-form.component';
import { PortalUser } from '../../models/PortalUser';
import { CalendarsService } from '../../services/calendars.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { getInitial, getUserColor, getDisplayName } from '../../../utils/user.utils';

export interface CalendarFormData extends TableViewFormData {
  data: {
    id?: string;
    name: string;
    description?: string | null;
    selectedUsers?: PortalUser[];
  };
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
    MatProgressBar,
  ],
  templateUrl: './edit-calendar-form.component.html',
  styleUrl: './edit-calendar-form.component.scss',
  providers: [DatePipe],
})
export class EditCalendarFormComponent implements OnInit {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditCalendarFormComponent>);
  readonly formData = inject<CalendarFormData>(MAT_DIALOG_DATA);
  readonly calendarsService = inject(CalendarsService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);
  readonly calendarForm: FormGroup<{
    name: FormControl<string | null>;
  }>;
  selectedUsers: PortalUser[] = [];
  loadingUsers = signal(true);

  protected readonly getUserColor = getUserColor;
  protected readonly getInitial = getInitial;
  protected readonly getDisplayName = getDisplayName;

  constructor() {
    this.calendarForm = new FormGroup({
      name: new FormControl(this.formData.data.name, Validators.required),
    });
  }

  ngOnInit(): void {
    if (this.formData.mode != 'add') {
      this.getDetails();
    }
  }

  getDetails() {
    this.loadingUsers.set(true);
    this.calendarsService.getById(this.formData.data.id!).subscribe({
      next: (data) => {
        const members = data.members!.map((member) => ({
          ...(member as PortalUser),
          role: 'User',
        }));
        const managers = data.managers!.map((manager) => ({
          ...(manager as PortalUser),
          role: 'Manager',
        }));
        this.selectedUsers = [...members, ...managers];
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
      },
    });
  }

  save() {
    this.dialogRef.close(this.toCalendarFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toCalendarFormData(): CalendarFormData {
    if (this.calendarForm.invalid) {
      return this.formData;
    }

    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        name: this.calendarForm.controls.name.value!,
        selectedUsers: this.selectedUsers,
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

    dialogRef.afterClosed().subscribe((selectedUsers) => {
      if (selectedUsers) {
        const existingUsers = this.selectedUsers
        .filter((existing) => !selectedUsers
        .some((selected: PortalUser) => selected.userId === existing.userId));

        this.selectedUsers = [...existingUsers, ...selectedUsers];
      }
    });
  }

  remove(user: PortalUser): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }
}
