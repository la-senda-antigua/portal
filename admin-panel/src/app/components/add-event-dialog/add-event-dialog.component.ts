import { Component, Inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { CalendarDto } from '../../models/CalendarDto';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';

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
  ],
})
export class AddEventDialogComponent {
  eventForm: FormGroup;
  calendars: CalendarDto[] = [];
  isEditMode = signal(false);
  isDateTimePickerValid: boolean = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.calendars = data.calendars;
    this.isEditMode.set(!!data.event?.id);

    let initialStartTime: string;
    let initialEndTime: string | null;
    let initialIsAllDay: boolean = false;

    if (this.isEditMode()) {
      const event = data.event;
      const endDate = event.endDate || event.date;
      initialStartTime = `${event.date}T${event.start}:00`;
      initialEndTime = event.end ? `${endDate}T${event.end}:00` : '';
      initialIsAllDay = !!event.allDay;
    } else {
      // Para un evento nuevo, usamos la fecha clickeada o la actual.
      const startDate = data.event?.date ? new Date(data.event.date) : new Date();
      startDate.setHours(10, 0, 0, 0); // Default a las 10:00 AM
      initialStartTime = this.convertToISOString(startDate);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1); // Default a 1 hora de duración
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
  }

  onSubmit(): void {
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
