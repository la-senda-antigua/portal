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
import { provideNativeDateAdapter } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { CalendarDto } from '../../models/CalendarDto';

export interface DialogData {
  calendars: CalendarDto[];
  event?: any;
}

@Component({
  selector: 'app-add-event-dialog',
  templateUrl: './add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.scss'],
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
})
export class AddEventDialogComponent {
  eventForm: FormGroup;
  calendars: CalendarDto[] = [];
  isEditMode = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.calendars = data.calendars;
    this.isEditMode.set(!!data.event?.id);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.eventForm = this.fb.group({
      id: [data.event?.id || null],
      title: [data.event?.title || '', Validators.required],
      description: [data.event?.description || ''],
      date: [data.event?.dateStr || todayStr, Validators.required],

      start: [data.event?.start || '10:00', Validators.required],
      end: [data.event?.end || ''],
      calendarId: [data.event?.calendarId || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const result = this.eventForm.value;

      if (this.isEditMode()) {
        // Modo edición
        this.dialogRef.close({
          ...result,
          id: this.data.event.id, // Mantenemos el ID original
        });
      } else {
        // Modo creación
        this.dialogRef.close(result);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
