import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

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
import { PreachersService } from '../../services/preachers.service';
import { TableViewFormData } from '../table-view/table-view.component';
import { AddPeopleFormComponent } from '../add-people-form/add-people-form.component';
import { PortalUser } from '../../models/PortalUser';

export interface CalendarFormData extends TableViewFormData {
  data: {
    id?: string;
    name: string;
    description?: string | null;
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
  ],
  templateUrl: './edit-calendar-form.component.html',
  styleUrl: './edit-calendar-form.component.scss',
  providers: [DatePipe],
})
export class EditCalendarFormComponent {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditCalendarFormComponent>);
  readonly formData = inject<CalendarFormData>(MAT_DIALOG_DATA);
  readonly preachersService = inject(PreachersService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);
  readonly calendarForm: FormGroup<{
    name: FormControl<string | null>;
  }>;

  selectedUsers: PortalUser[] = [];

  constructor() {
    this.calendarForm = new FormGroup({
      name: new FormControl(this.formData.data.name, Validators.required),
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
      },
    };
  }

  openPeopleModal() {
    const dialogRef = this.dialog.open(AddPeopleFormComponent, {
      data: { calendarId: this.formData.data.id },
      width: '400px',
      height: 'auto',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((selectedUsers) => {
      if (selectedUsers) {
        this.selectedUsers = selectedUsers;
      }
    });
  }

  getRandomColor(userId: string): string {
    const colors = [
      '#f44336',
      '#e91e63',
      '#9c27b0',
      '#673ab7',
      '#3f51b5',
      '#2196f3',
      '#03a9f4',
      '#00bcd4',
      '#009688',
      '#4caf50',
    ];
    const index = userId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }

  getInitial(user: PortalUser): string {
    const name = user.name || user.username;
    return name.charAt(0).toUpperCase();
  }

  remove(user: PortalUser): void {
    const index = this.selectedUsers.indexOf(user);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }
}
