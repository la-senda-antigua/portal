import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class DateTimePickerComponent {
  isAllDay: boolean = false;
  private updatingForm: boolean = false;

  // Start time properties
  startDateValue: Date = new Date('2025-12-10T09:25:00');
  startTimeValue: Date = new Date('2025-12-10T09:25:00');
  startTimeString: string = '2025-12-10T09:25:00';

  // End time properties
  endDateValue: Date = new Date('2025-12-10T18:00:00');
  endTimeValue: Date = new Date('2025-12-10T18:00:00');
  endTimeString: string = '2025-12-10T18:00:00';

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
          // Asigna el error a ambos controles
          form.get('startDateTime')?.setErrors({ invalidDateTimeRange: true });
          form.get('endDateTime')?.setErrors({ invalidDateTimeRange: true });
          return { invalidDateTimeRange: true };
        } else {
          // Limpia el error si es válido
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

  onStartDateChange(event: any) {
    if (this.updatingForm) return;

    if (event) {
      const year = event.getFullYear();
      const month = String(event.getMonth() + 1).padStart(2, '0');
      const day = String(event.getDate()).padStart(2, '0');
      const existingTime = this.startTimeString.split('T')[1];
      this.startTimeString = `${year}-${month}-${day}T${existingTime}`;

      if (this.endDateValue && event > this.endDateValue) {
        const endTime = this.endTimeString.split('T')[1];
        this.endTimeString = `${year}-${month}-${day}T${endTime}`;
        this.endDateValue = new Date(this.endTimeString);
        this.endTimeValue = new Date(this.endTimeString);
      }

      this.updateFormValues();
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
  }

  private updateFormValues() {
    if (this.updatingForm) return;

    this.updatingForm = true;
    this.dateTimeForm.get('startDateTime')?.setValue(this.startTimeString);
    this.dateTimeForm.get('endDateTime')?.setValue(this.endTimeString);
    this.updatingForm = false;

    console.log('errors found', this.dateTimeForm.errors);
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date || !this.startDateValue) {
      return true;
    }
    return date.getTime() >= this.startDateValue.getTime();
  };
}
