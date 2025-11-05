import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, } from '@angular/core';

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

export interface PublicEventFormData extends TableViewFormData {
  data: {
    id?: number;
    title: string;
    startTime: Date;
    endTime?: Date | null;
    description?: string | null;
  };
}

@Component({
  selector: 'app-edit-public-event-form',
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
  templateUrl: './edit-public-event-form.component.html',
  styleUrl: './edit-public-event-form.component.scss',
  providers: [DatePipe],

})
export class EditPublicEventFormComponent {
  readonly formBuilder = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<EditPublicEventFormComponent>);
  readonly formData = inject<PublicEventFormData>(MAT_DIALOG_DATA);
  readonly preachersService = inject(PreachersService);
  readonly datePipe = inject(DatePipe);
  readonly dialog = inject(MatDialog);

  readonly publicEventForm: FormGroup<{
    title: FormControl<string | null>;
    startTime: FormControl<string | null>;
    endTime: FormControl<string | null>;
    description: FormControl<string | null>;
  }>;

  constructor() {
    this.publicEventForm = new FormGroup({
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

    this.publicEventForm.controls.startTime.valueChanges.subscribe((start) => {
      if (start) {
        const startDate = new Date(start);
        if (!isNaN(startDate.getTime())) {
          const newEndDate = this.addHours(startDate, 3);
          this.publicEventForm.controls.endTime.setValue(
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
    this.dialogRef.close(this.toPublicEventFormData());
  }

  close() {
    this.dialogRef.close();
  }

  private toPublicEventFormData(): PublicEventFormData {
    if (this.publicEventForm.invalid) {
      return this.formData;
    }

    const start = this.publicEventForm.controls.startTime.value!;
    const end = this.publicEventForm.controls.endTime?.value;

    return {
      mode: this.formData.mode,
      type: this.formData.type,
      data: {
        id: this.formData.data.id,
        title: this.publicEventForm.controls.title.value!,
        startTime: new Date(this.publicEventForm.controls.startTime.value!),
        endTime: this.publicEventForm.controls.endTime ? new Date(this.publicEventForm.controls.endTime.value!) : null,
        description: this.publicEventForm.controls.description?.value ? this.publicEventForm.controls.description.value : null,
      },
    };
  }

}
