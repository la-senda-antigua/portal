import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableViewFormData } from '../table-view/table-view.component';

@Component({
  selector: 'app-edit-id-name-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    TitleCasePipe,
  ],
  templateUrl: './edit-id-name-form.component.html',
  styleUrl: '../edit-video-form/edit-video-form.component.scss',
})
export class EditIdNameFormComponent {
  readonly dialogRef = inject(MatDialogRef<EditIdNameFormComponent>);
  readonly formData = inject<TableViewFormData>(MAT_DIALOG_DATA);
  readonly form = new FormGroup({
    id: new FormControl({
      value: this.formData.data.id ?? 'id will be set after saving',
      disabled: true,
    }),
    name: new FormControl(this.formData.data.name, Validators.required),
  });

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.toFormData());
  }

  toFormData(): TableViewFormData {
    return {
      ...this.formData,
      data: {
        name: this.form.controls.name.value,
        id: this.formData.data.id,
      },
    };
  }
}
