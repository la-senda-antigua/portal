import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DisableConfirmationData {  
  id: string;  
  name: string;  
  actionName?: string;
}

@Component({
  selector: 'app-disable-confirmation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './disable-confirmation.component.html',
  styleUrl: './disable-confirmation.component.scss'
})
export class DisableConfirmationComponent {
  readonly data = inject<DisableConfirmationData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DisableConfirmationComponent>);
  
  close() {
    this.dialogRef.close();
  }

  confirm() {
    const info = {id: this.data.id, actionName: this.data.actionName}
    this.dialogRef.close(info);
  }
}
