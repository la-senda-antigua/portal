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
  @Input() startDateRequired: boolean = true;
  @Input() endDateRequired: boolean = false;

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
      startDateTime: new FormControl(
        this.startTimeString,
        this.startDateRequired ? Validators.required : []
      ),
      endDateTime: new FormControl(
        this.endTimeString,
        this.endDateRequired ? Validators.required : []
      ),
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
      this.startTimeString = this.formatAsLocalString(this.startTimeValue);
    }

    if (this.initialEndDate) {
      this.endDateValue = new Date(this.initialEndDate);
      this.endTimeValue = new Date(this.initialEndDate);
      this.endTimeString = this.formatAsLocalString(this.endTimeValue);
    }

    this.isAllDay = this.initialIsAllDay;

    // Update validators based on inputs
    this.dateTimeForm
      .get('startDateTime')
      ?.setValidators(this.startDateRequired ? Validators.required : []);
    this.dateTimeForm
      .get('endDateTime')
      ?.setValidators(this.endDateRequired ? Validators.required : []);
    this.dateTimeForm
      .get('startDateTime')
      ?.updateValueAndValidity({ emitEvent: false });
    this.dateTimeForm
      .get('endDateTime')
      ?.updateValueAndValidity({ emitEvent: false });

    this.updateFormValues();
  }

  private formatAsLocalString(input?: string | Date): string {
    if (!input) return '';
    const d = typeof input === 'string' ? new Date(input) : input;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private getTimePart(dateTimeStr: string, fallback: string = '00:00:00'): string {
    if (!dateTimeStr) return fallback;
    const parts = dateTimeStr.split('T');
    if (parts.length < 2) return fallback;
    const t = parts[1];
    if (!t || t === 'undefined') return fallback;
    return t;
  }

  private getDatePart(dateTimeStr: string, fallbackDate?: Date): string {
    if (dateTimeStr) {
      const parts = dateTimeStr.split('T');
      if (parts.length >= 1 && parts[0] && parts[0] !== 'undefined') return parts[0];
    }
    const d = fallbackDate || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onStartDateChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      const defaultTime = `${String(event.getHours()).padStart(2, '0')}:${String(
        event.getMinutes()
      ).padStart(2, '0')}:00`;
      const existingTime = this.getTimePart(this.startTimeString, defaultTime);
      this.startTimeString = `${year}-${month}-${day}T${existingTime}`;

      // update internal Date objects for start
      this.startDateValue = new Date(this.startTimeString);
      this.startTimeValue = new Date(this.startTimeString);

      if (this.endDateValue && event > this.endDateValue) {
        const endTime = this.getTimePart(this.endTimeString, '00:00:00');
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
      const existingDate = this.getDatePart(this.startTimeString, this.startDateValue);
      this.startTimeString = `${existingDate}T${hours}:${minutes}:${seconds}`;
      this.updateFormValues();
      this.startTimeChange.emit(this.startTimeString);
      // Also emit as a date change so parent forms listening to startDateChange
      // receive updates when only the time is modified.
      this.startDateChange.emit(this.startTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onEndDateChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      const defaultEndTime = `${String(event.getHours()).padStart(2, '0')}:${String(event.getMinutes()).padStart(2, '0')}:00`;
      const existingTime = this.getTimePart(this.endTimeString, defaultEndTime);

      this.endTimeString = `${year}-${month}-${day}T${existingTime}`;

      // if end is before start, move start forward to the same day to keep range valid
      if (this.startDateValue && event < this.startDateValue) {
        const startTime = this.getTimePart(this.startTimeString, '00:00:00');
        this.startTimeString = `${year}-${month}-${day}T${startTime}`;
        this.startDateValue = new Date(this.startTimeString);
        this.startTimeValue = new Date(this.startTimeString);
      }

      // update internal Date objects for end
      this.endDateValue = new Date(this.endTimeString);
      this.endTimeValue = new Date(this.endTimeString);

      this.updateFormValues();
      this.endDateChange.emit(this.endTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onEndTimeChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const hours = String(event.getHours()).padStart(2, '0');
      const minutes = String(event.getMinutes()).padStart(2, '0');
      const seconds = String(event.getSeconds()).padStart(2, '0');
      const existingDate = this.getDatePart(this.endTimeString, this.endDateValue);
      this.endTimeString = `${existingDate}T${hours}:${minutes}:${seconds}`;
      this.updateFormValues();
      this.isAllDayChange.emit(this.isAllDay);
      // Also emit end date change so parent forms listening to endDateChange
      // receive updates when only the time is modified.
      this.endDateChange.emit(this.endTimeString);
      this.isValid.emit(this.dateTimeForm.valid);
    }
  }

  onAllDayChange() {
    if (this.updatingForm) return;

    if (this.isAllDay) {
      const startDate = this.getDatePart(this.startTimeString, this.startDateValue);
      const endDate = this.getDatePart(this.endTimeString, this.endDateValue);

      this.startTimeString = `${startDate}T00:00:00`;
      this.endTimeString = `${endDate}T23:59:59`;

      this.startDateValue = new Date(this.startTimeString);
      this.endDateValue = new Date(this.endTimeString);
      this.startTimeValue = new Date(this.startTimeString);
      this.endTimeValue = new Date(this.endTimeString);
    } else {
      const startDate = this.getDatePart(this.startTimeString, this.startDateValue);
      const endDate = this.getDatePart(this.endTimeString, this.endDateValue);

      this.startTimeString = `${startDate}T09:00:00`;
      this.endTimeString = `${endDate}T18:00:00`;

      this.startDateValue = new Date(this.startTimeString);
      this.endDateValue = new Date(this.endTimeString);
      this.startTimeValue = new Date(this.startTimeString);
      this.endTimeValue = new Date(this.endTimeString);
    }

    this.updateFormValues();
    this.isAllDayChange.emit(this.isAllDay);
    // Emit start/end updates because toggling All-day changes the stored strings
    this.startDateChange.emit(this.startTimeString);
    this.endDateChange.emit(this.endTimeString);
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
