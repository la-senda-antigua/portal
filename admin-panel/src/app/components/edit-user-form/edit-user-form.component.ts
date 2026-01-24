import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';

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
import { CalendarDto } from '../../models/CalendarDto';
import { CalendarsService } from '../../services/calendars.service';
import { toSignal } from '@angular/core/rxjs-interop';

export interface UserFormData extends TableViewFormData {
  data: {
    id?: string;
    username: string;
    name: string;
    lastName: string;
    role?: string;
    calendarsAsManager?: CalendarDto[];
    calendarsAsMember?: CalendarDto[];
  };
}

@Component({
  selector: 'app-edit-user-form',
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
  templateUrl: './edit-user-form.component.html',
  styleUrl: './edit-user-form.component.scss',
  providers: [DatePipe],
})
export class EditUserFormComponent {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditUserFormComponent>);
  readonly formData = inject<UserFormData>(MAT_DIALOG_DATA);
  readonly preachersService = inject(PreachersService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);

  readonly calendarsService = inject(CalendarsService);

  readonly roles = [
    'Admin',
    'CalendarManager',
    'MediaManager',
    'BroadcastManager',
    'User',
  ];
  readonly calendarList = toSignal(this.calendarsService.getAll());
  readonly selectedManagerCalendars = signal<CalendarDto[]>([]);
  readonly selectedMemberCalendars = signal<CalendarDto[]>([]);

  readonly userForm: FormGroup<{
    username: FormControl<string | null>;
    name: FormControl<string | null>;
    lastName: FormControl<string | null>;
    role: FormControl<string | null>;
    calendarsAsManager: FormControl<CalendarDto[] | null>;
    calendarsAsMember: FormControl<CalendarDto[] | null>;
  }> = new FormGroup({
    username: new FormControl(this.formData.data.username, [
      Validators.required,
      Validators.email,
    ]),
    name: new FormControl(this.formData.data.name, [Validators.required,]),
    lastName: new FormControl(this.formData.data.lastName, [Validators.required,]),
    role: new FormControl(this.formData.data.role || 'User', Validators.required),
    calendarsAsManager: new FormControl(
      this.formData.data.calendarsAsManager || []
    ),
    calendarsAsMember: new FormControl(
      this.formData.data.calendarsAsMember || []
    ),
  });

  constructor() {
    effect(() => {
      const calendars = this.calendarList();
      const formData = this.formData.data;

      if (calendars && formData.calendarsAsManager) {
        const managerCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsManager
        );
        this.userForm.controls.calendarsAsManager.setValue(managerCalendars);
        this.selectedManagerCalendars.set(managerCalendars);
      }

      if (calendars && formData.calendarsAsMember) {
        const memberCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsMember
        );
        this.userForm.controls.calendarsAsMember.setValue(memberCalendars);
        this.selectedMemberCalendars.set(memberCalendars);
      }
    });
  }

  private findCalendarsByIds(
    allCalendars: CalendarDto[],
    selectedCalendars: CalendarDto[]
  ): CalendarDto[] {
    return allCalendars.filter((calendar) =>
      selectedCalendars.some((selected) => selected.id === calendar.id)
    );
  }

  compareCalendars(calendar1: CalendarDto, calendar2: CalendarDto): boolean {
    return calendar1?.id === calendar2?.id;
  }

  save() {
    this.dialogRef.close(this.toUserFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toUserFormData(): UserFormData {
    if (this.userForm.invalid) {
      return this.formData;
    }
    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        username: this.userForm.controls.username.value!,
        name: this.userForm.controls.name.value!,
        lastName: this.userForm.controls.lastName.value!,
        role: this.userForm.controls.role.value!,
        calendarsAsManager:
          this.userForm.controls.calendarsAsManager.value || [],
        calendarsAsMember: this.userForm.controls.calendarsAsMember.value || [],
      },
    };
  }
}
