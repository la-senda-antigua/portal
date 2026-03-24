import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  startWith
} from 'rxjs/operators';
import { CalendarDto } from '../../models/CalendarDto';
import { CalendarMemberConflict } from '../../models/CalendarMemberDto';
import { PortalUser } from '../../models/PortalUser';
import { CalendarsService } from '../../services/calendars.service';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { UserSelectorComponent } from '../user-selector/user-selector.component';

export interface DialogData {
  calendars: CalendarDto[];
  event?: any;
}

@Component({
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss'],
  standalone: true,
  providers: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    DateTimePickerComponent,
    UserSelectorComponent,
    MatProgressBar,
  ],
})
export class AddEventDialogComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  calendars: CalendarDto[] = [];
  isDateTimePickerValid: boolean = true;
  assignees: PortalUser[] = [];
  allowedUserIds: any[] = [];

  private calendarSubscription?: Subscription;
  private availabilityCheckTrigger$ = new Subject<void>();

  isEditMode = signal(false);
  isCheckingAvailability = signal(false);
  userSelectionChanged = signal(false);
  assigneesConflicts = signal<CalendarMemberConflict[]>([]);

  conflictsMessage = computed(() => {
    const conflicts = this.assigneesConflicts();
    if (conflicts.length === 0) return '';

    if (conflicts.length === 1) {
      const c = conflicts[0];
      const calendarNames = c.conflicts.map((cal: any) => cal.name).join(', ');
      return `${c.user.name} ${c.user.lastName} has a conflict with other calendar (${calendarNames}) at this date and time. If you continue, a warning will be presented in the calendar app.`;
    }

    const names = conflicts
      .map((c) => `${c.user.name} ${c.user.lastName}`)
      .join(', ');
    return `The following users have conflicts with other calendars at this date and time. If you continue, a warning will be presented in the calendar app. ${names}`;
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private calendarsService: CalendarsService,
    private destroyRef: DestroyRef
  ) {
    this.calendars = data.calendars;
    this.isEditMode.set(!!data.event?.id);
    if (data.event?.assignees) {
      this.assignees = data.event.assignees;
    }

    let initialStartTime: string;
    let initialEndTime: string | null;
    let initialIsAllDay: boolean = false;

    if (data.event) {
      if (data.event.start) {
        initialStartTime = `${data.event.date}T${data.event.start}:00`;
      } else {
        const startDate = new Date(data.event.date);
        startDate.setHours(10, 0, 0, 0);
        initialStartTime = this.convertToISOString(startDate);
        data.event.allDay = false;
      }

      if (data.event.end) {
        const endDate = data.event.endDate || data.event.date;
        initialEndTime = `${endDate}T${data.event.end}:00`;
      } else {
        const startDate = new Date(data.event.date);
        startDate.setHours(10, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);
        initialEndTime = this.convertToISOString(endDate);
      }

      initialIsAllDay = !!data.event.allDay;
    } else {
      const startDate = new Date();
      startDate.setHours(10, 0, 0, 0);
      initialStartTime = this.convertToISOString(startDate);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);
      initialEndTime = this.convertToISOString(endDate);
    }

    this.eventForm = this.fb.group({
      id: [data.event?.id || null],
      title: [data.event?.title || '', Validators.required],
      description: [data.event?.description || ''],
      startTime: [initialStartTime, Validators.required],
      endTime: [initialEndTime],
      allDay: [initialIsAllDay],
      calendarId: [data.event?.calendarId || '', Validators.required],
    });

    this.updateTitleValidator();
  }

  updateTitleValidator() {
    const titleControl = this.eventForm.get('title');

    if (!this.assignees || this.assignees.length === 0) {
      titleControl?.setValidators([Validators.required]);
    } else {
      titleControl?.clearValidators();
    }

    titleControl?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.availabilityCheckTrigger$
      .asObservable()
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(200))
      .subscribe(() => {
        this.checkAssigneesAvailabilityNow();
      });

    const calendarControl = this.eventForm.get('calendarId');
    if (calendarControl) {
      this.calendarSubscription = calendarControl.valueChanges
        .pipe(startWith(calendarControl.value))
        .subscribe((value) => {
          const status = value ? 'enable' : 'disable';
          this.eventForm.get('title')?.[status]();
          this.eventForm.get('description')?.[status]();

          this.allowedUserIds = [];

          const calendar = this.calendars.find((c) => c.id === (value ?? ''));
          if (calendar && !calendar.isPublic && !calendar.isHidden) {
            const members = calendar.members || [];
            const managers = calendar.managers || [];
            this.allowedUserIds = [...members, ...managers].map(
              (m: any) => m.userId,
            );
          }
        });
    }

    this.checkAssigneesAvailability();
  }

  ngOnDestroy(): void {
    this.calendarSubscription?.unsubscribe();
  }

  onAssigneesChange(users: PortalUser[]) {
    this.assignees = users;
    this.userSelectionChanged.set(true);
    this.updateTitleValidator();
    this.checkAssigneesAvailability();
  }

  checkAssigneesAvailability(): void {
    this.availabilityCheckTrigger$.next();
  }

  private checkAssigneesAvailabilityNow(): void {
    this.isCheckingAvailability.set(true);

    const userIds = this.assignees.map((u) => u.userId);
    if (userIds.length === 0 || !this.isDateTimePickerValid) {
      this.assigneesConflicts.set([]);
      this.isCheckingAvailability.set(false);
      return;
    }

    const startTime = this.eventForm.get('startTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;

    this.calendarsService
      .checkUserAvailability(userIds, startTime, endTime)
      .subscribe({
        next: (assigneeConflicts) => {
          const currentEventId = this.eventForm.value['id'] || null;
          if (currentEventId) {
            assigneeConflicts = assigneeConflicts.map((assigneeConflict) => ({
              ...assigneeConflict,
              conflicts: assigneeConflict.conflicts.filter(
                (conflict) => conflict.eventId !== currentEventId,
              ),
            }));
            assigneeConflicts = assigneeConflicts.filter(
              (assigneeConflict) => assigneeConflict.conflicts.length > 0,
            );
          }

          this.assigneesConflicts.set(assigneeConflicts);
          this.isCheckingAvailability.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isCheckingAvailability.set(false);
          this.assigneesConflicts.set([]);
        },
      });
  }

  save(trigger: string): void {
    if (this.eventForm.valid) {
      const result = this.eventForm.value;
      const startTime = result.startTime;
      const endTime = result.endTime ? result.endTime : null;

      const finalResult = {
        id: result.id,
        title: result.title,
        description: result.description,
        calendarId: result.calendarId,
        start: startTime,
        allDay: result.allDay,
        end: endTime ? endTime : null,
        assignees: this.assignees,
        trigger: trigger,
      };

      this.dialogRef.close(finalResult);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDateTimePickerValidityChange(isValid: boolean) {
    this.isDateTimePickerValid = isValid;
  }

  private convertToISOString(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }
}
