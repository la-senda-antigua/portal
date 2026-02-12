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
import { UserRole } from '../../models/PortalUser';

export interface UserFormData extends TableViewFormData {
  data: {
    id?: string;
    username: string;
    name: string;
    lastName: string;
    roles?: UserRole[];
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

  readonly rolesEnum = UserRole;
  readonly roles = Object.values(UserRole) as string[];
  readonly calendarList = toSignal(this.calendarsService.getAll());
  readonly selectedManagerCalendars = signal<CalendarDto[]>([]);
  readonly selectedMemberCalendars = signal<CalendarDto[]>([]);
  readonly isAdmin = signal(false);

  readonly userForm: FormGroup<{
    userId: FormControl<string | null>;
    username: FormControl<string | null>;
    name: FormControl<string | null>;
    lastName: FormControl<string | null>;
    roles: FormControl<UserRole[] | null>;
    calendarsAsManager: FormControl<CalendarDto[] | null>;
    calendarsAsMember: FormControl<CalendarDto[] | null>;
  }> = new FormGroup({
    userId: new FormControl(this.formData.data.id || null),
    username: new FormControl(this.formData.data.username, [
      Validators.required,
      Validators.email,
    ]),
    name: new FormControl(this.formData.data.name, [Validators.required]),
    lastName: new FormControl(this.formData.data.lastName, [
      Validators.required,
    ]),
    roles: new FormControl([] as UserRole[], Validators.required),
    calendarsAsManager: new FormControl(
      this.formData.data.calendarsAsManager || [],
    ),
    calendarsAsMember: new FormControl(
      this.formData.data.calendarsAsMember || [],
    ),
  });

  constructor() {
    effect(() => {
      const calendars = this.calendarList();
      const formData = this.formData.data;

      if (calendars && formData.calendarsAsManager) {
        const managerCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsManager,
        );
        this.userForm.controls.calendarsAsManager.setValue(managerCalendars);
        this.selectedManagerCalendars.set(managerCalendars);
      }

      if (calendars && formData.calendarsAsMember) {
        const memberCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsMember,
        );
        this.userForm.controls.calendarsAsMember.setValue(memberCalendars);
        this.selectedMemberCalendars.set(memberCalendars);
      }
    });
  }

  ngOnInit() {
    this.userForm.controls.roles.valueChanges.subscribe((selectedRoles) => {
      if (selectedRoles?.includes(UserRole.Admin)) {
        this.userForm.controls.roles.setValue([UserRole.Admin], {
          emitEvent: false,
        });
        this.isAdmin.set(true);
      } else {
        this.isAdmin.set(false);
      }
    });
    this.userForm.controls.roles.setValue(this.formData.data.roles ?? []);
  }

  private findCalendarsByIds(
    allCalendars: CalendarDto[],
    selectedCalendars: CalendarDto[],
  ): CalendarDto[] {
    return allCalendars.filter((calendar) =>
      selectedCalendars.some((selected) => selected.id === calendar.id),
    );
  }

  compareCalendars(calendar1: CalendarDto, calendar2: CalendarDto): boolean {
    return calendar1?.id === calendar2?.id;
  }

  compareRoles(role1: UserRole, role2: UserRole): boolean {
    return role1 === role2;
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
        roles: this.userForm.controls.roles.value || [],
        calendarsAsManager:
          this.userForm.controls.calendarsAsManager.value || [],
        calendarsAsMember: this.userForm.controls.calendarsAsMember.value || [],
      },
    };
  }
}
