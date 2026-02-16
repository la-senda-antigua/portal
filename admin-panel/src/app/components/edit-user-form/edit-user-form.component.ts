import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';

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
  readonly preachersService = inject(PreachersService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);
  readonly calendarsService = inject(CalendarsService);
  readonly formData = signal(inject<UserFormData>(MAT_DIALOG_DATA));

  readonly rolesEnum = UserRole;
  readonly roles = Object.values(UserRole) as string[];
  private readonly _calendarList = toSignal(this.calendarsService.getAll());
  /** all calendars sorted alphabetically */
  readonly sortedCalendarList = computed(() => {
    const calendars = this._calendarList();
    return calendars
      ? [...calendars].sort((a, b) => a.name.localeCompare(b.name))
      : [];
  });
  /** calendars that are not in the manager list */
  readonly noManagerCalendars = computed(() => {
    const calendars = this.sortedCalendarList();
    if (!calendars) {
      return [];
    }
    const selectedManagerCalendars = this.selectedManagerCalendars();
    return calendars.filter(
      (calendar) =>
        !selectedManagerCalendars.some(
          (selected) => selected.id === calendar.id,
        ),
    );
  });
  readonly selectedManagerCalendars = signal<CalendarDto[]>([]);
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
    userId: new FormControl(this.formData().data.id || null),
    username: new FormControl(this.formData().data.username, [
      Validators.required,
      Validators.email,
    ]),
    name: new FormControl(this.formData().data.name, [Validators.required]),
    lastName: new FormControl(this.formData().data.lastName, [
      Validators.required,
    ]),
    roles: new FormControl([] as UserRole[], Validators.required),
    calendarsAsManager: new FormControl(
      this.formData().data.calendarsAsManager || [],
    ),
    calendarsAsMember: new FormControl(
      this.formData().data.calendarsAsMember || [],
    ),
  });

  constructor() {
    effect(() => {
      const calendars = this._calendarList();
      const formData = this.formData().data;

      if (calendars && formData.calendarsAsManager) {
        const managerCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsManager,
        );
        this.userForm.controls.calendarsAsManager.setValue(managerCalendars);
      }

      if (calendars && formData.calendarsAsMember) {
        const memberCalendars = this.findCalendarsByIds(
          calendars,
          formData.calendarsAsMember,
        );
        this.userForm.controls.calendarsAsMember.setValue(memberCalendars);
      }
    });
  }

  ngOnInit() {
    this.userForm.controls.roles.valueChanges.subscribe((selectedRoles) => {
      this.handleIsAdminChange(selectedRoles || []);
      if (selectedRoles?.includes(UserRole.CalendarManager)) {
        this.userForm.controls.calendarsAsManager.enable();
      } else {
        this.userForm.controls.calendarsAsManager.disable();
        this.userForm.controls.calendarsAsManager.setValue([]);
      }
    });
    this.userForm.controls.roles.setValue(
      this.formData().data.roles ?? [UserRole.User],
    );
    this.userForm.controls.calendarsAsManager.valueChanges.subscribe(
      (selectedManagerCalendars) => {
        this.selectedManagerCalendars.set(selectedManagerCalendars || []);
      },
    );
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

  save() {
    this.dialogRef.close(this.toUserFormData());
  }

  close() {
    this.dialogRef.close();
  }

  /**
   * If Admin is selected:
    - set roles to only Admin
    - disable calendars dropdown (manager of, is disabled when role is not CalendarManager)
    - remove all calendars from both manager and member lists
    If Admin is not selected:
    - if User role is not selected, select it (all user types have User role except Admin)
    - enable calendars dropdown
   * @param selectedRoles the roles selcted in the dropdown
   */
  private handleIsAdminChange(selectedRoles: UserRole[]) {
    if (selectedRoles?.includes(UserRole.Admin)) {
      this.userForm.controls.roles.setValue([UserRole.Admin], {
        emitEvent: false,
      });
      this.isAdmin.set(true);
      this.userForm.controls.calendarsAsMember.disable();
      this.userForm.controls.calendarsAsMember.setValue([]);
      this.userForm.controls.calendarsAsManager.setValue([]);
    } else {
      this.isAdmin.set(false);
      if (!selectedRoles?.includes(UserRole.User)) {
        selectedRoles?.push(UserRole.User);
        this.userForm.controls.roles.setValue(selectedRoles, {
          emitEvent: false,
        });
      }
      this.userForm.controls.calendarsAsMember.enable();
    }
  }

  private toUserFormData(): UserFormData {
    if (this.userForm.invalid) {
      return this.formData();
    }
    return {
      mode: this.formData().mode,
      type: this.formData().type,
      data: {
        id: this.formData().data.id,
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
