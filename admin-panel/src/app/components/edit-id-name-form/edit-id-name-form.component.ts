import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  ],
  templateUrl: './edit-id-name-form.component.html',
  styleUrl: './edit-id-name-form.component.scss',
})
export class EditIdNameFormComponent {
  readonly dialogRef = inject(MatDialogRef<EditIdNameFormComponent>);
  readonly formData = inject<{ id?: string; name: string }>(MAT_DIALOG_DATA);
  readonly form = new FormGroup({
    id: new FormControl(this.formData.id),
    name: new FormControl(this.formData.name, Validators.required),
  });
}
