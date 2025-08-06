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

export interface DeleteConfirmationData {
  // Used to communicate between components what element is being deleted
  id: string;
  // Users will be prompted to enter this text as confirmation
  matchingString: string;
  // This name is presented to users to let them know what they are deleting
  name: string;
}

@Component({
  selector: 'app-delete-confirmation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
  ],
  templateUrl: './delete-confirmation.component.html',
  styleUrl: './delete-confirmation.component.scss',
})
export class DeleteConfirmationComponent {
  readonly data = inject<DeleteConfirmationData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteConfirmationComponent>);
  readonly userInput = new FormControl('', Validators.required);
  readonly doesUserInputMatch = signal<boolean>(false);

  constructor() {
    this.userInput.valueChanges.subscribe((value) => {
      if (value == this.data.matchingString) {
        this.doesUserInputMatch.set(true);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  confirm() {
    this.dialogRef.close(this.data.id);
  }
}
