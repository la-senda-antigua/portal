import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-time-picker',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatDatepickerModule,
    FormsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
})
export class DateTimePickerComponent implements OnInit {
  @Input() initialStartDate: string = '';
  @Input() initialEndDate: string = '';
  @Input() initialIsAllDay: boolean = false;

  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() startTimeChange = new EventEmitter<string>();
  @Output() endTimeChange = new EventEmitter<string>();
  @Output() isAllDayChange = new EventEmitter<boolean>();
  @Output() isValid = new EventEmitter<boolean>();

  isAllDay: boolean = this.initialIsAllDay;
  private updatingForm: boolean = false;

  // Start time properties
  startDateValue: Date = new Date(this.initialStartDate);
  startTimeValue: Date = new Date(this.initialStartDate);
  startTimeString: string = this.initialStartDate;

  // End time properties
  endDateValue: Date = new Date(this.initialEndDate);
  endTimeValue: Date = new Date(this.initialEndDate);
  endTimeString: string = this.initialEndDate;

  // Form setup
  dateTimeForm = new FormGroup(
    {
      startDateTime: new FormControl(this.startTimeString, Validators.required),
      endDateTime: new FormControl(this.endTimeString, Validators.required),
    },
    {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const form = control as FormGroup;
        const start = form.get('startDateTime')?.value;
        const end = form.get('endDateTime')?.value;

        if (!start || !end) return null;

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate >= endDate) {
          form.get('startDateTime')?.setErrors({ invalidDateTimeRange: true });
          form.get('endDateTime')?.setErrors({ invalidDateTimeRange: true });
          return { invalidDateTimeRange: true };
        } else {
          const startErrors = form.get('startDateTime')?.errors;
          const endErrors = form.get('endDateTime')?.errors;

          if (startErrors?.['invalidDateTimeRange']) {
            delete startErrors['invalidDateTimeRange'];
            form
              .get('startDateTime')
              ?.setErrors(
                Object.keys(startErrors).length > 0 ? startErrors : null
              );
          }

          if (endErrors?.['invalidDateTimeRange']) {
            delete endErrors['invalidDateTimeRange'];
            form
              .get('endDateTime')
              ?.setErrors(Object.keys(endErrors).length > 0 ? endErrors : null);
          }
          return null;
        }
      },
    }
  );

  ngOnInit() {
    if (this.initialStartDate) {
      this.startDateValue = new Date(this.initialStartDate);
      this.startTimeValue = new Date(this.initialStartDate);
      this.startTimeString = this.initialStartDate;
    }

    if (this.initialEndDate) {
      this.endDateValue = new Date(this.initialEndDate);
      this.endTimeValue = new Date(this.initialEndDate);
      this.endTimeString = this.initialEndDate;
    }

    this.isAllDay = this.initialIsAllDay;
    this.updateFormValues();
  }

  onStartDateChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      const existingTime =
        this.startTimeString.split('T')[1] ||
        `${String(event.getHours()).padStart(2, '0')}:${String(
          event.getMinutes()
        ).padStart(2, '0')}:00`;
      this.startTimeString = `${year}-${month}-${day}T${existingTime}`;

      if (this.endDateValue && event > this.endDateValue) {
        const endTime = this.endTimeString.split('T')[1];
        this.endTimeString = `${year}-${month}-${day}T${endTime}`;
        this.endDateValue = new Date(this.endTimeString);
        this.endTimeValue = new Date(this.endTimeString);
      }

      this.updateFormValues();
      this.startDateChange.emit(this.startTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onStartTimeChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const hours = String(event.getHours()).padStart(2, '0');
      const minutes = String(event.getMinutes()).padStart(2, '0');
      const seconds = String(event.getSeconds()).padStart(2, '0');
      const existingDate = this.startTimeString.split('T')[0];
      this.startTimeString = `${existingDate}T${hours}:${minutes}:${seconds}`;
      this.updateFormValues();
      this.startTimeChange.emit(this.startTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onEndDateChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      const existingTime = this.endTimeString.split('T')[1];
      this.endTimeString = `${year}-${month}-${day}T${existingTime}`;
      this.updateFormValues();
      this.endTimeChange.emit(this.endTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onEndTimeChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const hours = String(event.getHours()).padStart(2, '0');
      const minutes = String(event.getMinutes()).padStart(2, '0');
      const seconds = String(event.getSeconds()).padStart(2, '0');
      const existingDate = this.endTimeString.split('T')[0];
      this.endTimeString = `${existingDate}T${hours}:${minutes}:${seconds}`;
      this.updateFormValues();
      this.isAllDayChange.emit(this.isAllDay);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onAllDayChange() {
    if (this.updatingForm) return;

    if (this.isAllDay) {
      const startDate = this.startTimeString.split('T')[0];
      const endDate = this.endTimeString.split('T')[0];

      this.startTimeString = `${startDate}T00:00:00`;
      this.endTimeString = `${endDate}T23:59:59`;

      this.startDateValue = new Date(this.startTimeString);
      this.endDateValue = new Date(this.endTimeString);
      this.startTimeValue = new Date(this.startTimeString);
      this.endTimeValue = new Date(this.endTimeString);
    } else {
      const startDate = this.startTimeString.split('T')[0];
      const endDate = this.endTimeString.split('T')[0];

      this.startTimeString = `${startDate}T09:00:00`;
      this.endTimeString = `${endDate}T18:00:00`;

      this.startDateValue = new Date(this.startTimeString);
      this.endDateValue = new Date(this.endTimeString);
      this.startTimeValue = new Date(this.startTimeString);
      this.endTimeValue = new Date(this.endTimeString);
    }

    this.updateFormValues();
    this.isAllDayChange.emit(this.isAllDay);
    this.isValid.emit(this.dateTimeForm.valid);
  }

  private updateFormValues() {
    if (this.updatingForm) return;

    this.updatingForm = true;
    this.dateTimeForm.get('startDateTime')?.setValue(this.startTimeString);
    this.dateTimeForm.get('endDateTime')?.setValue(this.endTimeString);
    this.updatingForm = false;
    this.isValid.emit(this.dateTimeForm.valid);
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date || !this.startDateValue) {
      return true;
    }
    return date.getTime() >= this.startDateValue.getTime();
  };
}
