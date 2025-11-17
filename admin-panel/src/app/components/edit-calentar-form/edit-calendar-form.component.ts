import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

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
    id?: string;
    name: string;
    description?: string | null;
  };
}

@Component({
  selector: 'app-edit-calentar-form',
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
    name: FormControl<string | null>;
    description: FormControl<string | null>;
  }>;

  constructor() {
    this.calendarForm = new FormGroup({
      name: new FormControl(this.formData.data.name, Validators.required),
      description: new FormControl(this.formData.data.description ?? null),
    });
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

    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        name: this.calendarForm.controls.name.value!,
        description: this.calendarForm.controls.description?.value
          ? this.calendarForm.controls.description.value
          : null,
      },
    };
  }
}
