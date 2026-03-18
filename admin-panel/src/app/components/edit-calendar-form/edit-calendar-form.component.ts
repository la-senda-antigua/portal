import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';

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
import {
  getInitial,
  getUserColor,
  getDisplayName,
} from '../../../utils/user.utils';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CalendarMemberDto,
} from '../../models/CalendarMemberDto';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface CalendarFormData extends TableViewFormData {
  data: {
    id?: string;
    name: string;
    isPublic?: boolean;
    isHidden?: boolean;
    description?: string | null;
    selectedUsers?: CalendarMemberDto[];
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
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule
  ],
  templateUrl: './edit-calendar-form.component.html',
  styleUrl: './edit-calendar-form.component.scss',
  providers: [DatePipe],
})
export class EditCalendarFormComponent implements OnInit {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditCalendarFormComponent>);
  readonly formData = signal(inject<CalendarFormData>(MAT_DIALOG_DATA));
  readonly calendarsService = inject(CalendarsService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);
  readonly calendarForm = computed(() => {
    return new FormGroup({
      name: new FormControl(this.formData().data.name, Validators.required),
      isPublic: new FormControl(this.formData().data.isPublic ?? false),
      isHidden: new FormControl(this.formData().data.isHidden ?? false),
    });
  });
  selectedUsers: CalendarMemberDto[] = [];
  loadingUsers = signal(true);

  protected readonly getUserColor = getUserColor;
  protected readonly getInitial = getInitial;
  protected readonly getDisplayName = getDisplayName;

  ngOnInit(): void {
    if (this.formData().mode != 'add') {
      this.getDetails();
    }
    this.calendarForm().controls.isPublic.valueChanges.subscribe((isPublic) => {
      if (isPublic) {
        this.selectedUsers = this.selectedUsers.filter((user) => user.role === 'Manager');
      }
    });
    this.calendarForm().controls.isHidden.valueChanges.subscribe((isHidden) => {
      if (isHidden) {
        this.calendarForm().controls.isPublic.setValue(false);
        this.selectedUsers = this.selectedUsers.filter((user) => user.role === 'Manager');
      }
    });
  }

  getDetails() {
    this.loadingUsers.set(true);
  }

  save() {
    this.dialogRef.close(this.toCalendarFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toCalendarFormData(): CalendarFormData {
    if (this.calendarForm().invalid) {
      return this.formData();
    }
    
    return {
      mode: this.formData().mode,
      type: this.formData().type,
      data: {
        id: this.formData().data.id,
        name: this.calendarForm().controls.name.value!,
        isPublic: this.calendarForm().controls.isPublic.value!,
        isHidden: this.calendarForm().controls.isHidden.value!,
        selectedUsers: this.selectedUsers,
      },
    };
  }

  openPeopleModal() {
    const dialogRef = this.dialog.open(AddPeopleFormComponent, {
      data: {
        title: 'Share With',
        calendarId: this.formData().data.id,
        existingUsers: this.selectedUsers,
      },
      width: '400px',
      height: 'auto',
      maxWidth: '90vw',
    });

    dialogRef.afterClosed().subscribe((selectedUsers: CalendarMemberDto[]) => {
      if (selectedUsers) {
        const existingUsers = this.selectedUsers.filter(
          (existing) =>
            !selectedUsers.some(
              (selected: CalendarMemberDto) => selected.userId === existing.userId,
            ),
        );

        if(this.calendarForm().controls.isPublic.value || this.calendarForm().controls.isHidden.value) {
          selectedUsers = selectedUsers.map(u => ({...u, role: 'Manager'}));
        }

        this.selectedUsers = [...existingUsers, ...selectedUsers];
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
        id: this.formData().data.id,
        name: this.formData().data.name,
      },
    });
  }
}
