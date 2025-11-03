import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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

export interface CalendarFormData extends TableViewFormData {
  data: {
    id?: number;
    title: string;
    startTime: Date;
    endTime?: Date | null;
    description?: string | null;
  };
}

@Component({
  selector: 'app-edit-calendar-form',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TitleCasePipe,],
  templateUrl: './edit-calendar-form.component.html',
  styleUrl: './edit-calendar-form.component.scss',
  providers: [DatePipe],

})
export class EditCalendarFormComponent {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditCalendarFormComponent>);
  readonly formData = inject<CalendarFormData>(MAT_DIALOG_DATA);
  readonly preachersService = inject(PreachersService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);

  readonly calendarForm: FormGroup<{
    title: FormControl<string | null>;
    startTime: FormControl<string | null>;
    endTime: FormControl<string | null>;
    description: FormControl<string | null>;
  }>;

  constructor() {
    this.calendarForm = new FormGroup({
      title: new FormControl(this.formData.data.title, Validators.required),
      startTime: new FormControl(
        this.datePipe.transform(
          this.formData.data.startTime ?? new Date(),
          'yyyy-MM-dd hh:mm a'
        ),
        Validators.required
      ),
      endTime: new FormControl(
        this.datePipe.transform(
          this.formData.data.endTime ?? this.addHours(new Date(), 3),
          'yyyy-MM-dd hh:mm a'
        ),
      ),
      description: new FormControl(this.formData.data.description ?? null),
    });

    this.calendarForm.controls.startTime.valueChanges.subscribe((start) => {
      if (start) {
        const startDate = new Date(start);
        if (!isNaN(startDate.getTime())) {
          const newEndDate = this.addHours(startDate, 3);
          this.calendarForm.controls.endTime.setValue(
            this.datePipe.transform(newEndDate, 'yyyy-MM-dd hh:mm a'),
            { emitEvent: false }
          );
        }
      }
    });
  }

  addHours(date: Date, hoursToAdd: number) {
    return new Date(date.getTime() + (hoursToAdd * 60 * 60 * 1000));
  }

  private toLocalDate(dateStr: string): Date {
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset);
  }


  save() {
    this.dialogRef.close(this.toCalendarFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toCalendarFormData(): CalendarFormData {
    if (this.calendarForm.invalid) {
      return this.formData;
    }

    const start = this.calendarForm.controls.startTime.value!;
    const end = this.calendarForm.controls.endTime?.value;

    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        title: this.calendarForm.controls.title.value!,
        startTime: this.toLocalDate(start),
        endTime: end ? this.toLocalDate(end) : null,
        description: this.calendarForm.controls.description?.value ? this.calendarForm.controls.description.value : null,
      },
    };
  }

}
