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

    if (this.isEditMode()) {
      const event = data.event;
      initialStartTime = `${event.date}T${event.start}:00`;
      initialEndTime = event.end ? `${event.date}T${event.end}:00` : '';
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
      calendarId: [data.event?.calendarId || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const result = this.eventForm.value;
      const startTime = new Date(result.startTime);
      const endTime = result.endTime ? new Date(result.endTime) : null;

      const finalResult = {
        id: result.id,
        title: result.title,
        description: result.description,
        calendarId: result.calendarId,
        date: this.getDatePart(startTime),
        start: this.getTimePart(startTime),
        end: endTime ? this.getTimePart(endTime) : null,
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
    return date.toISOString().slice(0, 19);
  }

  private getDatePart(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getTimePart(date: Date): string {
    return date.toISOString().split('T')[1].substring(0, 8);
  }
}
